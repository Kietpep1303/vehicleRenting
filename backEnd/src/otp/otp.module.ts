import { forwardRef, Module } from '@nestjs/common';
import { OtpController } from './otp.controller';

import { OtpService } from './services/otp.service';

// Imports Otp entity.
import { OtpEntity } from './entities/otp.entity';

// Imports user module.
import { UserModule } from '../user/user.module';

// Imports email module.
import { EmailModule } from '../email/email.module';

// Imports TypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports bull module.
import { BullModule } from '@nestjs/bull';
import { OtpDeleteProcessor } from './services/processor/otpDelete.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'otp-delete-queue',
        }),
        TypeOrmModule.forFeature([OtpEntity]),
        forwardRef(() => UserModule),
        EmailModule
    ],
    controllers: [OtpController],
    providers: [OtpService, OtpDeleteProcessor],
    exports: [OtpService],
})
export class OtpModule {}
