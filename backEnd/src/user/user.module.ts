import { Module } from '@nestjs/common';

// Imports user controller.
import { UserController } from './user.controller';

// Imports user services.
import { UserService } from './services/user.service';
import { GetUserInfoService } from './services/getUserInfo.service';

// Imports OTP module.
import { OtpModule } from '../otp/otp.module';

// Imports typeORM and cloudinary providers.
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        CloudinaryModule,
        OtpModule,
    ],
    controllers: [UserController],
    providers: [UserService, GetUserInfoService],
    exports: [UserService, GetUserInfoService],
})
export class UserModule {}
