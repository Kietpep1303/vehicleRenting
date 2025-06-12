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

// Imports redis queue.
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class CreateNewRentalRecordService {

    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        private readonly getVehicleService: GetVehicleService,
        @InjectQueue('rental-cancel-queue') private readonly rentalCancelQueue: Queue,
        private readonly notificationService: NotificationService
    ) {}

    // Calculate total days.
    async calculateTotalDays(startDateTime: Date, endDateTime: Date) {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        const diffMs = end.getTime() - start.getTime();
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.max(Math.ceil(diffMs / msPerDay), 1);
        return diffDays;
    }

    // Create a rental confirmation.
    // Calculate price, total days, deposit price.
    async createRentalConfirmation(dto: CreateRentalConfirmationDto) {
        const vehicle = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
        if (!vehicle) return null;

        // Calculate total days and price.
        const dailyPrice = vehicle.price;
        const totalDays = await this.calculateTotalDays(dto.startDateTime, dto.endDateTime);
        const totalPrice = dailyPrice * totalDays;
        const depositPrice = totalPrice * 0.3;

        // Return the rental confirmation.
        return {
            vehicleId: vehicle.id,
            startDateTime: dto.startDateTime,
            endDateTime: dto.endDateTime,
            totalDays: totalDays,
            dailyPrice: dailyPrice,
            totalPrice: totalPrice,
            depositPrice: depositPrice
        }
    }

    // Create a new rental record.
    async createNewRentalRecord(renterId: number, dto: CreateRentalRecordDto) {
        const vehicle = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
        if (!vehicle) return null;

        // Calculate total days and price.
        const dailyPrice = vehicle.price;
        const totalDays = await this.calculateTotalDays(dto.startDateTime, dto.endDateTime);
        const totalPrice = dailyPrice * totalDays;
        const depositPrice = totalPrice * 0.3;

        // Create a new rental record.
        const rental = await this.rentalRepository.create({
            vehicleId: dto.vehicleId,
            vehicleOwnerId: vehicle.userId,
            renterId: renterId,
            renterPhoneNumber: dto.renterPhoneNumber,
            startDateTime: dto.startDateTime,
            endDateTime: dto.endDateTime,
            totalDays: totalDays,
            dailyPrice: dailyPrice,
            totalPrice: totalPrice,
            depositPrice: depositPrice,
            createdAt: generateDate(),
            updatedAt: generateDate(),
            statusWorkflowHistory: [{
                status: `A new rental has been created for ${vehicle.title}.`,
                date: generateDate()
            }]
        });

        // Save the rental record.
        const savedRental = await this.rentalRepository.save(rental);

        // Add the rental to the queue.
        this.rentalCancelQueue
            .add(
                'cancel-rental-deposit-pending',
                { rentalId: savedRental.id },
                { delay: 15 * 60 * 1000 } // 15 minutes
            )
            .catch(error => console.error('Failed to enqueue cancel job:', error));

        // Notify the renter.
        this.notificationService.notifyRenterNewRentalUpdate(savedRental.renterId, savedRental);

        // Return the rental record.
        return savedRental;
    }
}

