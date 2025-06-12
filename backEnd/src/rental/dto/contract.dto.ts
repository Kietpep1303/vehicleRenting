import {
    IsNumber,
    IsString,
    IsDateString,
    ValidateNested
  } from 'class-validator';
  import { Type } from 'class-transformer';

  export class ContractDateDto {
    @IsNumber()          day: number;
    @IsNumber()          month: number;
    @IsNumber()          year: number;
  }

  export class RenterInformationDto {
    @IsString()          name: string;
    @IsString()          phoneNumber: string;
    @IsString()          idCardNumber: string;
    @IsString()          driverLicenseNumber: string;
  }

  export class VehicleOwnerInformationDto {
    @IsString()          name: string;
    @IsString()          phoneNumber: string;
    @IsString()          idCardNumber: string;
  }

  export class VehicleInformationDto {
    @IsString()          brand: string;
    @IsString()          model: string;
    @IsNumber()          year: number;
    @IsString()          color: string;
    @IsString()          vehicleRegistrationId: string;
  }

  export class ContractAddressDto {
    @IsString()          city: string;
    @IsString()          district: string;
    @IsString()          ward: string;
    @IsString()          address: string;
  }

  export class RentalInformationDto {
    @IsDateString()      startDateTime: string;
    @IsDateString()      endDateTime: string;
    @IsNumber()          totalDays: number;
    @IsNumber()          totalPrice: number;
    @IsNumber()          depositPrice: number;
  }

  export class VehicleConditionDto {
    @IsString()          outerVehicleCondition: string;
    @IsString()          innerVehicleCondition: string;
    @IsString()          tiresCondition: string;
    @IsString()          engineCondition: string;
    @IsString()          note: string;
  }

  export class ContractDto {
    @ValidateNested()
    @Type(() => ContractDateDto)
    contractDate: ContractDateDto;

    @ValidateNested()
    @Type(() => RenterInformationDto)
    renterInformation: RenterInformationDto;

    @ValidateNested()
    @Type(() => VehicleOwnerInformationDto)
    vehicleOwnerInformation: VehicleOwnerInformationDto;

    @ValidateNested()
    @Type(() => VehicleInformationDto)
    vehicleInformation: VehicleInformationDto;

    @ValidateNested()
    @Type(() => ContractAddressDto)
    contractAddress: ContractAddressDto;

    @ValidateNested()
    @Type(() => RentalInformationDto)
    rentalInformation: RentalInformationDto;

    @ValidateNested()
    @Type(() => VehicleConditionDto)
    vehicleCondition: VehicleConditionDto;
  }