import { Injectable } from '@nestjs/common';

// Imports standard date.
import { generateDate } from '../common/utils/standardDate.util';

// Imports typeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports rental entity.
import { RentalEntity, RentalStatus } from '../rental/entities/rental.entity';

// Imports socket service.
import { NotificationService } from '../socket/services/notification.service';

// Imports redis queue.
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        private readonly notificationService: NotificationService,
        @InjectQueue('rental-cancel-queue') private readonly rentalCancelQueue: Queue
    ) {}

    // Update the status of the rental to DEPOSIT_PAID.
    async updateRentalToDepositPaid(rentalRecord: RentalEntity) {

        rentalRecord.status = RentalStatus.DEPOSIT_PAID;
        rentalRecord.updatedAt = generateDate();
        rentalRecord.statusWorkflowHistory.push({
            status: `Deposit 30% of the total price has been paid.`,
            date: generateDate()
        });
        const updatedRental = await this.rentalRepository.save(rentalRecord); 

        // Notify the renter.
        this.notificationService.notifyRenterNewRentalUpdate(updatedRental.renterId, updatedRental);

        updatedRental.status = RentalStatus.OWNER_PENDING;
        updatedRental.updatedAt = generateDate();
        updatedRental.statusWorkflowHistory.push({
            status: `Owner has 2 hours to accept or reject the rental.`,
            date: generateDate()
        });
        const result = await this.rentalRepository.save(updatedRental);

        // Notify the owner.
        this.notificationService.notifyOwnerNewBooking(result.vehicleOwnerId, result);

        // Add the rental to the queue.
        this.rentalCancelQueue
            .add(
                'cancel-rental-owner-pending',
                { rentalId: result.id },
                { delay: 2 * 60 * 60 * 1000 } // 2 hours.
            )
            .catch(error => console.error('Failed to enqueue cancel job:', error));

        return result;
    }

    // Update the status of the rental to REMAINING_PAYMENT_PAID.
    async updateRentalToRemainingPaymentPaid(rentalRecord: RentalEntity) {
        rentalRecord.status = RentalStatus.REMAINING_PAYMENT_PAID;
        rentalRecord.updatedAt = generateDate();
        rentalRecord.statusWorkflowHistory.push({
            status: `Remaining payment has been paid.`,
            date: generateDate()
        });
        const updatedRental = await this.rentalRepository.save(rentalRecord);

        // Notify the vehicle owner.
        this.notificationService.notifyOwnerNewRentalUpdate(updatedRental.vehicleOwnerId, updatedRental);

        return updatedRental;
    }
}
