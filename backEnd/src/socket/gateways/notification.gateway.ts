import { Injectable, Logger, UseGuards, UseFilters, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Imports jwt service.
import { JwtService } from '@nestjs/jwt';

// Imports socket gateway.
import { SocketGateway } from './socket.gateway';

// Imports socket guard.
import { SocketJwtGuard } from '../guard/socket-jwt.guard';

// Imports error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes }   from '../../errorHandler/errorCodes';
import { SocketExceptionFilter } from '../../errorHandler/socketException.filter';

// Imports notification service.
import { NotificationService } from '../services/notification.service';

@Injectable()
@UseGuards(SocketJwtGuard)
@UseFilters(SocketExceptionFilter)
@WebSocketGateway({ cors: true, namespace: '/notifications' })
export class NotificationGateway extends SocketGateway {


    constructor(
        jwtService: JwtService,
        @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService,
    ) {
        super(jwtService);
    }
    
    // Handle client join room.
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
            // console.log(notification);
            this.sendToUser(userId, 'rentalNotification', notification);
        }
    }

    isUserOnline(userId: number): boolean {

        if (!this.server || !this.server.adapter) {
            return false;
        }

        const adapter: any = this.server.adapter as any; 
        const room = adapter.rooms.get(`user_${userId}`);
        // console.log(`[DEBUG] isUserOnline(${userId}): room=`, room, `size=${room?.size || 0}`);
        // console.log(`[DEBUG] All rooms:`, [...adapter.rooms.keys()]);

        return !!room && room.size > 0;
    }
}