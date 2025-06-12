import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    vehicleId: number;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;
} 