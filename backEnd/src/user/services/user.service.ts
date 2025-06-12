import { Injectable } from '@nestjs/common';

// Imports bcrypt.
import * as bcrypt from 'bcrypt';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports user entity.
import { UserEntity, UserStatus } from '../entities/user.entity';

// Imports cloudinary service.
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

// Imports dto.
import { SignUpUserLevel0Dto } from '../../auth/dto/sign-up-user-level0.dto';
import { UpdateUserToLevel1Dto } from '../dto/update-user-to-level1.dto';
import { UpdateUserToLevel2Dto } from '../dto/update-user-to-level2.dto';
import { UpdateUserInfoDto } from '../dto/update-user-info.dto';

// Imports standard date.
import { generateDate } from '../../common/utils/standardDate.util';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}
    
    // Create user to level 0.
    async createUserLevel0(dto: SignUpUserLevel0Dto) {
        // Hashing password.
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create a new user.
        const user = this.userRepository.create({
            nickname: dto.nickname,
            email: dto.email,
            password: hashedPassword,
            createdAt: generateDate(),
            updatedAt: generateDate(),
        });

        const result = await this.userRepository.save(user);
        
        // Return user information.
        const { password, ...userWithoutPassword } = result;
        return userWithoutPassword;
    }

    // Update user to level 1
    async updateUserToLevel1(user: UserEntity) {
        const result = await this.userRepository.update(user.id, {
            accountLevel: 1,
            updatedAt: generateDate(),
        });
        return result;
    }

    // Request to update user to level 2.
    async requestUpdateUserToLevel2(user: UserEntity, dto: UpdateUserToLevel2Dto, files: {
        idCardFront?: Express.Multer.File[],
        idCardBack?: Express.Multer.File[],
        driverLicenseFront?: Express.Multer.File[],
        driverLicenseBack?: Express.Multer.File[],
    }) {

        // Upload the files to cloudinary.
        const imageFields = ['idCardFront','idCardBack','driverLicenseFront','driverLicenseBack'] as const;
        const uploadTasks = imageFields.map(field => {
            const fileArray = files[field];
            if (fileArray && fileArray.length) {
                return this.cloudinaryService
                    .uploadImage(fileArray[0], 'user')
                    .then(uploaded => { dto[field] = uploaded.secure_url; });
            }
            return Promise.resolve();
        });
        await Promise.all(uploadTasks);

        // Update the user.
        const result = await this.userRepository.update(user.id, {
            ...dto,
            accountLevel: 1,
            status: UserStatus.PENDING,
            updatedAt: generateDate(),
        });
        return result;
    }

    // Update user information.
    async updateUserInfo(user: UserEntity, dto: UpdateUserInfoDto, avatar?: Express.Multer.File) {

        // Upload avatar to cloudinary if the file is provided.
        if (avatar) {
            const uploadImage = await this.cloudinaryService.uploadImage(avatar, 'avatars');
            dto.avatar = uploadImage.secure_url;
        }

        // Update user information.
        await this.userRepository.update(user.id, {
            ...dto,
            updatedAt: generateDate(),
        });
    }
}
