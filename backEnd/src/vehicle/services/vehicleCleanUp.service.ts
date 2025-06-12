import { Injectable } from '@nestjs/common';

// Imports cron.
import { Cron, CronExpression } from '@nestjs/schedule';

// Imports typeORM.
import { InjectRepository }     from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

// Imports vehicle entity.
import { VehicleEntity, VehicleStatus } from '../entities/vehicle.entity';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

@Injectable()
export class VehicleCleanUpService {
    constructor(
        @InjectRepository(VehicleEntity) private readonly vehicleRepository: Repository<VehicleEntity>
    ) {}

    // Clean up REJECTED vehicles in the last 30 days.
    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async cleanUpRejectedVehicles() {
        const cutoff = generateDate();
        cutoff.setDate(cutoff.getDate() - 30);
        const result = await this.vehicleRepository.delete({
            status: VehicleStatus.REJECTED,
            createdAt: LessThan(cutoff),     
        });

        console.log(`${result.affected} rejected vehicles deleted.`);
    }
}
