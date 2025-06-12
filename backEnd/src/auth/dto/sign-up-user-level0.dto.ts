import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpUserLevel0Dto {

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

}