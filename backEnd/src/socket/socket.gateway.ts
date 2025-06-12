import { Injectable, Logger, UseGuards, UseFilters, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketJwtGuard } from './guard/socket-jwt.guard';
import { JwtService } from '@nestjs/jwt'; 

// Imports error handler.
import { ErrorHandler } from '../errorHandler/errorHandler';
import { ErrorCodes } from '../errorHandler/errorCodes';
import { SocketExceptionFilter } from '../errorHandler/socketException.filter';

// Imports socket services.
import { NotificationService } from './services/notification.service';
import { ChatService } from './services/chat.service';

@Injectable()
@UseGuards(SocketJwtGuard)
@UseFilters(SocketExceptionFilter)
@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => ChatService)) private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
    ) {}

    @WebSocketServer() server: Server;
    private logger = new Logger('SocketGateway');

    afterInit(server: Server) {
        server.use((socket: Socket, next) => {
            const token = socket.handshake.auth?.accessToken as string;
            if (!token) {
                next(new ErrorHandler(ErrorCodes.TOKEN_NOT_PROVIDED_OR_EXPIRED, 'Expired or invalid access token', HttpStatus.UNAUTHORIZED));
            }
            try {
                const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
                socket.data.user = payload;
                return next();
            } catch (error) {
                return next(new ErrorHandler(ErrorCodes.FAILED_TO_VERIFY_TOKEN, 'Failed to verify access token', HttpStatus.UNAUTHORIZED));
            }
        });
        this.logger.log('SocketGateway initialized');
    }

    // User connects to the server.
    handleConnection(client: Socket) {
        const user = client.data.user;
        this.logger.log(`Client connected: ${client.id} (user ${user.userId})`);
    }

    // User disconnects from the server.
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Check if the user is online.
    isUserOnline(userId: number) {
        const room = this.server.sockets.adapter.rooms.get(`user_${userId}`);
        if (room) return true;
        else return false;
    }

    // Send message to user.
    sendToUser(purpose: string, event: any, userId: number) {
        this.server.to(`user_${userId}`).emit(purpose, event);
    }

    // User join room.
    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @MessageBody() { userId }: { userId: number },
        @ConnectedSocket() client: Socket,
    ) {
        // Check if the user is allowed to join the room.
        if (client.data.user.userId !== userId) {
            throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not allowed', HttpStatus.FORBIDDEN);
        }
        // Join user room.
        const room = `user_${userId}`;
        client.join(room);

        this.logger.log(`Client ${client.id} joined room ${room}`);

        // Get pending notifications.
        const notifications = await this.notificationService.getPendingNotifications(userId);
        for (const notification of notifications) {
            this.sendToUser('rentalNotification', notification, userId);
            await this.notificationService.deleteNotification(notification.id);
        }
    }

    // Send message to user.
    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @MessageBody()
        { sessionId, receiverId, type, content }: 
        { sessionId: number, receiverId: number, type: 'text' | 'image', content: string },
        @ConnectedSocket() client: Socket,
    ) {
        const senderId = client.data.user.userId;
        const savedChat = await this.chatService.storeMessage(sessionId, { senderId, receiverId, type, content });
        if (!savedChat) {
            throw new ErrorHandler(ErrorCodes.FAILED_TO_STORE_MESSAGE, 'Failed to store message', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const newMessage = savedChat.message[savedChat.message.length - 1];

        const previewPayload = {
            sessionId,
            preview: {
                senderId,
                type: newMessage.type,
                content: newMessage.content,
                createdAt: newMessage.createdAt,
            },
        };

        // Send the preview to the receiver and the sender.
        this.sendToUser('sessionUpdated', previewPayload, receiverId);
        this.sendToUser('sessionUpdated', previewPayload, senderId);

        // Send the message to the receiver.
        this.sendToUser('chatMessage', { sessionId, message: newMessage }, receiverId);

        // Send the message to the sender.
        client.emit('newMessage', { sessionId, message: newMessage });
    }
}
    
