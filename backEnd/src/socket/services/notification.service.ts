import { forwardRef, Inject, Injectable } from '@nestjs/common';

// Imports notification gateway.
import { NotificationGateway } from '../gateways/notification.gateway';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports notification entity.
import { NotificationEntity } from '../entities/notification.entity';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports get user info service.
import { GetUserInfoService } from '../../user/services/getUserInfo.service';

@Injectable()
export class NotificationService {
    constructor(
        @Inject(forwardRef(() => NotificationGateway)) private readonly notificationGateway: NotificationGateway,
        @InjectRepository(NotificationEntity) private readonly notificationRepository: Repository<NotificationEntity>,
        private readonly getUserInfoService: GetUserInfoService,
    ) {}

    // Create the notification.
    async createNotification(userId: number, event: { message: string, data: any }) {

        // Check if the user has more than 20 notifications.
        const existingNotificationCount = await this.notificationRepository.count({ where: { userId } });
        if (existingNotificationCount >= 20) {
            const oldestNotification = await this.notificationRepository.findOne({ where: { userId }, order: { createdAt: 'ASC' }, select: ['id'] });
            if (oldestNotification) {
                await this.notificationRepository.delete(oldestNotification.id);
            }
        }

        const notification = this.notificationRepository.create({
            userId,
            event,
            createdAt: generateDate(),
        });
        return await this.notificationRepository.save(notification);
    }

    // Get pending notifications.
    async getPendingNotifications(userId: number) {
        return this.notificationRepository.find({ where: { userId } });
    }

    // Get the notification by id.
    async getNotificationById(id: number) {
        const result = await this.notificationRepository.findOne({ where: { id } });
        if (!result) return null;
        return result;
    }

    // Set the notification as read.
    async setNotificationAsRead(id: number) {
        const result = await this.notificationRepository.update(id, { isRead: true });
        return this.getNotificationById(id);
    }

    // Delete the notification.
    async deleteNotification(id: number) {
        await this.notificationRepository.delete(id);
    }

    // Notify the vehicle owner when a new booking is created
    async notifyOwnerNewBooking(ownerId: number, rental: any) {
        // Get renter information.
        const renter = await this.getUserInfoService.findUserById(rental.renterId);
        if (!renter) return;
 
        const payload = {
            message: 'New rental booking requested!',
            data: {
                vehicleId: rental.vehicleId,
                rentalId: rental.id,
                rentalStatus: rental.status,
                renterName: renter.nickname,
                renterAvatar: renter.avatar,
            }
        }
        const notification = await this.createNotification(ownerId, payload);

        // Check if the user is online.
        if (this.notificationGateway.isUserOnline(ownerId)) {
            this.notificationGateway.sendToUser(ownerId, 'rentalNotification', notification);
        }
    }   

    // Notify the vehicle owner when the rental status is updated.
    async notifyOwnerNewRentalUpdate(ownerId: number, rental: any) {
        // Get renter information.
        const renter = await this.getUserInfoService.findUserById(rental.renterId);
        if (!renter) return;

        const payload = {
            message: 'New rental status updated!',
            data: {
                vehicleId: rental.vehicleId,
                rentalId: rental.id,
                rentalStatus: rental.status,
                renterName: renter.nickname,
                renterAvatar: renter.avatar,
            }
        }
        const notification = await this.createNotification(ownerId, payload);

        // Check if the user is online.
        if (this.notificationGateway.isUserOnline(ownerId)) {
            this.notificationGateway.sendToUser(ownerId, 'rentalNotification', notification);
        }
    }

    // Notify the renter when the rental status is updated.
    async notifyRenterNewRentalUpdate(renterId: number, rental: any) {
       // Get owner information.
        const owner = await this.getUserInfoService.findUserById(rental.vehicleOwnerId);
        if (!owner) return;

        const payload = {
            message: 'New rental status updated!',
            data: {
                vehicleId: rental.vehicleId,
                rentalId: rental.id,
                rentalStatus: rental.status,
                ownerName: owner.nickname,
                ownerAvatar: owner.avatar,
            }
        }
        const notification = await this.createNotification(renterId, payload);

            // Check if the user is online.
            if (this.notificationGateway.isUserOnline(renterId)) {
                this.notificationGateway.sendToUser(renterId, 'rentalNotification', notification);
            }
    }

    // Notify the user when a new message is received.
    async notifyNewMessage(userId: number, message: any) {
        const payload = {
            message: 'New message received!',
            data: {
                sessionId: message.sessionId,
                senderId: message.senderId,
                type: message.type,
                content: message.content,
                createdAt: message.createdAt,
                senderName: message.senderName,
                senderAvatar: message.senderAvatar,
            },
        }
        const notification = await this.createNotification(userId, payload);
        
        // Check if the user is online.
        if (this.notificationGateway.isUserOnline(userId)) {
            this.notificationGateway.sendToUser(userId, 'messageNotification', notification);
        }
    }
}