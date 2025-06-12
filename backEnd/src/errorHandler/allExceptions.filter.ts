import { ExceptionFilter, Catch, ArgumentsHost, HttpException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorHandler } from './errorHandler';
import { ErrorCodes }  from './errorCodes';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let error: ErrorHandler;

        if (exception instanceof ErrorHandler) {
            error = exception;
        }
        else if (exception instanceof UnauthorizedException) {
            const response = exception.getResponse() as any;
            const message = response?.message || exception.message;
            const code = (message === 'Unauthorized') ? ErrorCodes.TOKEN_NOT_PROVIDED_OR_EXPIRED : ErrorCodes.FAILED_TO_VERIFY_TOKEN;
            if (message === 'Unauthorized') {
                error = new ErrorHandler(code, "Token not provided or expired", HttpStatus.UNAUTHORIZED);
            }
            else {
                error = new ErrorHandler(code, message, HttpStatus.UNAUTHORIZED);
            }
        }
        else if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();
            const message = (typeof response === 'string') ? response : (response as any).message || exception.message;

            if (status === HttpStatus.BAD_REQUEST) {
                error = new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, message, status);
            }
            else {
                error = new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, message, status);
            }
        }
        else {
            console.error(exception);
            error = new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, 'An unknown error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        response.status(error.getStatus()).json(error.getResponse());
    }
}