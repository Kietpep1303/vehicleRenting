import { Controller, HttpCode, HttpStatus, Req, Post, Put, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports DTOs.
import { CreateRatingDto } from '../dto/create-rating.dto';
import { EditRatingDto } from '../dto/edit-rating.dto';

// Imports services.
import { CreateEditRatingService } from '../services/createEditRating.service';
import { GetRentalInfoService } from '../../rental/services/getRentalInfo.service';

// Imports entities and enums.
import { RentalStatus } from '../../rental/entities/rental.entity';

// Imports error handling.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@Controller('api/vehicle')
export class CreateEditGetRatingController {
    constructor(
        private readonly createEditRatingService: CreateEditRatingService,
        private readonly getRentalInfoService: GetRentalInfoService,
    ) {}

    // Create a new rating (only if rental completed).
    @UseGuards(AuthGuard('jwt'))
    @RequiredAccountLevel(2)
    @Post('private/create-rating')
    @HttpCode(HttpStatus.OK)
    async createRating(@Req() req: any, @Body() dto: CreateRatingDto) {
        try {
            // Check if the rating is valid.
            if (dto.rating < 1 || dto.rating > 5) throw new ErrorHandler(ErrorCodes.INVALID_RATING, 'Rating must be between 1 and 5', HttpStatus.BAD_REQUEST);

            // Check if the user is already rated this vehicle.
            const isRated = await this.createEditRatingService.isRated(req.user.userId, dto.vehicleId);
            if (isRated) throw new ErrorHandler(ErrorCodes.VEHICLE_ALREADY_RATED, 'User already rated this vehicle', HttpStatus.BAD_REQUEST);

            // Ensure user has a completed rental for this vehicle.
            const hasCompleted = await this.getRentalInfoService.hasCompletedRental(
                req.user.userId,
                dto.vehicleId
            );
            if (!hasCompleted) throw new ErrorHandler(ErrorCodes.INVALID_RENTAL_STATUS, 'User must complete rental before rating', HttpStatus.BAD_REQUEST);

            // Create the rating.
            const rating = await this.createEditRatingService.createRating(
                req.user.userId,
                dto.vehicleId,
                dto.rating,
                dto.comment ?? ''
            );
            return { status: HttpStatus.OK, message: 'Vehicle rated successfully.', data: rating };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.error(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_VEHICLE_RATING, String((error as any).message), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Edit an existing rating (only if rental completed).
    @UseGuards(AuthGuard('jwt'))
    @RequiredAccountLevel(2)
    @Put('private/edit-rating')
    @HttpCode(HttpStatus.OK)
    async editRating(@Req() req: any, @Body() dto: EditRatingDto) {
        try {
            // Check if the rating is valid.
            if (dto.rating < 1 || dto.rating > 5) throw new ErrorHandler(ErrorCodes.INVALID_RATING, 'Rating must be between 1 and 5', HttpStatus.BAD_REQUEST);

            // Check if the user is already rated this vehicle.
            const isRated = await this.createEditRatingService.isRated(req.user.userId, dto.vehicleId);
            if (!isRated) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_RATED, 'User has not rated this vehicle', HttpStatus.BAD_REQUEST);

            // Edit the rating.
            const updated = await this.createEditRatingService.editRating(
                req.user.userId,
                dto.vehicleId,
                dto.rating,
                dto.comment ?? ''
            );
            if (!updated) throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_VEHICLE_RATING, 'Failed to edit rating', HttpStatus.INTERNAL_SERVER_ERROR);
            return { status: HttpStatus.OK, message: 'Rating updated successfully.', data: updated };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.error(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_VEHICLE_RATING, String((error as any).message), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get the average rating of a vehicle.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-average-rating')
    @HttpCode(HttpStatus.OK)
    async getAverageRating(@Query('vehicleId') vehicleId: number) {
        try {
            // Get the average rating of the vehicle.
            const avg = await this.createEditRatingService.getAverageRating(vehicleId);

            if (avg === null) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'No ratings found for this vehicle', HttpStatus.NOT_FOUND);
            
            return { status: HttpStatus.OK, message: 'Average rating fetched successfully.', data: avg };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.error(error);
            throw new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, String((error as any).message), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get paginated ratings of a vehicle, optionally filtered by rating.
    @UseGuards(AuthGuard('jwt'))
    @Get('public/get-vehicle-ratings')
    @HttpCode(HttpStatus.OK)
    async getRatings(
        @Query('vehicleId') vehicleId: number,
        @Query('rating') rating: number = 0,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        try {
            // Get the paginated ratings of the vehicle.
            const result = await this.createEditRatingService.getPaginationRatings(
                vehicleId,
                rating,
                page,
                limit
            );
            return { status: HttpStatus.OK, message: 'Vehicle ratings fetched successfully.', data: result };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.error(error);
            throw new ErrorHandler(ErrorCodes.UNKNOWN_ERROR, String((error as any).message), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
