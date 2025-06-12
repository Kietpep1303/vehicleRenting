import { Injectable, CanActivate, ExecutionContext, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCOUNT_LEVEL_KEY } from '../decorator/accountLevel.decorator'

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@Injectable()
export class AccountLevelGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredLevel = this.reflector.get<number>(
            ACCOUNT_LEVEL_KEY,
            context.getHandler()
        );

        // If no required level, return true.
        if (!requiredLevel) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        // Get payload from request JWT.
        const payload = request.user;
        
        // If user not found, throw error.
        if (!payload) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

        // If user account level is not required level, throw error.
        switch (requiredLevel) {
            case 1:
                if (payload.accountLevel < 1) throw new ErrorHandler(ErrorCodes.USER_NOT_LEVEL_1, 'Account level not allowed', HttpStatus.FORBIDDEN);
                break;
            case 2:
                if (payload.accountLevel < 2) throw new ErrorHandler(ErrorCodes.USER_NOT_LEVEL_2, 'Account level not allowed', HttpStatus.FORBIDDEN);
                break;
            case 3:
                if (payload.accountLevel < 3) throw new ErrorHandler(ErrorCodes.ADMIN_ACCESS_ONLY, 'Admin access only', HttpStatus.FORBIDDEN);
                break;
            default:
                throw new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return true;
    }
}
