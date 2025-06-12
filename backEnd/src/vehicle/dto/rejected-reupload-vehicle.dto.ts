import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class RejectedReuploadVehicleDto {

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    vehicleId: number;

    @IsString()
    @IsOptional()
    title: string;

    @IsString()
    @IsOptional()
    brand: string;

    @IsString()
    @IsOptional()
    model: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    year: number;

    @IsString()
    @IsOptional()
    vehicleType: string;

    // 4 required images.
    @IsOptional()
    @IsString()
    imageFront?: string;

    @IsOptional()
    @IsString()
    imageEnd?: string;

    @IsOptional()
    @IsString()
    imageRearRight?: string;

    @IsOptional()
    @IsString()
    imageRearLeft?: string;

    // 5 optional images.
    @IsString()
    @IsOptional()
    imagePic1?: string;

    @IsString()
    @IsOptional()
    imagePic2?: string;

    @IsString()
    @IsOptional()
    imagePic3?: string;

    @IsString()
    @IsOptional()
    imagePic4?: string;

    @IsString()
    @IsOptional()
    imagePic5?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    engine: string;

    @IsString()
    @IsOptional()
    transmission: string;

    @IsString()
    @IsOptional()
    fuelType: string;

    @IsString()
    @IsOptional()
    color: string;
    
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    seatingCapacity: number;

    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    airConditioning: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    gps: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    bluetooth: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    map: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    dashCamera: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    cameraBack: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    collisionSensors: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    ETC: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsOptional()
    safetyAirBag: boolean;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    price: number;

    @IsString()
    @IsOptional()
    vehicleRegistrationId?: string;

    @IsString()
    @IsOptional()
    vehicleRegistrationFront?: string;

    @IsString()
    @IsOptional()
    vehicleRegistrationBack?: string;

    // Vehicle location.
    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    district: string;
    
    @IsString()
    @IsOptional()
    ward: string;
    
    @IsString()
    @IsOptional()
    address: string;

    // Time pickup and return.
    @IsString()
    @IsOptional()
    timePickupStart: string;

    @IsString()
    @IsOptional()
    timePickupEnd: string;

    @IsString()
    @IsOptional()
    timeReturnStart: string;

    @IsString()
    @IsOptional()
    timeReturnEnd: string;
    
}