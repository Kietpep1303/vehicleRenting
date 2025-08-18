import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleItemDto {
    @IsNumber()
    @Type(() => Number)
    id: number;
  
    @IsNumber()
    @Type(() => Number)
    userId: number;
  
    @IsString()
    title: string;
  
    @IsString()
    imageFront: string;
  
    @IsString()
    imageEnd: string;
  
    @IsString()
    imageRearRight: string;
  
    @IsString()
    imageRearLeft: string;
  
    @IsNumber()
    @Type(() => Number)
    price: number;
  }

  // Add new DTO for rental-confirmation data
export class RentalConfirmationDataDto {
  @IsNumber()
  @Type(() => Number)
  vehicleId: number;

  @IsNotEmpty()
  @IsString()
  startDateTime: string;

  @IsNotEmpty()
  @IsString()
  endDateTime: string;

  @IsNumber()
  @Type(() => Number)
  totalDays: number;

  @IsNumber()
  @Type(() => Number)
  dailyPrice: number;

  @IsNumber()
  @Type(() => Number)
  totalPrice: number;

  @IsNumber()
  @Type(() => Number)
  depositPrice: number;
}

export class AiSendMessageDto {
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    sessionId: number;
  
    @IsNotEmpty()
    @IsIn(['text', 'vehicle', 'rental-confirmation', 'rental'])
    type: 'text' | 'vehicle' | 'rental-confirmation' | 'rental';
  
    // plain text reply
    @ValidateIf((object) => object.type === 'text')
    @IsNotEmpty()
    @IsString()
    content: string;
  
    // up to 3 vehicles
    @ValidateIf((object) => object.type === 'vehicle')
    @IsArray()
    @ArrayMaxSize(3)
    @ValidateNested({ each: true })
    @Type(() => VehicleItemDto)
    vehicles: VehicleItemDto[];

    // rental-confirmation reply
    @ValidateIf((object) => object.type === 'rental-confirmation')
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => RentalConfirmationDataDto)
    data: RentalConfirmationDataDto;
  }
