import { IsString, IsNotEmpty, IsEmail, MinLength, IsNumber } from 'class-validator';

export class forgotPasswordDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    otp: number;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;
    
}