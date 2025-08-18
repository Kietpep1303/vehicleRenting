import { Controller, HttpCode, HttpStatus, Req, Get, Param, Query, UseGuards, Delete, ParseIntPipe, Put} from '@nestjs/common';

// Imports services.
import { CreateUpdateDeleteVehicleService } from '../services/createUpdateDeleteVehicle.service';
import { GetVehicleService } from '../services/getVehicle.service';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';

// Imports vehicle entity.
import { VehicleStatus } from '../entities/vehicle.entity';


@Controller('api/vehicle')
export class VehicleController {
    constructor(
        private readonly getVehicleService: GetVehicleService,
        private readonly createUpdateDeleteVehicleService: CreateUpdateDeleteVehicleService,
    ) {}

    // Delete user vehicle by id.
    @UseGuards(AuthGuard('jwt'))
    @Delete('private/delete-vehicle-id')
    @HttpCode(HttpStatus.OK)
    async deleteUserVehicleById(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number
    ) {
        try {
            // Check if the vehicle is owned by the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);

            // Check if the vehicle is suspended.
            if (vehicle.status === VehicleStatus.SUSPENDED) throw new ErrorHandler(ErrorCodes.VEHICLE_SUSPENDED, 'Vehicle is suspended', HttpStatus.BAD_REQUEST);
            
            // Delete the vehicle.
            await this.createUpdateDeleteVehicleService.deleteVehicle(vehicleId);
            return { status: HttpStatus.OK, message: 'Vehicle deleted successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DELETE_VEHICLE, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Temporarily hide a vehicle.
    @UseGuards(AuthGuard('jwt'))
    @Put('private/hide-vehicle-id')
    @HttpCode(HttpStatus.OK)
    async hideVehicle(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number
    ) {
        try {
            // Check if the vehicle is owned by the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);

            // Check if the vehicle is suspended.
            if (vehicle.status === VehicleStatus.SUSPENDED) throw new ErrorHandler(ErrorCodes.VEHICLE_SUSPENDED, 'Vehicle is suspended', HttpStatus.BAD_REQUEST);

            // Check if the vehicle is already hidden.
            if (vehicle.status === VehicleStatus.HIDDEN) throw new ErrorHandler(ErrorCodes.VEHICLE_ALREADY_HIDDEN, 'Vehicle is already hidden', HttpStatus.BAD_REQUEST);

            // Check if the vehicle is approved.
            if (vehicle.status !== VehicleStatus.APPROVED) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_APPROVED, 'Vehicle is not approved', HttpStatus.BAD_REQUEST);

            // Hide the vehicle.
            await this.createUpdateDeleteVehicleService.hideVehicle(vehicle);
            return { status: HttpStatus.OK, message: 'Vehicle hidden successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_HIDE_VEHICLE, 'Failed to hide vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Unhide a vehicle.
    @UseGuards(AuthGuard('jwt'))
    @Put('private/unhide-vehicle-id')
    @HttpCode(HttpStatus.OK)
    async unhideVehicle(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number
    ) {
        try {
            // Check if the vehicle is owned by the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);

            // Check if the vehicle is suspended.
            if (vehicle.status === VehicleStatus.SUSPENDED) throw new ErrorHandler(ErrorCodes.VEHICLE_SUSPENDED, 'Vehicle is suspended', HttpStatus.BAD_REQUEST);
            
            // Check if the vehicle is already unhidden.
            if (vehicle.status !== VehicleStatus.HIDDEN) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_HIDDEN, 'Vehicle is not hidden', HttpStatus.BAD_REQUEST);

            // Unhide the vehicle.
            await this.createUpdateDeleteVehicleService.unhideVehicle(vehicle);
            return { status: HttpStatus.OK, message: 'Vehicle unhidden successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_UNHIDE_VEHICLE, 'Failed to unhide vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Get user all vehicles.
    @UseGuards(AuthGuard('jwt'))
    @Get('private/get-user-vehicles')
    @HttpCode(HttpStatus.OK)
    async getUserVehicles(
        @Req() req: any,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Get the user's vehicles.
            const vehicles = await this.getVehicleService.getVehiclesByAccountOwner(req.user.userId, page, limit);
            return { status: HttpStatus.OK, message: 'User vehicles fetched successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_VEHICLES_BY_ACCOUNT_OWNER, 'Failed to get vehicles by account owner', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get user vehicle by id.
    @UseGuards(AuthGuard('jwt'))
    @Get('private/get-user-vehicle-id')
    @HttpCode(HttpStatus.OK)
    async getUserVehicleById(
        @Req() req: any,
        @Query('vehicleId') vehicleId: number
    ) {
        try {
            // Check if the vehicle is owned by the user.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicle.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);

            // Return the vehicle.
            return { status: HttpStatus.OK, message: 'User vehicle fetched successfully.', data: vehicle };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_VEHICLE_BY_ID, 'Failed to get vehicle by id', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get public vehicle by id.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-vehicle-by-id')
    @HttpCode(HttpStatus.OK)
    async getPublicVehicleById(
        @Query('vehicleId') vehicleId: number
    ) {
        try {
            // Get the vehicle.
            const vehicle = await this.getVehicleService.getVehicleByIdPublic(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            return { status: HttpStatus.OK, message: 'Public vehicle fetched successfully.', data: vehicle };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_VEHICLE_BY_ID, 'Failed to get vehicle by id', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get public most views vehicles in the last 30 days.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-most-views-vehicles-30days')
    @HttpCode(HttpStatus.OK)
    async getMostViewsVehicles30days(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Get the most views vehicles in the last 30 days.
            const vehicles = await this.getVehicleService.getVehiclesByMostViews30days(page, limit);
            return { status: HttpStatus.OK, message: 'Most views vehicles in the last 30 days fetched successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_MOST_VIEWED_VEHICLES_30D, 'Failed to get vehicles by most views 30 days', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get public most views vehicles all the time.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-most-views-vehicles')
    @HttpCode(HttpStatus.OK)
    async getMostViewsVehiclesAllTime(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Get the most views vehicles all the time.
            const vehicles = await this.getVehicleService.getVehiclesByMostViewsAllTime(page, limit);
            return { status: HttpStatus.OK, message: 'Most views vehicles all the time fetched successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_MOST_VIEWED_VEHICLES, 'Failed to get vehicles by most views', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get public recent approved vehicles.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-recent-approved-vehicles')
    @HttpCode(HttpStatus.OK)
    async getRecentApprovedVehicles(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        try {
            // Get the recent approved vehicles.
            const vehicles = await this.getVehicleService.getRecentApprovedVehicles(page, limit);
            return { status: HttpStatus.OK, message: 'Recent approved vehicles fetched successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_RECENT_VEHICLES, 'Failed to get vehicles by recent approved', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get public random approved vehicles.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-random-approved-vehicles')
    @HttpCode(HttpStatus.OK)
    async getRandomApprovedVehicles() {
        try {
            // Get the random approved vehicles.
            const vehicles = await this.getVehicleService.getRandomApprovedVehicles();
            return { status: HttpStatus.OK, message: 'Random approved vehicles fetched successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_RANDOM_VEHICLES, 'Failed to get vehicles by random approved', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get filter vehicles.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-filter-vehicles')
    @HttpCode(HttpStatus.OK)
    async getFilterVehicles(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('title') title?: string,
        @Query('vehicleType') vehicleType?: string,
        @Query('brand') brand?: string,
        @Query('model') model?: string,
        @Query('year') year?: number,
        @Query('color') color?: string,
        @Query('city') city?: string,
        @Query('district') district?: string,
        @Query('startDateTime') startDateTime?: Date,
        @Query('endDateTime') endDateTime?: Date
    ) {
        const result = await this.getVehicleService.getVehiclesByFilters(
            title, vehicleType, brand, model, year, color, city, district, startDateTime, endDateTime, page, limit
        );
        return {
            status: HttpStatus.OK,
            message: 'Filtered vehicles fetched successfully.',
            data: result,
        };
    }
}