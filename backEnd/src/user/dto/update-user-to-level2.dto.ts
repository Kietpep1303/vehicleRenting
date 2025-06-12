import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class UpdateUserToLevel2Dto {
    
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @Length(12, 12)
    idCardNumber: string;

    @IsOptional()
    @IsString()
    idCardFront?: string;

    @IsOptional()
    @IsString()
    idCardBack?: string;

    @IsString()
    @IsNotEmpty()
    driverLicense: string;

    @IsOptional()
    @IsString()
    driverLicenseFront?: string;

    @IsOptional()
    @IsString()
    driverLicenseBack?: string;
}