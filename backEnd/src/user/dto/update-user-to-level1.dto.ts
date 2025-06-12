import { IsString, IsNotEmpty, IsEmail, MinLength, IsNumber } from 'class-validator';

export class UpdateUserToLevel1Dto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    otp: number;
    
}