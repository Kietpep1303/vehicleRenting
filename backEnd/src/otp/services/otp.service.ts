import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

// Imports OTP entity.
import { OtpEntity } from '../entities/otp.entity';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

// Imports mailer service.
import { MailerService } from '@nestjs-modules/mailer';

// Imports standard date.
import { generateDate, convertToDateGMT7Format } from 'src/common/utils/standardDate.util';

// Imports redis queue.
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class OtpService {
    
    constructor(
        @InjectRepository(OtpEntity) private readonly otpRepository: Repository<OtpEntity>,
        private readonly mailerService: MailerService,
        @InjectQueue('otp-delete-queue') private readonly otpDeleteQueue: Queue,
    ) {}

    // Generate a random OTP code.
    async randomOtp() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    // Get the valid OTP code by user id.
    async getOtpByUserId(userId: number) {
        const otp = await this.otpRepository.findOne({
            where: {
                userId: userId,
                expireAt: MoreThan(generateDate()),
            },
        });
        if (!otp) return null;
        return { otp: otp.otp, expireAt: otp.expireAt };
    }

    // Delete the OTP code by user id.
    async deleteOtpByUserId(userId: number) {
        await this.otpRepository.delete({ userId: userId });
    }

    // Create a new OTP code.
    async generateOtp(userId: number, email: string) {
        const otp = await this.randomOtp();
        const expireAt = generateDate(10); // 10 minutes expire time.
        
        // Save the OTP code to the database.
        const result = await this.otpRepository.save({ userId, otp, expireAt });

        // Send the OTP code to the user's email.
        await this.mailerService.sendMail({
            to: email,
            subject: 'OTP Code',
            html: `<p>Your OTP code is ${otp}, this code will expire at ${convertToDateGMT7Format(expireAt)}.</p>`,
        });

        // Add the OTP code to the queue.
        this.otpDeleteQueue
            .add(
                'delete-expired-otp',
                { userId: userId },
                { delay: 10 * 60 * 1000 } // 10 minutes
            )
            .catch(error => console.error('Failed to enqueue delete job:', error));

        // Return the OTP code.
        return { userId: result.userId, otp: result.otp, expireAt: result.expireAt };
    }

    // Resend the OTP code to the user's email.
    async resendOtp(otp: number, email: string, expireAt: Date) {
        await this.mailerService.sendMail({
            to: email,
            subject: '[RESEND] OTP Code',
            html: `<p>Your OTP code is ${otp}, this code will expire at ${convertToDateGMT7Format(expireAt)}.</p>`,
        });
    }
}
