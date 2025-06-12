import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

// Imports error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes }   from '../../errorHandler/errorCodes';


@Injectable()
export class SocketJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const token = client.handshake.auth?.accessToken as string;
        if (!token) throw new ErrorHandler(ErrorCodes.TOKEN_NOT_PROVIDED_OR_EXPIRED, 'Expired or invalid access token', HttpStatus.UNAUTHORIZED);

        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            client.data.user = payload;
            return true;
        } catch (error) {
            throw new ErrorHandler(ErrorCodes.FAILED_TO_VERIFY_TOKEN, 'Failed to verify access token', HttpStatus.UNAUTHORIZED);
        }
    }
}
