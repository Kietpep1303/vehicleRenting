import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Query, ParseIntPipe } from '@nestjs/common';

// Imports guards.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

// Imports admin service.
import { AdminService } from './admin.service';

// Imports vehicle service.
import { GetVehicleService } from '../vehicle/services/getVehicle.service';

// Imports user service.
import { GetUserInfoService } from '../user/services/getUserInfo.service';

// Imports vehicle entity.
import { VehicleEntity, VehicleStatus } from '../vehicle/entities/vehicle.entity';

// Imports user entity.
import { UserEntity, UserStatus } from '../user/entities/user.entity';

// Imports error codes.
import { ErrorCodes } from '../errorHandler/errorCodes';
import { ErrorHandler } from '../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(3)
@Controller('api/admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly getVehicleService: GetVehicleService,
        private readonly getUserInfoService: GetUserInfoService
    ) {}

    // Get requested level 2 users with pagination.
    @Get('get-requested-user-level2')
    @HttpCode(HttpStatus.OK)
    async getRequestedUserLevel2Document(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        try {
            // Get requested level 2 users.
            const users = await this.adminService.getRequestedLevel2Users(page, limit);
            return { status: HttpStatus.OK, message: 'Requested level 2 users retrieved successfully.', data: users };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_REQUESTED_LEVEL_2_USERS, 'Failed to get requested level 2 users', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 
    // Get requested vehicles with pagination.
    @Get('get-requested-vehicles')
    @HttpCode(HttpStatus.OK)
    async getRequestedVehicles(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        try {
            // Get requested vehicles.
            const vehicles = await this.adminService.getRequestedVehicles(page, limit);
            return { status: HttpStatus.OK, message: 'Requested vehicles retrieved successfully.', data: vehicles };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_REQUESTED_VEHICLES, 'Failed to get requested vehicles', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Decision a requested level 2 user.
    @Post('decision-requested-user-level2')
    @HttpCode(HttpStatus.OK)
    async decisionRequestedUserLevel2(
        @Body('userId') userId: number, 
        @Body('status') status: boolean, 
        @Body('rejectedReason') rejectedReason?: string
    ) {
        try {
            // Check if the user already made a decision.
            const user = await this.getUserInfoService.findUserById(userId);
            if (user == null) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            if (user.status !== UserStatus.PENDING) {
                throw new ErrorHandler(ErrorCodes.USER_ALREADY_MADE_A_DECISION, 'User already made a decision', HttpStatus.BAD_REQUEST);
            }

            // Approve OR reject a requested level 2 user.
            const result = await this.adminService.approveOrRejectRequestedLevel2User(userId, status, rejectedReason);
            if (result == null) {
                throw new ErrorHandler(ErrorCodes.FAILED_TO_DECISION_REQUESTED_LEVEL_2_USER, 'Failed to decision requested level 2 user', HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return { status: HttpStatus.OK, message: 'Requested level 2 user decision made successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DECISION_REQUESTED_LEVEL_2_USER, 'Failed to decision requested level 2 user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
 
    // Decision a requested vehicle.
    @Post('decision-requested-vehicle')
    @HttpCode(HttpStatus.OK)
    async decisionRequestedVehicle(
        @Body('vehicleId') vehicleId: number, 
        @Body('status') status: boolean,
        @Body('rejectedReason') rejectedReason?: string
    ) {
        try {
            // Check if the vehicle already made a decision.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (vehicle == null) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            
            if (vehicle.status !== VehicleStatus.PENDING) {
                throw new ErrorHandler(ErrorCodes.VEHICLE_ALREADY_MADE_A_DECISION, 'Vehicle already made a decision', HttpStatus.BAD_REQUEST);
            }
            // Approve OR reject a requested vehicle.
            await this.adminService.approveOrRejectRequestedVehicle(vehicleId, status, rejectedReason);
            return { status: HttpStatus.OK, message: 'Requested vehicle decision made successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DECISION_REQUESTED_VEHICLE, 'Failed to decision requested vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
