import { Controller, Post, Body, HttpStatus, UseGuards, Req, HttpCode, Get, Query, UseInterceptors, Put, UploadedFiles, forwardRef, Inject } from '@nestjs/common';

// Imports user services.
import { UserService } from './services/user.service';
import { GetUserInfoService } from './services/getUserInfo.service';

// Imports otp services.
import { OtpService } from 'src/otp/services/otp.service';

// Imports error codes.
import { ErrorCodes } from '../errorHandler/errorCodes';
import { ErrorHandler } from '../errorHandler/errorHandler';

// Imports dto.
import { UpdateUserToLevel1Dto } from './dto/update-user-to-level1.dto';
import { UpdateUserToLevel2Dto } from './dto/update-user-to-level2.dto';
import { UpdateUserInfoDto } from './dto/update-user-info.dto';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

// Imports multer.
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('api/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly getUserInfoService: GetUserInfoService,
        private readonly otpService: OtpService,
    ) {}

    // [PRIVATE] Get user personal information by id.
    @UseGuards(AuthGuard('jwt'))
    @Get('get-user-info')
    @HttpCode(HttpStatus.OK)
    async getUserInfoById(@Req() req: any) {
        try {
            const result = await this.getUserInfoService.findUserById(req.user.userId);

            // If user is not found, throw an error.
            if (!result) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Return user information without password.
            const { password, createdAt, updatedAt, rejectedReason, ...others } = result;
            
            // Return user information.
            return { status: HttpStatus.OK, message: 'User information retrieved successfully.', data: others };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_USER_INFO, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user PUBLIC information by id.
    @UseGuards(AuthGuard('jwt'))
    @Get('get-user-public-info')
    @HttpCode(HttpStatus.OK)
    async getUserPublicInfoById(
        @Req() req: any,
        @Query('userId') userId: number
    ) {
        try {
            // Get user public information.
            const user = await this.getUserInfoService.findUserById(userId);

            // If user is not found, throw an error.
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Return user public information.
            const { nickname, avatar } = user;
            return { status: HttpStatus.OK, message: 'User public information retrieved successfully.', data: {
                id: user.id,
                nickname: nickname,
                avatar: avatar
            }};
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_USER_PUBLIC_INFO, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update user to level 1.
    @Post('update-to-level1')
    @HttpCode(HttpStatus.OK)
    async updateUserToLevel1(@Body() dto: UpdateUserToLevel1Dto) {
        try {
            // Get user information.
            const user = await this.getUserInfoService.findUserByEmail(dto.email);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Check if the user is already at level 1.
            if (user.accountLevel === 1) throw new ErrorHandler(ErrorCodes.USER_NOT_LEVEL_1, 'User already at level 1', HttpStatus.BAD_REQUEST);

            // Get the valid OTP code.
            const otp = await this.otpService.getOtpByUserId(user.id);
            if (!otp) throw new ErrorHandler(ErrorCodes.OTP_EXPIRED, 'OTP code expired', HttpStatus.NOT_FOUND);

            // Check if the OTP code is correct.
            if (otp.otp !== dto.otp) throw new ErrorHandler(ErrorCodes.OTP_INCORRECT, 'OTP code incorrect', HttpStatus.BAD_REQUEST);

            // Delete the OTP code.
            await this.otpService.deleteOtpByUserId(user.id);

            // Update user to level 1.
            await this.userService.updateUserToLevel1(user);

            return { status: HttpStatus.OK, message: 'User updated to level 1.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_UPDATE_TO_LEVEL_1, 'Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Request to update user to level 2.
    @UseGuards(AuthGuard('jwt'), AccountLevelGuard)
    @RequiredAccountLevel(1)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'idCardFront', maxCount: 1 },
            { name: 'idCardBack', maxCount: 1 },
            { name: 'driverLicenseFront', maxCount: 1 },
            { name: 'driverLicenseBack', maxCount: 1 },
        ],
        {
          storage: memoryStorage(),
          limits: { fileSize: 1024 * 1024 * 5 }, // Limit the file size to 5MB.
        }),
    )
    @Post('request-update-to-level2')
    @HttpCode(HttpStatus.OK)
    async updateUserToLevel2(
        @Req() req: any,
        @Body() dto: UpdateUserToLevel2Dto,
        @UploadedFiles() files: {
            idCardFront?: Express.Multer.File[],
            idCardBack?: Express.Multer.File[],
            driverLicenseFront?: Express.Multer.File[],
            driverLicenseBack?: Express.Multer.File[],
        }
    ) {
        // Ensure required fields are provided.
        for (const key of ['idCardFront', 'idCardBack', 'driverLicenseFront', 'driverLicenseBack'] as const) {
            if (!files[key] || files[key].length === 0) {
                throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, `${key} is required`, HttpStatus.BAD_REQUEST);
            }
        }
        try {
            // Check if the user status is "X" or "REJECTED".
            const user = await this.getUserInfoService.findUserById(req.user.userId);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
            if (user.status !== "X" && user.status !== 'REJECTED') throw new ErrorHandler(ErrorCodes.USER_STATUS_FAILED, 'User status not valid', HttpStatus.FORBIDDEN);

            // Update user to level 2.
            await this.userService.requestUpdateUserToLevel2(user, dto, files);

            return { status: HttpStatus.OK, message: 'User sent for approval successfully. Please wait for approval.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_REQUEST_TO_LEVEL_2, 'Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update user information from level 1.
    @UseGuards(AuthGuard('jwt'), AccountLevelGuard)
    @RequiredAccountLevel(1)
    @UseInterceptors(
    FileFieldsInterceptor([
        { name: 'avatar', maxCount: 1 },
    ],
    {
        storage: memoryStorage(),
        limits: { fileSize: 1024 * 1024 * 5 }, // Limit the file size to 5MB.
    }),
    )
    @Put('update-user-info')
    @HttpCode(HttpStatus.OK)
    async updateUserInfo(
        @Req() req: any,
        @Body() dto: UpdateUserInfoDto,
        @UploadedFiles() files: {
            avatar?: Express.Multer.File[]
        }
    ) {
        const avatar = files.avatar?.[0];
        try {
            // Get user information.
            const user = await this.getUserInfoService.findUserById(req.user.userId);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
            
            // Update user information.
            await this.userService.updateUserInfo(user, dto, avatar);

            // Return user information.
            return { status: HttpStatus.OK, message: 'User information updated successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_UPDATE_USER_INFO, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 
}
