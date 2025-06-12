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

@Injectable()
export class ConfirmVehicleService {
    constructor(
        @InjectRepository(RentalEntity) private readonly rentalRepository: Repository<RentalEntity>,
        private notificationService: NotificationService
    ) {}

    // Confirm renter received the vehicle.
    async confirmRenterReceivedVehicle(rentalId: number) {

        const rental = await this.rentalRepository.findOne({ where: { id: rentalId } });
        if (!rental) return null;

        rental.status = RentalStatus.RENTER_RECEIVED;
        rental.statusWorkflowHistory.push({
            status: 'Renter received the vehicle.',
            date: generateDate()
        });
        rental.updatedAt = generateDate();
        const updatedRental = await this.rentalRepository.save(rental);

        // Notify the renter.
        this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);

        // Return the updated rental.
        return updatedRental;
    }

    // Confirm renter returned the vehicle.
    async confirmRenterReturnedVehicle(rentalId: number) {

        const rental = await this.rentalRepository.findOne({ where: { id: rentalId } });
        if (!rental) return null;
        
        rental.status = RentalStatus.RENTER_RETURNED;
        rental.statusWorkflowHistory.push({
            status: 'Renter returned the vehicle.',
            date: generateDate()
        });
        rental.updatedAt = generateDate();
        const updatedRental = await this.rentalRepository.save(rental);
       
        // Notify the renter.
        this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);

        updatedRental.status = RentalStatus.COMPLETED;
        updatedRental.statusWorkflowHistory.push({
            status: 'The rental is completed.',
            date: generateDate()
        });
        updatedRental.updatedAt = generateDate();
        const result =await this.rentalRepository.save(updatedRental);

        // Return the updated rental.
        return result;
    }
}