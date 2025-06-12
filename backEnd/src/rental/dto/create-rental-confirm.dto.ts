import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateRentalConfirmationDto {

    @IsNumber()
    @IsNotEmpty()
    vehicleId: number;

    @IsDateString()
    @IsNotEmpty()
    startDateTime: Date;

    @IsDateString()
    @IsNotEmpty()
    endDateTime: Date;

}