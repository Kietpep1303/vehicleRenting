import { Injectable, Logger, UseGuards, UseFilters, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Imports jwt service.
import { JwtService } from '@nestjs/jwt';

// Imports error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes }   from '../../errorHandler/errorCodes';
import { SocketExceptionFilter } from '../../errorHandler/socketException.filter';

// Imports socket guard.
import { SocketJwtGuard } from '../guard/socket-jwt.guard';

// Imports socket gateway.
import { SocketGateway } from './socket.gateway';

// Imports chat service and entities.
import { ChatService } from '../services/chat.service';
import { ChatUserEntity } from '../entities/chatUser.entity';
import { ChatMessageEntity } from '../entities/chatMessage.entity';

// Imports repository.
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
@UseGuards(SocketJwtGuard)
@UseFilters(SocketExceptionFilter)
@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway extends SocketGateway {

    constructor(
        jwtService: JwtService,
        @InjectRepository(ChatUserEntity) private readonly chatUserRepository: Repository<ChatUserEntity>,
        @InjectRepository(ChatMessageEntity) private readonly chatMessageRepository: Repository<ChatMessageEntity>,
        @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService,
    ) {
        super(jwtService);
    }

    // Join the chat list.
    @SubscribeMessage('joinChatList')
    async handleJoinChatList(
        @MessageBody() { userId, page = 1, limit = 10 }: { userId: number, page: number, limit: number },
        @ConnectedSocket() client: Socket,
    ) {

        // Check if the user is allowed to join the chat list.
        if (client.data.user.userId !== userId) {
            throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not allowed', HttpStatus.FORBIDDEN);
        }

        const room = `chat_room_${userId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);

        const history = await this.chatService.getUserChatSessions(userId, page, limit);
        client.emit('chatListMessage', history);
    }

    // Join the chat session.
    @SubscribeMessage('joinSession')
    async handleJoinSession(
        @MessageBody() { sessionId, page = 1, limit = 10 }: { sessionId: number, page: number, limit: number },
        @ConnectedSocket() client: Socket,
    ) {

        // Check if the user is allowed to join the chat session.
        const userId = client.data.user.userId;
        const member = await this.chatUserRepository.findOne({ where: { sessionId, userId } });
        if (!member) {
            throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'Can not join this chat session', HttpStatus.FORBIDDEN);
        }

        // Join the chat session.
        const room = `chat_session_${sessionId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);

        const history = await this.chatService.getPaginatedMessages(sessionId, page, limit);
        client.emit('chatSessionMessage', { sessionId, ...history });
    }

 
}