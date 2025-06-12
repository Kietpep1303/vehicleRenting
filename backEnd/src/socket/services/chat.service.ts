import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { ChatEntity } from '../entities/chat.entity';
import { SocketGateway } from '../socket.gateway';

// Imports cloudinary service.
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports error handling.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes } from '../../errorHandler/errorCodes';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    // Create a new chat session.
    async createChatSession(senderId: number, receiverId: number) {
        const chat = this.chatRepository.create({
            senderId,
            receiverId,
            message: [],
            createdAt: generateDate(),
        });
        return await this.chatRepository.save(chat);
    }

    // Check if a chat session exists.
    async checkChatSession(senderId: number, receiverId: number) {
        const chat = await this.chatRepository.findOne({ where: [ { senderId, receiverId }, { senderId: receiverId, receiverId: senderId } ] });
        return chat ? chat : null;
    }

    // Check if a chat session exists.
    async checkChatSessionById(sessionId: number) {
        const chat = await this.chatRepository.findOne({ where: { id: sessionId } });
        return chat ? chat : null;
    }

    // Store a new message in the chat session.
    async storeMessage(
        sessionId: number, 
        message: {
            senderId: number;
            receiverId: number;
            type: 'text' | 'image';
            content: string;
        },
        image?: Express.Multer.File[],
    ) 
    {
        // Validate and upload image messages
        if (message.type === 'image') {
            
            // Ensure a file is provided.
            if (!image?.[0]) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Image file is required', HttpStatus.BAD_REQUEST);
            const file = image[0];

            // Validate MIME type.
            if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
                throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Invalid image type, only PNG or JPEG allowed', HttpStatus.BAD_REQUEST);
            }
            // Validate file size (max 5MB).
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Image must be smaller than 5 MB', HttpStatus.BAD_REQUEST);

            // Upload to Cloudinary.
            const uploadedImage = await this.cloudinaryService.uploadImage(file, 'chat');
            message.content = uploadedImage.secure_url;
        }
        
        // Get the chat session.
        const chat = await this.chatRepository.findOne({ where: { id: sessionId } });
        if (!chat) return null;

        // Check if the message array is more than 50 messages, delete the oldest message.
        if (chat.message.length >= 50) {
            chat.message.shift();
        }

        // Store the message.
        chat.message.push({ ...message, createdAt: generateDate() });
        return await this.chatRepository.save(chat);
    }

    // Get all messages in a chat session.
    async getMessages(sessionId: number) {
        const chat = await this.chatRepository.findOne({ where: { id: sessionId } });
        if (!chat) return null;

        return chat.message;
    }

    // Get all chat sessions for a user with pagination.
    async getChatSessions(userId: number, page: number, limit: number) {
        
        // Get all chat sessions for the user.
        const [sessions, total] = await this.chatRepository.findAndCount({
            where: [
                { senderId: userId },
                { receiverId: userId },
            ],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        // For each session, only keep the first element of the message array
        const data = sessions.map(session => ({
            ...session,
            message: session.message.length
            ? [ session.message[session.message.length - 1 ] ]
            : [],
        }));
    
        return { sessions: data, total };
    }
}