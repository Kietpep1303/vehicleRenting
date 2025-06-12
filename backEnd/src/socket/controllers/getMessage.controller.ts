import { Controller, Get, Post, Body, HttpStatus, Query, Req, UseGuards, ParseIntPipe, HttpCode } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports chat services.
import { ChatService } from '../services/chat.service';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(1)
@Controller('api/chat')
export class GetMessageController {

    constructor(
        private readonly chatService: ChatService,
    ) {}

    // Create a new chat session.
    @Post('create-chat-session')
    @HttpCode(HttpStatus.CREATED)
    async createChatSession(
        @Req() req: any, 
        @Body('receiverId') receiverId: number) {
        try {
            if (!receiverId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Receiver ID is required', HttpStatus.BAD_REQUEST);

            // Check if the chat session exists.
            const chatSession = await this.chatService.checkChatSession(req.user.userId, receiverId);
            if (chatSession) throw new ErrorHandler(ErrorCodes.CHAT_SESSION_ALREADY_EXISTS, 'Chat session already exists', HttpStatus.BAD_REQUEST);

            // Create a new chat session.
            const newSession = await this.chatService.createChatSession(req.user.userId, receiverId);
            return {
                status: HttpStatus.CREATED,
                message: 'Chat session created successfully.',
                data: newSession,
            }
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_CHAT_SESSION, 'Failed to create chat session', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
        
    // Get all messages a user has.
    @Get('get-all-messages')
    async getAllMessages(@Req() req: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        try {
            // Get all messages a user has.
            const messages = await this.chatService.getChatSessions(req.user.userId, page, limit);
            return { status: HttpStatus.OK, message: 'Messages fetched successfully.', data: messages };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_MESSAGES, 'Failed to get messages', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all messages in a chat session.
    @Get('get-messages-in-session')
    async getMessagesInSession(@Req() req: any, @Query('sessionId') sessionId: number) {
        try {
            // Check if the chat session exists.
            const chatSession = await this.chatService.checkChatSessionById(sessionId);
            if (!chatSession) throw new ErrorHandler(ErrorCodes.CHAT_SESSION_NOT_FOUND, 'Chat session not found', HttpStatus.BAD_REQUEST);

            // Check if the user is a part of the chat session.
            if (chatSession.senderId !== req.user.userId && chatSession.receiverId !== req.user.userId) throw new ErrorHandler(ErrorCodes.CHAT_SESSION_NOT_FOUND, 'Chat session not found', HttpStatus.BAD_REQUEST);

            // Get all messages in a chat session.
            const messages = await this.chatService.getMessages(sessionId);
            return { status: HttpStatus.OK, message: 'Messages fetched successfully.', data: messages };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_MESSAGES, 'Failed to get messages', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}