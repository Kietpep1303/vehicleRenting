import { Controller, Get, Post, Body, HttpStatus, Query, Req, UseGuards, ParseIntPipe, HttpCode, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Imports dto.
import { SendMessageDto } from '../dto/send-message.dto';
import { AiSendMessageDto } from '../dto/ai-send-message.dto';

// Imports file interceptor.
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports chat services.
import { ChatService } from '../services/chat.service';

// Imports chat entities.
import { ChatEntity } from '../entities/chat.entity';
import { ChatUserEntity } from '../entities/chatUser.entity';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

const N8N_LINK = 'http://10.0.1.2:5678/webhook/ai-chat';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard) 
@RequiredAccountLevel(1)
@Controller('api/chat')
export class GetMessageController {

    constructor(
        private readonly chatService: ChatService,
        private readonly httpService: HttpService,
    ) {}

    // Create a new chat session.
    @Post('create-chat-session')
    @HttpCode(HttpStatus.CREATED)
    async createChatSession(
        @Req() req: any,
        @Body('userId') userId: number[]
    ) {
        try {
            const ownerId = req.user.userId;
            const participants = [ownerId, ...userId];
            // Check if the chat session already exists.
            const existingSession = await this.chatService.checkChatSessionWithUserId(participants);
            if (existingSession) return { status: HttpStatus.OK, message: 'Chat session already exists.', data:{
                id: existingSession.id,
                userId: existingSession.users.map((user: ChatUserEntity) => user.userId),
                updatedAt: existingSession.updatedAt,
                createdAt: existingSession.createdAt
            }};

            // Create a new chat session.
            const chat = await this.chatService.createChatSession(participants);
            return { status: HttpStatus.CREATED, message: 'Chat session created successfully.', data: {
                id: chat.id,
                userId: chat.users.map((user: ChatUserEntity) => user.userId),
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt
            }};
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_CHAT_SESSION, 'Failed to create chat session', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create a new chat session with AI.
    @Post('create-chat-session-ai')
    @HttpCode(HttpStatus.CREATED)
    async createChatSessionAi(@Req() req: any) {
        try {
            const userId = req.user.userId;
            const participants = [userId, 0];

            // Check if the chat session already exists.
            const existingSession = await this.chatService.checkChatSessionWithUserId(participants);
            if (existingSession) return { status: HttpStatus.OK, message: 'Chat session already exists.', data:{
                id: existingSession.id,
                userId: existingSession.users.map((user: ChatUserEntity) => user.userId),
                updatedAt: existingSession.updatedAt,
                createdAt: existingSession.createdAt
            }};

            // Create a new chat session.
            const chat = await this.chatService.createChatSession(participants);
            return { status: HttpStatus.CREATED, message: 'Chat session created successfully.', data: {
                id: chat.id,
                userId: chat.users.map((user: ChatUserEntity) => user.userId),
                updatedAt: chat.updatedAt,
                createdAt: chat.createdAt
            }};
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_CHAT_SESSION, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Send a message to the chat session.
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 1 },
        ],
        {
            storage: memoryStorage(),
            limits: { fileSize: 1024 * 1024 * 5 }, // Limit the file size to 5MB.
        }),
    )
    @Post('send-message')
    @HttpCode(HttpStatus.CREATED)
    async sendMessage(
        @Req() req: any,
        @Body() dto: SendMessageDto,
        @UploadedFiles() files: {
            image?: Express.Multer.File[],
        },
    ) {
        try {
            // Check if the user is allowed to send a message.
            const senderId = req.user.userId;
            const member = await this.chatService.checkUserInChatSession(senderId, dto.sessionId);
            if (!member) {
                throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'Can not send message to this chat session', HttpStatus.FORBIDDEN);
            }

            // Store the message.
            if (dto.type === 'image') {
                await this.chatService.storeMessage(dto.sessionId, {
                    senderId,
                    type: dto.type,
                    content: dto.content,
                }, files.image);
            } else {
                await this.chatService.storeMessage(dto.sessionId, {
                    senderId,
                    type: dto.type,
                    content: dto.content,
                });
            }
            return { status: HttpStatus.CREATED, message: 'Message sent successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_STORE_MESSAGE, 'Failed to store message', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Send a message to AI chat session.
    @Post('send-message-ai')
    @HttpCode(HttpStatus.CREATED)
    async sendMessageAi(
        @Req() req: any,
        @Body('sessionId') sessionId: number,
        @Body('type') type: 'text',
        @Body('content') content: string,
    ) {
        try {
            // Validate the request body.
            if (!sessionId || !type || !content) {
                throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Invalid DTO request', HttpStatus.BAD_REQUEST);
            }

            // Check if the user is allowed to send a message.
            const senderId = req.user.userId;
            const member = await this.chatService.checkUserInChatSession(senderId, sessionId);
            if (!member) {
                throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'Can not send message to this chat session', HttpStatus.FORBIDDEN);
            }
            
            // Check if the chat session is an AI chat session.
            const chat = await this.chatService.checkChatSessionWithUserId([0]);
            if (!chat) {
                throw new ErrorHandler(ErrorCodes.CHAT_SESSION_NOT_FOUND, 'This chat session is not an AI chat session', HttpStatus.FORBIDDEN);
            }

            // Send message to the chat session.
            await this.chatService.storeMessage(sessionId, {
                senderId,
                type,
                content,
            });

            // Call the n8n.
            firstValueFrom(
                this.httpService.post(N8N_LINK, {
                    sessionId,
                    senderId,
                    type,
                    content,
                }),
            ).catch(err => {
                console.error('[n8n webhook] call failed:', {
                    message: err?.message,
                    status: err?.response?.status,
                    statusText: err?.response?.statusText,
                    data: err?.response?.data,
                    url: N8N_LINK,
                    payload: { sessionId, senderId, type, content }
                });
            });

            return { status: HttpStatus.CREATED, message: 'Message sent successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_STORE_MESSAGE, 'Failed to store message', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // AI send message to the chat session.
    @Post('ai-send-message')
    @HttpCode(HttpStatus.CREATED)
    async aiSendMessage(
        @Req() req: any,
        @Body() dto: AiSendMessageDto
    ) {
        try {
            // Check if the user is allowed to send a message.
            const senderId = req.user.userId;
            
            // If does not AI, return error.
            if (senderId !== 0) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'Can not send message to this chat session', HttpStatus.FORBIDDEN);

            // Get the message content.
            let messageContent;
            switch (dto.type) {
                case 'text':
                    messageContent = dto.content;
                    break;
                case 'vehicle':
                    messageContent = dto.vehicles;
                    break;
                case 'rental-confirmation':
                    messageContent = dto.data;
                    break;
                case 'rental':
                    messageContent = dto.data;
                    break;
            }

            // Send message to the chat session.
            await this.chatService.storeMessage(dto.sessionId, {
                senderId,
                type: dto.type,
                content: messageContent,
            });
            
            return { status: HttpStatus.CREATED, message: 'Message sent successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.FAILED_TO_STORE_MESSAGE, 'Failed to store message', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}