import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class loginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
    
}