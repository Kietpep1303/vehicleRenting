import { HttpStatus, Injectable } from '@nestjs/common';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports user entity.
import { UserEntity, UserStatus } from '../entities/user.entity';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@Injectable()
export class GetUserInfoService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) {}

    // Find user by email.
    async findUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email: email } });
        if (!user) return null;

        return user;
    }

    // Find user by id.
    async findUserById(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) return null;

        return user;
    }

    // Check user level.
    async retrieveUserLevel(userId: number) {
        const user = await this.findUserById(userId);
        if (!user) return null;

        // Return user level.
        return user.accountLevel;
    } 
}