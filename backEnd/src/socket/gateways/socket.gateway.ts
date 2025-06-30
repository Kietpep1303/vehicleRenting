import { Injectable, Logger, UseGuards, UseFilters, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Imports socket guard.
import { SocketJwtGuard } from '../guard/socket-jwt.guard';

// Imports jwt service.
import { JwtService } from '@nestjs/jwt'; 

// Imports error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes }   from '../../errorHandler/errorCodes';
import { SocketExceptionFilter } from '../../errorHandler/socketException.filter';

@Injectable()
@UseGuards(SocketJwtGuard)
@UseFilters(SocketExceptionFilter)
@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(
        private readonly jwtService: JwtService
    ) {}

    @WebSocketServer() server: Server;
    protected logger = new Logger('SocketGateway');

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

    // Handle client connection.
    handleConnection(client: Socket) {
        const user = client.data.user as any;
        this.logger.log(`Client connected: userId=${user.userId}`);
    }

    // Handle client disconnection.
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Send message to user.
    sendToUser(userId: number, purpose: string, data: any) {
        this.server.to(`user_${userId}`).emit(purpose, data);
    }
}