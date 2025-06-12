import { HttpStatus, Injectable } from '@nestjs/common';

// Imports standard time.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports typeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';

// Imports rental entity.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';

@Injectable()
export class CheckAvaliabilityVehicleService {

    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
    ) {}

    async checkAvaliabilityVehicle(vehicleId: number, month: number, year: number) {
        
        // Build month window.
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        // Get any records that overlaps.
        const rentalRecords = await this.rentalRepository.find({
            where: {
                vehicleId: vehicleId,
                status: Not(In([RentalStatus.CANCELLED, RentalStatus.DEPOSIT_REFUNDED])),
                startDateTime: LessThanOrEqual(endOfMonth),
                endDateTime: MoreThanOrEqual(startOfMonth),
            },
            select: ['startDateTime', 'endDateTime']
        });

        // Format the rental records.
        return rentalRecords.map(record => ({
            startDateTime: record.startDateTime,
            endDateTime: record.endDateTime,
        }));
    }

    async checkAvaliabilityForNewRental(vehicleId: number, startDateTime: Date, endDateTime: Date): Promise<boolean> {
        const conflictCount = await this.rentalRepository.count({
            where: {
                vehicleId: vehicleId,
                status: Not(In([RentalStatus.CANCELLED, RentalStatus.DEPOSIT_REFUNDED])),
                startDateTime: LessThanOrEqual(endDateTime),
                endDateTime: MoreThanOrEqual(startDateTime),
            },
        });
        return conflictCount === 0; // If there are no conflicts, return true.
    }   
}
