import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

// Imports OTP service.
import { OtpService } from './services/otp.service';

// Imports user service.
import { UserService } from '../user/services/user.service';
import { GetUserInfoService } from '../user/services/getUserInfo.service';

// Import error codes.
import { ErrorCodes } from '../errorHandler/errorCodes';
import { ErrorHandler } from '../errorHandler/errorHandler';

@Controller('api/otp')
export class OtpController {

    constructor(
        private readonly otpService: OtpService,
        private readonly getUserInfoService: GetUserInfoService,
        private readonly userService: UserService,
    ) {}

    // Request a new OTP code.
    @Post('request-otp')
    @HttpCode(HttpStatus.OK)
    async requestOtp(@Body('email') email: string) {
        try {
            // Check if the email is exists.
            const user = await this.getUserInfoService.findUserByEmail(email);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Check if the user already has a valid OTP code.
            const otp = await this.otpService.getOtpByUserId(user.id);
            if (otp) throw new ErrorHandler(ErrorCodes.OTP_ALREADY_REQUESTED, 'OTP code already requested', HttpStatus.BAD_REQUEST);

            // Generate a new OTP code.
            await this.otpService.generateOtp(user.id, email);
            return { status: HttpStatus.OK, message: 'OTP code is sent to your email.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_SEND_OTP, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Resend the OTP code.
    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp(@Body('email') email: string) {
        try {
            // Check if the email is exists.
            const user = await this.getUserInfoService.findUserByEmail(email);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Check if the user already has a valid OTP code.
            const otp = await this.otpService.getOtpByUserId(user.id);
            if (!otp) throw new ErrorHandler(ErrorCodes.OTP_EXPIRED, 'OTP code expired', HttpStatus.NOT_FOUND);

            // Resend the OTP code.
            await this.otpService.resendOtp(otp.otp, email, otp.expireAt);
            return { status: HttpStatus.OK, message: 'OTP code is sent to your email.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_RESEND_OTP, 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
