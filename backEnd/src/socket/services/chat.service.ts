import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, In } from 'typeorm';

// Imports chat entities.
import { ChatEntity } from '../entities/chat.entity';
import { ChatUserEntity } from '../entities/chatUser.entity';
import { ChatMessageEntity } from '../entities/chatMessage.entity';

// Imports chat gateway.
import { ChatGateway } from '../gateways/chat.gateway';

// Imports notification service.
import { NotificationService } from './notification.service';

// Imports cloudinary service.
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

// Imports get user info service.
import { GetUserInfoService } from '../../user/services/getUserInfo.service';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports error handling.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes } from '../../errorHandler/errorCodes';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>,
        @InjectRepository(ChatUserEntity) private readonly chatUserRepository: Repository<ChatUserEntity>,
        @InjectRepository(ChatMessageEntity) private readonly chatMessageRepository: Repository<ChatMessageEntity>,
        private readonly cloudinaryService: CloudinaryService,
        @Inject(forwardRef(() => ChatGateway)) private readonly chatGateway: ChatGateway,
        @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
        private readonly getUserInfoService: GetUserInfoService,
    ) {}

    // Create a new chat session.
    async createChatSession(userId: number[]) {
        try {
            // Check if chat session already exists for these exact users.
            const existingSession = await this.chatUserRepository
                .createQueryBuilder('chatUser')
                .select('chatUser.sessionId', 'sessionId')
                .where('chatUser.userId IN (:...userId)', { userId })
                .groupBy('chatUser.sessionId')
                .having('COUNT(chatUser.sessionId) = :count', { count: userId.length })
                .getRawOne();
            
            if (existingSession) {
                throw new ErrorHandler(ErrorCodes.CHAT_SESSION_ALREADY_EXISTS, 'Chat session already exists', HttpStatus.CONFLICT);
            }

            // Create a new chat session.
            const chat = this.chatRepository.create({
                createdAt: generateDate(),
                updatedAt: generateDate(),
                lastMessageId: -1,
            });
            const savedChat = await this.chatRepository.save(chat);

            // Link users to the chat session.
            const chatUsers = userId.map((id) => this.chatUserRepository.create({
                sessionId: savedChat.id,
                userId: id,
            }));
            await this.chatUserRepository.save(chatUsers);

            return savedChat;
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_CHAT_SESSION, 'Failed to create chat session', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Check if the chat session exists.
    async checkChatSession(sessionId: number) {
        const chat = await this.chatRepository.findOne({ where: { id: sessionId } });
        return chat ? chat : null;
    }

    // Check if the chat session exists with userIds.
    async checkChatSessionWithUserId(userId: number[]) {
        const existingSession = await this.chatUserRepository
            .createQueryBuilder('chatUser')
            .select('chatUser.sessionId', 'sessionId')
            .where('chatUser.userId IN (:...userId)', { userId })
            .groupBy('chatUser.sessionId')
            .having('COUNT(chatUser.sessionId) = :count', { count: userId.length })
            .getRawOne();
        
        if (!existingSession || !existingSession.sessionId) return null;

        const chat = await this.chatRepository.findOne({
            where: { id: existingSession.sessionId },
            relations: ['users'],
        });
        return chat ? chat : null;
    }

    // Check if the user is in the chat session.
    async checkUserInChatSession(userId: number, sessionId: number) {
        const chatUser = await this.chatUserRepository.findOne({ where: { userId, sessionId } });
        return chatUser ? chatUser : null;
    }

    // Store a new message in the chat session.
    async storeMessage(
        sessionId: number,
        message: {
            senderId: number,
            type: 'text' | 'image' | 'vehicle',
            content: any,
        },
        image?: Express.Multer.File[],
    ) {
        try {
            // Validate and upload image.
            if (message.type === 'image') {
                // Ensure image is provided.
                if (!image || image.length === 0) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Image file is required', HttpStatus.BAD_REQUEST);
                const file = image[0];

                // Validate MINE type.
                if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
                    throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Invalid image type, only PNG or JPEG allowed', HttpStatus.BAD_REQUEST);
                }

                // Validate file size (max 5MB).
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Image must be smaller than 5 MB', HttpStatus.BAD_REQUEST);

                // Upload image to Cloudinary.
                const uploadedImage = await this.cloudinaryService.uploadImage(file, 'chat');
               
                // Store image URL in message.
                message.content = uploadedImage.secure_url;
            }

            // Get the chat session.
            const chat = await this.chatRepository.findOne({ where: { id: sessionId } });
            if (!chat) return;

            // Get the sender information.
            const sender = await this.getUserInfoService.findUserById(message.senderId);
            if (!sender) return;

            // Insert the message into the database.
            const storeMessage = this.chatMessageRepository.create({
                sessionId,
                senderId: message.senderId,
                type: message.type,
                content: message.content,
                createdAt: generateDate(),
            });
            const savedMessage = await this.chatMessageRepository.save(storeMessage);

            // Update the chat session with the new message.
            await this.chatRepository.update(sessionId, {
                lastMessageId: savedMessage.id,
                updatedAt: savedMessage.createdAt,
            });

            // Get all users in the chat session.
            const users = await this.chatUserRepository.find({ where: { sessionId } });

            // Send the new message to all users in the chat session.
            this.chatGateway.server
                .to(`chat_session_${sessionId}`)
                .emit('chatSessionMessageUpdate', { sessionId, data: {
                    id: savedMessage.id,
                    senderId: savedMessage.senderId,
                    type: savedMessage.type,
                    content: savedMessage.content,
                    createdAt: savedMessage.createdAt,
                    senderName: sender.nickname,
                    senderAvatar: sender.avatar,
                }});

            // Refresh the user's chat list.
            for (const user of users) {
                this.chatGateway.server
                    .to(`chat_room_${user.userId}`)
                    .emit('chatListMessageUpdate', { sessionId, data: {
                        id: savedMessage.id,
                        senderId: savedMessage.senderId,
                        type: savedMessage.type,
                        content: savedMessage.content,
                        createdAt: savedMessage.createdAt,
                        senderName: sender.nickname,
                        senderAvatar: sender.avatar,
                }});
                if (user.userId !== message.senderId) {
                    await this.notificationService.notifyNewMessage(user.userId, {
                        sessionId,
                        senderId: savedMessage.senderId,
                        type: savedMessage.type,
                        content: savedMessage.content,
                        createdAt: savedMessage.createdAt,
                        senderName: sender.nickname,
                        senderAvatar: sender.avatar,
                    });
                }
            }
            return savedMessage;
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_STORE_MESSAGE, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get pagination of messages in the chat session. [PAGINATION]
    async getPaginatedMessages(sessionId: number, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [messages, total] = await this.chatMessageRepository.findAndCount({
            where: { sessionId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
            relations: ['sender'],
        });
        
        const totalPages = Math.ceil(total / limit);

        // Map each message into the minimal payload format
        const result = messages.map(message => ({
            id: message.id,
            senderId: message.senderId,
            type: message.type,
            content: message.content,
            createdAt: message.createdAt,
            senderName: message.sender.nickname,
            senderAvatar: message.sender.avatar,
        }));

        return {
            messages: result,
            total,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    // Get all chat sessions of a user. [PAGINATION]
    async getUserChatSessions(userId: number, page: number = 1, limit: number = 10) {
        // Find all the chat sessions the user is in
        const chatUsers = await this.chatUserRepository.find({ where: { userId } });
        const sessionIds = chatUsers.map(cu => cu.sessionId);
        if (sessionIds.length === 0) {
            return {
                sessions: [],
                total: 0,
                currentPage: page,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            };
        }

        // Paginate chat sessions sorted by updatedAt descending
        const skip = (page - 1) * limit;
        const [chats, total] = await this.chatRepository.findAndCount({
            where: { id: In(sessionIds) },
            order: { updatedAt: 'DESC' },
            skip,
            take: limit,
        });

        // Fetch each session's last message
        const lastIds = chats.map(c => c.lastMessageId).filter(id => id !== -1);
        const lastMessages = lastIds.length
            ? await this.chatMessageRepository.find({
                    where: { id: In(lastIds) },
                    relations: ['sender'],
                })
            : [];

        // Map the last message onto each session
        const sessions = chats.map(chat => {
            const lastMessage = lastMessages.find(m => m.id === chat.lastMessageId);
            const data = lastMessage ? {
                senderId: lastMessage.senderId,
                type: lastMessage.type,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                senderName: lastMessage.sender.nickname,
                senderAvatar: lastMessage.sender.avatar,
            } : null;
            return { sessionId: chat.id, data };
        });

        // Return with pagination metadata
        const totalPages = Math.ceil(total / limit);
        return {
            sessions,
            total,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }
}