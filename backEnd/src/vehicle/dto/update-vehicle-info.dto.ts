import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateVehicleInfoDto {

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    vehicleId: number;

    @IsString()
    @IsOptional()
    title?: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsOptional()
    engine?: string;
  
    @IsString()
    @IsOptional()
    transmission?: string;
  
    @IsString()
    @IsOptional()
    fuelType?: string;
  
    @IsString()
    @IsOptional()
    color?: string;
  
    // Feature flags (all optional)
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    airConditioning?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    gps?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    bluetooth?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    map?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    dashCamera?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    cameraBack?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    collisionSensors?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    ETC?: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    safetyAirBag?: boolean;
  
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    price?: number;
  
    // Vehicle location.
    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    district?: string;
    
    @IsString()
    @IsOptional()
    ward?: string;
    
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    timePickupStart?: string;
  
    @IsString()
    @IsOptional()
    timePickupEnd?: string;
  
    @IsString()
    @IsOptional()
    timeReturnStart?: string;
  
    @IsString()
    @IsOptional()
    timeReturnEnd?: string;
}