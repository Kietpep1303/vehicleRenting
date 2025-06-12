import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { REDIS_CLIENT } from '../../../redis/redis.module';
import { RentalEntity, RentalStatus } from '../../entities/rental.entity';
import { Redis } from 'ioredis';

@Processor('rental-cancel-queue')
@Injectable()
export class RentalCancellationProcessor {
    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        @Inject(REDIS_CLIENT) private redisClient: Redis,
    ) {}

    @Process('cancel-rental-deposit-pending')
    async handleCancelJob(job: Job <{ rentalId: number }>) {
        const rental = await this.rentalRepository.findOneBy({ id: job.data.rentalId });
        if (!rental) return;
        // console.log('cancel-rental-deposit-pending', rental);

        if (rental.status === RentalStatus.DEPOSIT_PENDING) {
            rental.status = RentalStatus.CANCELLED;
            rental.statusWorkflowHistory.push({
                status: `Rental has been cancelled. No deposit has been paid.`,
                date: new Date()
            });
            await this.rentalRepository.save(rental);
        }
    }

    @Process('cancel-rental-owner-pending')
    async handleCancelOwnerPendingJob(job: Job <{ rentalId: number }>) {
        const rental = await this.rentalRepository.findOneBy({ id: job.data.rentalId });
        if (!rental) return;
        // console.log('cancel-rental-owner-pending', rental);

        if (rental.status === RentalStatus.OWNER_PENDING) {
            rental.status = RentalStatus.CANCELLED;
            rental.statusWorkflowHistory.push({
                status: `Rental has been cancelled. Owner has not accepted the rental.`,
                date: new Date()
            });
            await this.rentalRepository.save(rental);
        }
    }
}
        
