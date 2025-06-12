import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { SocketGateway } from '../socket.gateway';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports notification entity.
import { NotificationEntity } from '../entities/notification.entity';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';
import { time } from 'console';

@Injectable()
export class NotificationService {
    constructor(
        @Inject(forwardRef(() => SocketGateway)) private readonly socketGateway: SocketGateway,
        @InjectRepository(NotificationEntity) private readonly notificationRepository: Repository<NotificationEntity>,
    ) {}

    // Create the notification.
    async createNotification(userId: number, event: string) {
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

    // Delete the notification.
    async deleteNotification(id: number) {
        await this.notificationRepository.delete(id);
    }

    // Notify the vehicle owner when a new booking is created
    async notifyOwnerNewBooking(ownerId: number, rental: any) {
        const message = `New rental booking requested! Vehicle ID: ${rental.vehicleId} - Rental ID: ${rental.id}`;
        const notification = await this.createNotification(ownerId, message);

        // Check if the user is online.
        if (this.socketGateway.isUserOnline(ownerId)) {
            this.socketGateway.sendToUser('Rental Notification', notification, ownerId);
            await this.deleteNotification(notification.id);
        }
    }

    // Notify the vehicle owner when the rental status is updated.
    async notifyOwnerNewRentalUpdate(ownerId: number, rental: any) {
        const message = `New rental status updated! Rental ID: ${rental.id}`;
        const notification = await this.createNotification(ownerId, message);

        // Check if the user is online.
        if (this.socketGateway.isUserOnline(ownerId)) {
            this.socketGateway.sendToUser('Rental Notification', notification, ownerId);
            await this.deleteNotification(notification.id);
        }
    }

    // Notify the renter when the rental status is updated.
    async notifyRenterNewRentalUpdate(renterId: number, rental: any) {
        const message = `Rental status updated! Rental ID: ${rental.id}`;
        const notification = await this.createNotification(renterId, message);

        // Check if the user is online.
        if (this.socketGateway.isUserOnline(renterId)) {
            this.socketGateway.sendToUser('Rental Notification', notification, renterId);
            await this.deleteNotification(notification.id);
        }
    }
}