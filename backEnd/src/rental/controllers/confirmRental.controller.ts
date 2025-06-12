import { Controller, Get, HttpStatus, Param, Query, UseGuards, Body, Post, Req } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental services.
import { ConfirmVehicleService } from '../services/confirmVehicle.service';
import { GetRentalInfoService } from '../services/getRentalInfo.service';

// Imports rental entity.
import { RentalStatus } from '../entities/rental.entity';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class ConfirmRentalController {

    constructor(
        private readonly confirmVehicleService: ConfirmVehicleService,
        private readonly getRentalInfoService: GetRentalInfoService
    ) {}

    @Post('confirm-renter-received-vehicle')
    async confirmRenterReceivedVehicle(@Req() req: any, @Body('rentalId') rentalId: number) {
        try {
            // Check if the rental exists.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the rental is in the correct status.
            if (rental.status !== RentalStatus.REMAINING_PAYMENT_PAID) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_IN_CORRECT_STATUS, 'Rental is not in the correct status', HttpStatus.BAD_REQUEST);

            // Check if the user is the vehicle owner of this rental.
            if (rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the vehicle owner', HttpStatus.FORBIDDEN);

            // Confirm the renter received the vehicle.
            const result = await this.confirmVehicleService.confirmRenterReceivedVehicle(rentalId);
            return { status: HttpStatus.OK, message: 'Renter received the vehicle.', data: result };

        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CONFIRM_RENTER_RECEIVED_VEHICLE, 'Failed to confirm renter received vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('confirm-renter-returned-vehicle')
    async confirmRenterReturnedVehicle(@Req() req: any, @Body('rentalId') rentalId: number) {
        try {
            // Check if the rental exists.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the rental is in the correct status.
            if (rental.status !== RentalStatus.RENTER_RECEIVED) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_IN_CORRECT_STATUS, 'Rental is not in the correct status', HttpStatus.BAD_REQUEST);

            // Check if the user is the vehicle owner of this rental.
            if (rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the vehicle owner', HttpStatus.FORBIDDEN);

            // Confirm the renter returned the vehicle.
            const result = await this.confirmVehicleService.confirmRenterReturnedVehicle(rentalId);
            return { status: HttpStatus.OK, message: 'Renter returned the vehicle. The rental is now completed.', data: result };

        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CONFIRM_RENTER_RETURNED_VEHICLE, 'Failed to confirm renter returned vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

