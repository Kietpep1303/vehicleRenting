import { Controller, Get, Post, Body, HttpStatus, Query, Req, UseGuards, ParseIntPipe, HttpCode, UseInterceptors, UploadedFiles, UploadedFile } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports notification services.
import { NotificationService } from '../services/notification.service';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(1)
@Controller('api/notification')
export class NotificationController {

    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    // Set the notification as read.
    @Post('set-as-read')
    @HttpCode(HttpStatus.OK)
    async setAsRead(
        @Req() req: any,
        @Body('id') id: number
    ) {
        try {
            // Check if the notification id is valid.
            if (!id) return { status: HttpStatus.BAD_REQUEST, message: 'Notification id is required' };
            
            // Get the notification by id.
            const notification = await this.notificationService.getNotificationById(id);
            if (!notification) return { status: HttpStatus.NOT_FOUND, message: 'Notification not found' };

            // Check if the notification is for the current user.
            if (notification.userId !== req.user.userId) return { status: HttpStatus.FORBIDDEN, message: 'You are not allowed to set this notification as read' };

            // Set the notification as read.
            const result = await this.notificationService.setNotificationAsRead(id);
            return { status: HttpStatus.OK, message: 'Notification set as read', data: result };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            throw new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, 'Failed to set notification as read', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}