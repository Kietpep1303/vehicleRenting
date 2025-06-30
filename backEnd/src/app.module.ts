import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ScheduleModule } from '@nestjs/schedule';

// Imports other modules
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { AdminModule } from './admin/admin.module';
import { RentalModule } from './rental/rental.module';
import { SocketModule } from './socket/socket.module';
import { PaymentModule } from './payment/payment.module';

// Imports bull module.
import { BullModule } from '@nestjs/bull';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        BullModule.forRoot({
            redis: { host: '127.0.0.1', port: 6379 },
          }),
        UserModule,
        CloudinaryModule,
        DatabaseModule,
        EmailModule,
        AuthModule,
        OtpModule,
        VehicleModule,
        AdminModule,
        RentalModule,
        SocketModule,
        PaymentModule,
        RedisModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}