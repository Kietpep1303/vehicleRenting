import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateRentalRecordDto {

    @IsNumber()
    @IsNotEmpty()
    vehicleId: number;

    @IsString()
    @IsNotEmpty()
    renterPhoneNumber: string;

    @IsDateString()
    @IsNotEmpty()
    startDateTime: Date;

    @IsDateString()
    @IsNotEmpty()
    endDateTime: Date;

}