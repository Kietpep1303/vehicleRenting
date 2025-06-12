import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UploadNewVehicleDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    year: number;

    @IsString()
    @IsNotEmpty()
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
    @IsNotEmpty()
    engine: string;

    @IsString()
    @IsNotEmpty()
    transmission: string;

    @IsString()
    @IsNotEmpty()
    fuelType: string;

    @IsString()
    @IsNotEmpty()
    color: string;
    
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    seatingCapacity: number;

    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    airConditioning: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    gps: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    bluetooth: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    map: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    dashCamera: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    cameraBack: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    collisionSensors: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    ETC: boolean;
  
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    @IsNotEmpty()
    safetyAirBag: boolean;

    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    vehicleRegistrationId: string;

    @IsString()
    @IsOptional()
    vehicleRegistrationFront?: string;

    @IsString()
    @IsOptional()
    vehicleRegistrationBack?: string;

    // Vehicle location.
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    district: string;
    
    @IsString()
    @IsNotEmpty()
    ward: string;
    
    @IsString()
    @IsNotEmpty()
    address: string;

    // Time pickup and return.
    @IsString()
    @IsNotEmpty()
    timePickupStart: string;

    @IsString()
    @IsNotEmpty()
    timePickupEnd: string;

    @IsString()
    @IsNotEmpty()
    timeReturnStart: string;

    @IsString()
    @IsNotEmpty()
    timeReturnEnd: string;
}