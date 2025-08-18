import { Controller, HttpCode, HttpStatus, Post, Body, UseGuards, Req, Headers, Delete, Get, Res, Query } from '@nestjs/common';

// Imports UAParser.
import { UAParser } from 'ua-parser-js';

// Import bycrypt.
import * as bcrypt from 'bcrypt';

// Imports auth service.
import { AuthService } from './services/auth.service';

// Imports user service.
import { UserService } from '../user/services/user.service';
import { GetUserInfoService } from '../user/services/getUserInfo.service';

// Imports user entity.
import { UserStatus } from 'src/user/entities/user.entity';

// Imports OTP service.
import { OtpService } from '../otp/services/otp.service';

// Imports error codes.
import { ErrorCodes } from '../errorHandler/errorCodes';
import { ErrorHandler } from '../errorHandler/errorHandler';

// Imports dto.
import { SignUpUserLevel0Dto } from './dto/sign-up-user-level0.dto';
import { loginDto } from './dto/login.dto';
import { changePasswordDto } from './dto/change-password.dto';
import { forgotPasswordDto } from './dto/forgot-password.dto';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly getUserInfoService: GetUserInfoService,
        private readonly otpService: OtpService,
    ) {}
    
    // Register a new user at level 0.
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async signUpUserLevel0(@Body() dto: SignUpUserLevel0Dto) {
        try {
            // Check if the email is already exists.
            const user = await this.getUserInfoService.findUserByEmail(dto.email);
            if (user) throw new ErrorHandler(ErrorCodes.EMAIL_ALREADY_IN_USE, 'Email already in use', HttpStatus.BAD_REQUEST);

            // Create a new user.
            await this.userService.createUserLevel0(dto);
            return { status: HttpStatus.CREATED, message: 'User created successfully.' };

        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_USER, 'Failed to register user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Login a user, return both access and refresh tokens.
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Headers('user-agent') userAgent: string,
        @Body() dto: loginDto
    ) {
        try {
            // Check if the email is already exists.
            const user = await this.getUserInfoService.findUserByEmail(dto.email);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Check if the user is verified.
            if (user.accountLevel < 1) throw new ErrorHandler(ErrorCodes.USER_NOT_LEVEL_1, 'User is not verified', HttpStatus.BAD_REQUEST);

            // Check if the user is suspended.
            if (user.status === UserStatus.SUSPENDED) throw new ErrorHandler(ErrorCodes.USER_SUSPENDED, 'User is suspended', HttpStatus.BAD_REQUEST);

            // Check if the password is correct.
            const isPasswordCorrect = await bcrypt.compare(dto.password, user.password);
            if (!isPasswordCorrect) throw new ErrorHandler(ErrorCodes.PASSWORD_INCORRECT, 'Invalid password', HttpStatus.BAD_REQUEST);

            // Check if the user has too many refresh tokens.
            const loginAttempts = await this.authService.checkLoginAttempts(user.id);
            if (loginAttempts >= 5) {
                throw new ErrorHandler(ErrorCodes.LOGIN_ATTEMPTS_EXCEEDED, 'Too many login attempts, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
            }

            // Parse the User-Agent header.
            const parser = new UAParser(userAgent);
            const parsedUserAgent = parser.getResult();
            const { browser, os, device } = parsedUserAgent;

            const browserName    = browser.name    || 'Unknown Browser';
            const browserVersion = browser.version || '';

            // UAParser often misses Android model/vendor – try regex fallback to grab the code in parentheses
            let phoneModel = device.model;
            if (!phoneModel && /Android/i.test(userAgent)) {
                const match = userAgent.match(/\(.*Android.*;\s*([^;()]+)\s*(?:;|\))/i);
                phoneModel = match?.[1]?.trim() || '';
            }

            const deviceNo = device.vendor || phoneModel || os.name || 'Unknown Device';
            const deviceInfo = [ browserName, browserVersion, deviceNo ]
            .filter(Boolean)
            .join(' ')
            .trim();

            // Login the user.
            const { accessToken, refreshToken, deviceId, deviceName } = 
                await this.authService.login(user.id, user.email, user.accountLevel, deviceInfo);

            // Return the token.
            return { status: HttpStatus.OK, message: 'Login successful.', accessToken, refreshToken, deviceId, deviceName };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_LOGIN, 'Failed to login', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // // Login AI.
    // @Post('login-ai')
    // @HttpCode(HttpStatus.OK)
    // async loginAi() {
    //     try {
    //         // Login the user.
    //         const token = await this.authService.getPermanentAccessToken(0);

    //         // Return the token.
    //         return { status: HttpStatus.OK, message: 'Login successful.', token };
    //     } catch (error) {
    //         if (error instanceof ErrorHandler) throw error;
    //         console.log(error);
    //         throw new ErrorHandler(ErrorCodes.FAILED_TO_LOGIN, 'Failed to login', HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    // Login with Google.
    @Get('google')
    async googleAuth(@Query('redirect_uri') redirectURI: string, @Res() res: any) {
        // Encode the redirectURI in base64 to pass as state parameter
        const state = redirectURI ? Buffer.from(redirectURI).toString('base64') : '';
        
        // Build the Google OAuth URL with state parameter
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const callbackUrl = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'https://vehicle.kietpep1303.com/api/auth/google/redirect');
        const scope = encodeURIComponent('email profile');
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${callbackUrl}&` +
            `scope=${scope}&` +
            `response_type=code&` +
            `state=${encodeURIComponent(state)}`;
            
        return res.redirect(googleAuthUrl);
    }

    // Google callback.
    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: any) {
        try {
            const payload = req.user;
            const user = await this.authService.findOrCreateUserGoogle(payload);
            const { accessToken, refreshToken, deviceId, deviceName } = await this.authService.login(user.id, user.email, user.accountLevel, 'Google');
            
            // Get the state parameter and decode the redirectURI
            const state = req.query.state;
            const baseRedirectUrl = state ? Buffer.from(state, 'base64').toString() : 'myapp://auth';
            
            console.log('Redirecting to:', baseRedirectUrl);
            const redirectUrl = `${baseRedirectUrl}?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&deviceId=${encodeURIComponent(deviceId)}&deviceName=${encodeURIComponent(deviceName)}`;
            
            return res.redirect(redirectUrl);
        } catch (error) {
            // Get the state parameter for error redirect too
            const state = req.query.state;
            const baseRedirectUrl = state ? Buffer.from(state, 'base64').toString() : 'myapp://auth';
            const errorRedirectUrl = `${baseRedirectUrl}?error=${encodeURIComponent('Authentication failed')}`;
            return res.redirect(errorRedirectUrl);
        }
    }

    // Get all valid refresh tokens of a user.
    @UseGuards(AuthGuard('jwt'))
    @Get('refresh-tokens')
    @HttpCode(HttpStatus.OK)
    async getRefreshTokens(@Req() req: any) {
        try {
            const refreshTokens = await this.authService.getAllValidRefreshTokens(req.user.userId);
            return { status: HttpStatus.OK, message: 'Refresh tokens retrieved successfully.', refreshTokens };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_REFRESH_TOKENS, 'Failed to get refresh tokens', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Renew access token.
    @Post('renew-access-token')
    @HttpCode(HttpStatus.OK)
    async renewAccessToken(@Body('refreshToken') refreshToken: string) {
        try {
            // Validate the refresh token.
            const isValid = await this.authService.validateRefreshToken(refreshToken);
            if (isValid === null) throw new ErrorHandler(ErrorCodes.FAILED_TO_VERIFY_REFRESH_TOKEN, 'Invalid or expired refresh token', HttpStatus.BAD_REQUEST);
            else if (isValid === false) throw new ErrorHandler(ErrorCodes.INCORRECT_REFRESH_TOKEN, 'Incorrect refresh token', HttpStatus.BAD_REQUEST);

            // Get the user information.
            const user = await this.getUserInfoService.findUserById(isValid.userId);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Sign a new access token.
            const accessToken = await this.authService.signAccessToken(
                {
                    userId: isValid.userId,
                    email: isValid.email,
                    accountLevel: user.accountLevel
                }
            );
            // Return the new access token.
            return { status: HttpStatus.OK, message: 'Access token renewed successfully.', accessToken };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_RENEW_ACCESS_TOKEN, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Logout a user.
    @Delete('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body('deviceId') deviceId: string) {
        try {
            // Logout the user.
            await this.authService.logout(deviceId);
            return { status: HttpStatus.OK, message: 'Logout successful.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_LOGOUT, 'Failed to logout', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Change password.
    @UseGuards(AuthGuard('jwt'))
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @Req() req: any,
        @Body() dto: changePasswordDto
    ) {
        try {
            // Get user information.
            const user = await this.getUserInfoService.findUserById(req.user.id);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Check if the old password is correct.
            const isPasswordCorrect = await bcrypt.compare(dto.oldPassword, user.password);
            if (!isPasswordCorrect) throw new ErrorHandler(ErrorCodes.PASSWORD_INCORRECT, 'Invalid password', HttpStatus.BAD_REQUEST);

            // Change password.
            await this.authService.changePassword(user.id, dto.newPassword);

            return { status: HttpStatus.OK, message: 'Password changed successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_CHANGE_PASSWORD, 'Failed to change password', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Forgot password.
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() dto: forgotPasswordDto) {
        try {
            // Get user information.
            const user = await this.getUserInfoService.findUserByEmail(dto.email);
            if (!user) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Get the valid OTP code.
            const otp = await this.otpService.getOtpByUserId(user.id);
            if (!otp) throw new ErrorHandler(ErrorCodes.OTP_EXPIRED, 'OTP code expired', HttpStatus.NOT_FOUND);

            // Check if the OTP code is correct.
            if (otp.otp !== dto.otp) throw new ErrorHandler(ErrorCodes.OTP_INCORRECT, 'OTP code incorrect', HttpStatus.BAD_REQUEST);

            // Delete the OTP code.
            await this.otpService.deleteOtpByUserId(user.id);

            // Change password.
            await this.authService.changePassword(user.id, dto.newPassword);

            return { status: HttpStatus.OK, message: 'Password changed successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_CHANGE_OTP_PASSWORD, 'Failed to change password', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
