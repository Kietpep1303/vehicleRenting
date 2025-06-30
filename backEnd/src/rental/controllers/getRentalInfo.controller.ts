import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental status.
import { RentalStatus } from '../entities/rental.entity';

// Imports rental services.
import { GetRentalInfoService } from '../services/getRentalInfo.service';

// Imports vehicle services.
import { GetVehicleService } from '../../vehicle/services/getVehicle.service';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class GetRentalInfoController {
    constructor(
        private readonly getRentalInfoService: GetRentalInfoService,
        private readonly getVehicleService: GetVehicleService
    ) {}
    
    // Get current status of a rental [PRIVATE].
    @Get('constants/rental-status')
    async getRentalStatus() {
        try {
            return { status: HttpStatus.OK, message: 'Rental status fetched successfully.', data: RentalStatus };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_RENTAL_STATUS, 'Failed to get rental status', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get a record of a rental [PRIVATE].
    @Get('record')
    async getARentalRecord(
        @Req() req: any,
        @Query('rentalId') rentalId: number
    ) {
        try {
            // Check if the rental ID is provided.
            if (!rentalId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Rental ID is not provided', HttpStatus.BAD_REQUEST);
            
            // Check if the user is the renter or the vehicle owner of the rental.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the user is the renter or the vehicle owner of the rental.
            if (rental.renterId !== req.user.userId && rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_RENTER_OR_OWNER_OF_RENTAL, 'User is not the renter or the vehicle owner of the rental', HttpStatus.FORBIDDEN);

            // Return the rental record.
            return { status: HttpStatus.OK, message: 'Rental record fetched successfully.', data: rental };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_A_RENTAL_RECORD, 'Failed to get a rental record', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all rentals of a user [PRIVATE, PAGINATION].
    @Get('renter/all')
    async getAllRenterRentals(
        @Req() req: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Get all rentals of the user.
            const rentals = await this.getRentalInfoService.getAllRenterRentals(req.user.userId, page, limit);

            // Return the rentals.
            return { status: HttpStatus.OK, message: 'All renter rentals fetched successfully.', data: rentals };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_ALL_RENTER_RENTALS, 'Failed to get all renter rentals', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all rentals of a vehicle's OWNER [PRIVATE, PAGINATION].
    @Get('vehicle/all')
    async getAllRentalOfAVehicle(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Check if the vehicle ID is provided.
            if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is not provided', HttpStatus.BAD_REQUEST);

            // Check if the vehicle exsists and if the owner is the same as the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.BAD_REQUEST);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.BAD_REQUEST);

            // Get all rentals of the vehicle.
            const rentals = await this.getRentalInfoService.getAllRentalOfAVehicle(vehicleId, page, limit);

            // Return the rentals.
            return { status: HttpStatus.OK, message: 'All vehicle rentals fetched successfully.', data: rentals };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_ALL_RENTAL_OF_A_VEHICLE, 'Failed to get all rental of a vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all current rentals of a user [PRIVATE, PAGINATION].
    @Get('renter/current-status')
    async getAllCurrentStatusRentals(
        @Req() req: any,
        @Query('status') status: RentalStatus,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Check if the status is provided and valid.
            if (!status) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Status is not provided', HttpStatus.BAD_REQUEST);
            if (!Object.values(RentalStatus).includes(status)) throw new ErrorHandler(ErrorCodes.INVALID_RENTAL_STATUS, 'Invalid rental status', HttpStatus.BAD_REQUEST);

            // Get all current status rentals of the user.
            const rentals = await this.getRentalInfoService.getAllCurrentStatusRentals(req.user.userId, status, page, limit);

            // Return the rentals.
            return { status: HttpStatus.OK, message: 'All current status rentals fetched successfully.', data: rentals };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_CURRENT_STATUS_RENTER_RENTAL, 'Failed to get all current status rentals', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all current status rentals of a vehicle's OWNER [PRIVATE, PAGINATION].
    @Get('vehicle/current-status')
    async getAllCurrentStatusRentalOfAVehicle(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number,
        @Query('status') status: RentalStatus,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Check if the vehicle ID is provided.
            if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is not provided', HttpStatus.BAD_REQUEST);

            // Check if the vehicle exsists and if the owner is the same as the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.BAD_REQUEST);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.BAD_REQUEST);

            // Check if the status is provided and valid.
            if (!status) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Status is not provided', HttpStatus.BAD_REQUEST);
            if (!Object.values(RentalStatus).includes(status)) throw new ErrorHandler(ErrorCodes.INVALID_RENTAL_STATUS, 'Invalid rental status', HttpStatus.BAD_REQUEST);

            // Get all current status rentals of the vehicle.
            const rentals = await this.getRentalInfoService.getAllCurrentStatusRentalOfAVehicle(vehicleId, status, page, limit);

            // Return the rentals.
            return { status: HttpStatus.OK, message: 'All current status rentals of a vehicle fetched successfully.', data: rentals };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_ALL_CURRENT_STATUS_RENTAL_OF_A_VEHICLE, 'Failed to get all current status rentals of a vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all the owner's vehicles that owner pending [PRIVATE, PAGINATION].
    @Get('vehicle-owner/status')
    async getAllOwnerStatusVehicles(
        @Req() req: any,
        @Query('status') status: RentalStatus,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Check if the status is provided and valid.
            if (!status) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Status is not provided', HttpStatus.BAD_REQUEST);
            if (!Object.values(RentalStatus).includes(status)) throw new ErrorHandler(ErrorCodes.INVALID_RENTAL_STATUS, 'Invalid rental status', HttpStatus.BAD_REQUEST);

            // Get all the owner's vehicles that owner pending.
            const rentals = await this.getRentalInfoService.getAllOwnerStatusRentals(req.user.userId, status, page, limit);

            // Return the rentals.
            return { status: HttpStatus.OK, message: 'All owner pending vehicles fetched successfully.', data: rentals };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, 'Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
