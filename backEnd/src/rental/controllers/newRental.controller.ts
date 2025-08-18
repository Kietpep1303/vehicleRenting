import { Controller, Get, HttpStatus, Param, Query, UseGuards, Body, Post, Req } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental services.
import { CheckAvaliabilityVehicleService } from '../services/checkAvaliabilityVehicle.service';
import { CreateNewRentalRecordService } from '../services/createNewRentalRecord.service';

// Imports vehicle services.
import { GetVehicleService } from '../../vehicle/services/getVehicle.service';

// Imports dto.
import { CreateRentalConfirmationDto } from '../dto/create-rental-confirm.dto';
import { CreateRentalRecordDto } from '../dto/create-rental-record.dto';

// Imports vehicle entity.
import { VehicleStatus } from '../../vehicle/entities/vehicle.entity';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class NewRentalController {

    constructor(
        private readonly checkAvaliabilityVehicleService: CheckAvaliabilityVehicleService,
        private readonly createNewRentalRecordService: CreateNewRentalRecordService,
        private readonly getVehicleService: GetVehicleService
    ) {}

    @Post('create-rental-confirmation')
    async createRentalConfirmation(@Req() req: any, @Body() dto: CreateRentalConfirmationDto) {
        try {
            // Check if vehicle exsists.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.BAD_REQUEST);

            // Check if the vehicle is approved.
            if (vehicle.status !== VehicleStatus.APPROVED) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_APPROVED, 'Vehicle is not approved', HttpStatus.BAD_REQUEST);

            // Check if the endDayTime is greater than the startDateTime.
            if (dto.endDateTime <= dto.startDateTime) throw new ErrorHandler(ErrorCodes.INVALID_DATE_RANGE, 'End date is less than start date', HttpStatus.BAD_REQUEST);

            // Check if vehicle is available.
            const avaliability = await this.checkAvaliabilityVehicleService.checkAvaliabilityForNewRental(dto.vehicleId, dto.startDateTime, dto.endDateTime);
            if (!avaliability) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_AVAILABLE, 'Vehicle is not available', HttpStatus.BAD_REQUEST);

            // Create a rental confirmation.
            const rentalConfirmation = await this.createNewRentalRecordService.createRentalConfirmation(dto);
            return { status: HttpStatus.OK, message: 'Rental confirmation created successfully.', data: rentalConfirmation };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_RENTAL_CONFIRMATION, 'Failed to create rental confirmation', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('create-new-rental')
    async createNewRental(@Req() req: any, @Body() dto: CreateRentalRecordDto) {
        try {
            // Check if vehicle exsists and if the owner is not the same as the renter.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.BAD_REQUEST);
            if (vehicle.userId === req.user.userId) throw new ErrorHandler(ErrorCodes.OWNER_CANT_RENT_THEIR_OWN_VEHICLE, 'Owner can not rent their own vehicle', HttpStatus.BAD_REQUEST);

            // Check if the vehicle is approved.
            if (vehicle.status !== VehicleStatus.APPROVED) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_APPROVED, 'Vehicle is not approved', HttpStatus.BAD_REQUEST);

            // Check if the endDayTime is greater than the startDateTime.
            if (dto.endDateTime <= dto.startDateTime) throw new ErrorHandler(ErrorCodes.INVALID_DATE_RANGE, 'End date is less than start date', HttpStatus.BAD_REQUEST);
             
            // Check if vehicle is available.
            const avaliability = await this.checkAvaliabilityVehicleService.checkAvaliabilityForNewRental(dto.vehicleId, dto.startDateTime, dto.endDateTime);
            if (!avaliability) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_AVAILABLE, 'Vehicle is not available', HttpStatus.BAD_REQUEST);

            // Create a rental confirmation.
            const rental = await this.createNewRentalRecordService.createNewRentalRecord(req.user.userId, dto);
            if (!rental) throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_RENTAL, 'Failed to create rental', HttpStatus.INTERNAL_SERVER_ERROR);

            return { status: HttpStatus.OK, message: 'Rental created successfully.', data: rental };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_RENTAL, 'Failed to create rental', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
