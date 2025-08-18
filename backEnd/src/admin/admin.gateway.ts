import { Injectable, Logger, UseGuards, UseFilters, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Imports jwt service.
import { JwtService } from '@nestjs/jwt';

// Imports error handler.
import { ErrorHandler } from '../errorHandler/errorHandler';
import { ErrorCodes }   from '../errorHandler/errorCodes';
import { SocketExceptionFilter } from '../errorHandler/socketException.filter';

// Imports account level guard.
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

// Imports socket guard.
import { SocketJwtGuard } from '../socket/guard/socket-jwt.guard';

// Imports socket gateway.
import { SocketGateway } from '../socket/gateways/socket.gateway';

// Imports admin service.
import { AdminService } from './services/admin.service';

// Imports repository.
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
@UseGuards(SocketJwtGuard, AccountLevelGuard)
@RequiredAccountLevel(3)
@UseFilters(SocketExceptionFilter)
@WebSocketGateway({ cors: true, namespace: '/admin' })
export class AdminGateway extends SocketGateway {

    constructor(
        jwtService: JwtService,
        @Inject(forwardRef(() => AdminService)) private readonly adminService: AdminService,
    ) {
        super(jwtService);
    }

    // Get the requested user level 2.
    @SubscribeMessage('getRequestedUserLevel2')
    async getRequestedUserLevel2(
        @MessageBody() { page = 1, limit = 10 }: { page: number, limit: number },
        @ConnectedSocket() client: Socket,
    ) {

        // Join the admin room.
        const room = `requested_user_level2_room`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);

        // Get the requested user level 2.
        const data = await this.adminService.getRequestedLevel2Users(page, limit);
        client.emit('requestedUserLevel2', data);
    }

    // Send real-time requested user level 2.
    sendRealTimeRequestedUserLevel2(data: any) {
        const room = `requested_user_level2_room`;
        this.server.to(room).emit('requestedUserLevel2', data);
    }

    // Set the admin is watching the requested user level 2.
    setAdminWatchingRequestedUserLevel2(userId: number) {
        const room = `requested_user_level2_room`;
        this.server.to(room).emit('watchingUserLevel2', { userId });
    }

    // Set the admin is not watching the requested user level 2.
    setAdminNotWatchingRequestedUserLevel2(userId: number) {
        const room = `requested_user_level2_room`;
        this.server.to(room).emit('notWatchingUserLevel2', { userId });
    }

    // Set the admin decision the requested user level 2.
    setAdminDecisionRequestedUserLevel2(userId: number) {
        const room = `requested_user_level2_room`;
        this.server.to(room).emit('decisionUserLevel2', { userId });
    }

    // Get the requested vehicles.
    @SubscribeMessage('getRequestedVehicles')
    async getRequestedVehicles(
        @MessageBody() { page = 1, limit = 10 }: { page: number, limit: number },
        @ConnectedSocket() client: Socket,
    ) {
        // Join the vehicles room.
        const room = `requested_vehicles_room`;
        client.join(room);
        this.logger.log(`Client ${client.id} joined room ${room}`);

        // Get the requested vehicles.
        const data = await this.adminService.getRequestedVehicles(page, limit);
        client.emit('requestedVehicles', data);
    }

    // Send real-time requested vehicles.
    sendRealTimeRequestedVehicles(data: any) {
        const room = `requested_vehicles_room`;
        this.server.to(room).emit('requestedVehicles', data);
    }

    // Set the admin is watching the requested vehicle.
    setAdminWatchingRequestedVehicle(vehicleId: number) {
        const room = `requested_vehicles_room`;
        this.server.to(room).emit('watchingVehicle', { vehicleId });
    }

    // Set the admin is not watching the requested vehicle.
    setAdminNotWatchingRequestedVehicle(vehicleId: number) {
        const room = `requested_vehicles_room`;
        this.server.to(room).emit('notWatchingVehicle', { vehicleId });
    }

    // Set the admin decision the requested vehicle.
    setAdminDecisionRequestedVehicle(vehicleId: number) {
        const room = `requested_vehicles_room`;
        this.server.to(room).emit('decisionVehicle', { vehicleId });
    }
}