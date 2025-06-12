import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { REDIS_CLIENT } from '../../../redis/redis.module';
import { Redis } from 'ioredis';

// Imports otp entity.
import { OtpEntity } from '../../entities/otp.entity';

@Processor('otp-delete-queue')
@Injectable()
export class OtpDeleteProcessor {
    constructor(
        @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
        @Inject(REDIS_CLIENT) private redisClient: Redis,
    ) {}

    @Process('delete-expired-otp')
    async handleCancelJob(job: Job <{ userId: number }>) {
        const otp = await this.otpRepository.findOneBy({ userId: job.data.userId });
        if (!otp) return;

        await this.otpRepository.delete(otp.userId);
    }
}
        
