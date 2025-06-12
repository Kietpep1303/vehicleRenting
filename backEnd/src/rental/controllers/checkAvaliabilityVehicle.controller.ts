import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental services.
import { CheckAvaliabilityVehicleService } from '../services/checkAvaliabilityVehicle.service';

// Imports vehicle services.
import { GetVehicleService } from '../../vehicle/services/getVehicle.service';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class CheckAvaliabilityVehicleController {

    constructor(
        private readonly checkAvaliabilityVehicleService: CheckAvaliabilityVehicleService,
        private readonly getVehicleService: GetVehicleService
    ) {}

    @Get('check-availability')
    async checkAvaliabilityVehicle(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number, 
        @Query('month') month: number = new Date().getMonth() + 1, 
        @Query('year') year: number = new Date().getFullYear()
    ) {
        try {
            // Check if vehicle ID is provided.
            if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is required', HttpStatus.BAD_REQUEST);

            // Check if month and year are in the past.
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Month and year cannot be in the past', HttpStatus.BAD_REQUEST);
            }

            // Check if the vehicle is exsits.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.BAD_REQUEST);

            // Return the avaliability of the vehicle.
            const avaliability = await this.checkAvaliabilityVehicleService.checkAvaliabilityVehicle(vehicleId, month, year);
            return { status: HttpStatus.OK, message: 'Vehicle avaliability checked successfully.', data: avaliability };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CHECK_VEHICLE_AVALIABILITY, 'Failed to check vehicle avaliability', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
