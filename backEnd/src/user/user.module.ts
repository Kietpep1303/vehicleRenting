import { forwardRef, Module } from '@nestjs/common';

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

// Imports admin gateway.
import { AdminModule } from '../admin/admin.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        CloudinaryModule,
        OtpModule,
        forwardRef(() => AdminModule),
    ],
    controllers: [UserController],
    providers: [UserService, GetUserInfoService],
    exports: [UserService, GetUserInfoService],
})
export class UserModule {}
