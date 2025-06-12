import { HttpStatus, Injectable } from '@nestjs/common';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports typeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports vehicle service.
import { GetVehicleService } from '../../vehicle/services/getVehicle.service';

// Imports rental entity.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';

// Imports socket service.
import { NotificationService } from '../../socket/services/notification.service';

// Imports dto.
import { CreateRentalConfirmationDto } from '../dto/create-rental-confirm.dto';
import { CreateRentalRecordDto } from '../dto/create-rental-record.dto';

@Injectable()
export class OwnerDecisionRentalService {
    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        private readonly notificationService: NotificationService
    ) {}

    // Approve OR reject a rental.
    async approveOrRejectRental(rental: RentalEntity, status: boolean) {

        // Approve OR reject the rental.
        if (status === true) {
            rental.status = RentalStatus.OWNER_APPROVED;
            rental.statusWorkflowHistory.push({
                status: `The rental has been approved by the owner.`,
                date: generateDate()
            });
            rental.updatedAt = generateDate();
        } else if (status === false) {
            rental.status = RentalStatus.CANCELLED;
            rental.statusWorkflowHistory.push({
                status: `The rental has been rejected by the owner. The rental is cancelled.`,
                date: generateDate()
            });
            rental.updatedAt = generateDate();
        }

        // Save the rental.
        const updatedRental = await this.rentalRepository.save(rental);

        // If the rental is cancelled, refund the deposit.
        if (updatedRental.status === RentalStatus.CANCELLED) {
            updatedRental.status = RentalStatus.DEPOSIT_REFUNDED;
            updatedRental.statusWorkflowHistory.push({
                status: `The rental has been cancelled by the owner. The deposit has been refunded.`,
                date: generateDate()
            });
            updatedRental.updatedAt = generateDate();
            await this.rentalRepository.save(updatedRental);
        }

        // Send the rental status to the renter.
        this.notificationService.notifyRenterNewRentalUpdate(updatedRental.renterId, updatedRental);

        return updatedRental;
    }
}