import { Injectable } from '@nestjs/common';

// Imports config service.
import { ConfigService } from '@nestjs/config';

// Imports user entity.
import { UserEntity } from 'src/user/entities/user.entity';
import { UserStatus } from 'src/user/entities/user.entity';

// Imports auth entity.
import { AuthEntity } from '../entities/auth.entity';

// Imports JWT service.
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

// Imports bcrypt.
import * as bcrypt from 'bcrypt';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

// Imports UUID 7.
import { v7 as uuidv7 } from 'uuid';

// Imports standard date.
import { generateDate, convertToDateGMT7Format } from 'src/common/utils/standardDate.util';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(AuthEntity) private readonly authRepository: Repository<AuthEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}
    
    // Login user to get both access and refresh tokens.
    async login(userId: number, email: string, accountLevel: number, deviceName: string) {

        // Make an unique device id.
        const deviceId = `[DEVICE]${uuidv7()}`;

        const payload = { userId, email, accountLevel, deviceId };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '10m'
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '365d'
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.authRepository.save({
            userId: userId,
            deviceId: deviceId,
            deviceName: deviceName,
            refreshToken: hashedRefreshToken,
            expiresAt: generateDate(30 * 24 * 60) // 30 days.
        });
        return { accessToken, refreshToken, deviceId, deviceName };
    }

    async findOrCreateUserGoogle( payload: any ) {
        const { email, nickname } = payload;

        let user = await this.userRepository.findOne({ where: { email: email } });
        if (!user) {
            user = await this.userRepository.create({
                nickname: nickname,
                email: email,
                password: '',
                accountLevel: 1,
                createdAt: generateDate(),
                updatedAt: generateDate(),
                status: UserStatus.NO_LEVEL_2
            });
            await this.userRepository.save(user);
        }
        return user;
    } 

    // Get the permanent access token.
    async getPermanentAccessToken(userId: number) {
        if (userId === 0) {
            const payload = { userId, accountLevel: 3 };
            return this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '99y'
            });
        }
        else return null;
    }

    // Get all Valid refresh tokens of one user.
    async getAllValidRefreshTokens(userId: number) {
        const now = generateDate();
        const refreshTokens = await this.authRepository.find({ where: { userId: userId, expiresAt: MoreThan(now) } });
        // Return the refresh tokens with the device id, device name and expires at.
        return refreshTokens.map(token => ({
            deviceId: token.deviceId,
            deviceName: token.deviceName,
            expiresAt: convertToDateGMT7Format(token.expiresAt)
        }));
    }

    // Logout user to remove the refresh token.
    async logout(deviceId: string) {
        await this.authRepository.delete({ deviceId: deviceId });
        return true;
    }

    // Validate refresh token.
    async validateRefreshToken(refreshToken: string) {
        const payload = this.jwtService.verify(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET')
        });
        if (!payload) return null;

        const resultRefreshToken = await this.authRepository.findOne({
            where: { userId: payload.userId, deviceId: payload.deviceId }
        });
        if (!resultRefreshToken) return null;

        const match = await bcrypt.compare(refreshToken, resultRefreshToken.refreshToken);
        if (!match) return false;
        return payload;
    }

    // Check numbers of valid refresh tokens of one user.
    async checkLoginAttempts(userId: number) {
        const loginAttempts = await this.authRepository.count({ where: 
            { 
                userId: userId, 
                expiresAt: MoreThan(generateDate()) 
            } 
        });
        return loginAttempts;
    }

    // Validate password.
    async validatePassword(userId: number, password: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) return null;
        return await bcrypt.compare(password, user.password);
    }

    // Sign a new access token.
    async signAccessToken(payload: any) {
        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '10m'
        });
    }

    // Change password.
    async changePassword(userId: number, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await this.userRepository.update(userId, {
            password: hashedPassword,
        });
        return result;
    }
}
