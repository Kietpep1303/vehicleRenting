import { IsString, IsOptional, IsNumber, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator';

export class OwnerRentalDecisionDto {

    @IsNumber()
    @IsNotEmpty()
    rentalId: number;

    @IsBoolean()
    @IsNotEmpty()
    status: boolean;

}