import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ErrorHandler } from './errorHandler';
import { ErrorCodes } from './errorCodes';

@Catch()
export class SocketExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const context = host.switchToWs();
        const client = context.getClient<Socket>();

        let error: ErrorHandler;

        if (exception instanceof ErrorHandler) {
            error = exception;
        } else if (exception instanceof WsException) {
            const wsError = exception.getError();
            // If the payload already has a errorCode, use it.
            if ( typeof wsError === 'object' && 'errorCode' in wsError && 'message' in wsError) {
                client.emit('error', wsError);
                return;
            }

            // Otherwise, fall back an UNKNOWN_ERROR.
            const message = typeof wsError === 'string' ? wsError : (wsError as any)?.message || exception.message;
            error = new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
            
        } else {
            error = new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, 'An unknown error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        client.emit('error', error.getResponse());
    }
}