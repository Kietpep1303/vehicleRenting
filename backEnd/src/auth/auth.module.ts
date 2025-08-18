import { forwardRef, Module } from '@nestjs/common';

import { AuthService } from './services/auth.service';

// Clean up service.
import { AuthCleanUpService } from './services/authCleanUp.service';

import { AuthController } from './auth.controller';
import { AuthEntity } from './entities/auth.entity';

// Imports config module.
import { ConfigModule, ConfigService } from '@nestjs/config';

// Imports user module and user entity.
import { UserModule } from '../user/user.module';
import { UserEntity } from '../user/entities/user.entity';

// Imports OTP module.
import { OtpModule } from '../otp/otp.module';

// Imports TypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports JWT.
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

// Imports passport module.
import { PassportModule } from '@nestjs/passport';

// Imports Google strategy.
import { GoogleStrategy } from './google.strategy';

@Module({
    imports: [
        forwardRef(() => UserModule),
        OtpModule,
        TypeOrmModule.forFeature([UserEntity, AuthEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // Set the JWT secret and expiration time of access token.
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '1h' }    
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthCleanUpService, JwtStrategy, GoogleStrategy],
    exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
