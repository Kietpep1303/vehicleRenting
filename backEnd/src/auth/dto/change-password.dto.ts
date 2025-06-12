import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class changePasswordDto {

    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string;
    
}