import { Controller, Get, Param, HttpStatus, UseGuards, Query, Post, Req, Body, Delete } from '@nestjs/common';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';

// Imports services.
import { FavoriteVehicleService } from '../services/favoriteVehicle.service';
import { GetVehicleService } from '../services/getVehicle.service';

@Controller('api/vehicle')
export class FavoriteVehicleController {
    constructor(
        private readonly favoriteVehicleService: FavoriteVehicleService,
        private readonly getVehicleService: GetVehicleService,
    ) {}

    // Create a new favorite vehicle.
    @UseGuards(AuthGuard('jwt'))
    @Post('favorite-vehicle')
    async favoriteVehicle(@Req() req: any, @Body('vehicleId') vehicleId: number) {
        try {
            // Check if the vehicle is valid.
            if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is required', HttpStatus.BAD_REQUEST);
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);

            // Check if the vehicle is already in the favorite list.
            const isFavorite = await this.favoriteVehicleService.checkFavoriteVehicle(req.user.userId, vehicleId);
            if (isFavorite) throw new ErrorHandler(ErrorCodes.VEHICLE_ALREADY_FAVORITE, 'Vehicle already in favorite list', HttpStatus.BAD_REQUEST);

            // Create a new favorite vehicle.
            const result = await this.favoriteVehicleService.createFavoriteVehicle(req.user.userId, vehicleId);
            return { status: HttpStatus.OK, message: 'Favorite vehicle created successfully.', data: result };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_FAVORITE_VEHICLE, 'Failed to create favorite vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Delete a favorite vehicle.
    @UseGuards(AuthGuard('jwt'))
    @Delete('favorite-vehicle')
    async deleteFavoriteVehicle(@Req() req: any, @Body('vehicleId') vehicleId: number) {
        try {
            // Check if the vehicle is valid.
            if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is required', HttpStatus.BAD_REQUEST);
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);

            // Check if the vehicle is in the favorite list.
            const isFavorite = await this.favoriteVehicleService.checkFavoriteVehicle(req.user.userId, vehicleId);
            if (!isFavorite) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FAVORITE, 'Vehicle not in favorite list', HttpStatus.BAD_REQUEST);

            // Delete a favorite vehicle.
            await this.favoriteVehicleService.deleteFavoriteVehicle(req.user.userId, vehicleId);
            return { status: HttpStatus.OK, message: 'Favorite vehicle deleted successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DELETE_FAVORITE_VEHICLE, 'Failed to delete favorite vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all favorite vehicles.
    @UseGuards(AuthGuard('jwt'))
    @Get('favorite-vehicle')
    async getFavoriteVehicles(@Req() req: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        try {
            // Get all favorite vehicles.
            const result = await this.favoriteVehicleService.getFavoriteVehicles(req.user.userId, page, limit);
            return { status: HttpStatus.OK, message: 'Favorite vehicles fetched successfully.', data: result };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_FAVORITE_VEHICLES, 'Failed to get favorite vehicles', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}