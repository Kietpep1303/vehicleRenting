// Imports HTTPException.
import { HttpException, HttpStatus } from '@nestjs/common';

// Imports error codes.
import { ErrorCodes } from './errorCodes';

export class ErrorHandler extends HttpException {

    constructor(
        public readonly errorCode: ErrorCodes,
        public readonly message: any,
        status: HttpStatus = HttpStatus.BAD_REQUEST,
    ) {
        super({ errorCode, message }, status);
    }
}