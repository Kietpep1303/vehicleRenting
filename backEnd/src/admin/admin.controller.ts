import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Body, Query, ParseIntPipe, Inject, forwardRef } from '@nestjs/common';

// Imports guards.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

// Imports admin service.
import { AdminService } from './services/admin.service';

// Imports admin gateway.
import { AdminGateway } from './admin.gateway';

// Imports vehicle service.
import { GetVehicleService } from '../vehicle/services/getVehicle.service';

// Imports user service.
import { GetUserInfoService } from '../user/services/getUserInfo.service';

// Imports get-create-delete service.
import { GetCreateDeleteUserVehicleService } from './services/getCreateDeleteUserVehicle.service';

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
        @Inject(forwardRef(() => AdminGateway)) private readonly adminGateway: AdminGateway,
        private readonly adminService: AdminService,
        private readonly getVehicleService: GetVehicleService,
        private readonly getUserInfoService: GetUserInfoService,
        private readonly getCreateDeleteService: GetCreateDeleteUserVehicleService,
    ) {}

    // Get details level 2 user information.
    @Get('get-details-level2-user')
    @HttpCode(HttpStatus.OK)
    async getDetailsLevel2User(@Query('userId') userId: number) {
        try {
            // Get details level 2 user information.
            const user = await this.getUserInfoService.findUserById(userId);
            if (user == null) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

            // Set the admin is watching the requested user level 2.
            this.adminGateway.setAdminWatchingRequestedUserLevel2(userId);

            // Remove the password from the user.
            const { password, ...userWithoutPassword } = user;

            return { status: HttpStatus.OK, message: 'Data level 2 user retrieved successfully.', data: userWithoutPassword };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_REQUESTED_LEVEL_2_USERS, 'Failed to get details level 2 user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get details vehicle information.
    @Get('get-details-vehicle')
    @HttpCode(HttpStatus.OK)
    async getDetailsVehicle(@Query('vehicleId') vehicleId: number) {
        try {
            // Get details vehicle information.
            const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
            if (vehicle == null) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);

            // Set the admin is watching the requested vehicle.
            this.adminGateway.setAdminWatchingRequestedVehicle(vehicleId);

            return { status: HttpStatus.OK, message: 'Details vehicle information retrieved successfully.', data: vehicle };
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
            await this.adminService.approveOrRejectRequestedLevel2User(userId, status, rejectedReason);

            // Set the admin decision the requested user level 2.
            this.adminGateway.setAdminDecisionRequestedUserLevel2(userId);

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

            // Set the admin decision the requested vehicle.
            this.adminGateway.setAdminDecisionRequestedVehicle(vehicleId);

            return { status: HttpStatus.OK, message: 'Requested vehicle decision made successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DECISION_REQUESTED_VEHICLE, 'Failed to decision requested vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get paginated/filterable users
    @Get('get-users')
    @HttpCode(HttpStatus.OK)
    async getUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('accountLevelMin') accountLevelMin?: number,
        @Query('accountLevelMax') accountLevelMax?: number,
        @Query('sortBy') sortBy: keyof UserEntity = 'createdAt',
        @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
        @Query('search') search?: string,
        @Query('statusFilter') statusFilter?: 'ACTIVE' | 'SUSPENDED',
    ) {
        const result = await this.getCreateDeleteService.getCurrentUsers(
            page,
            limit,
            accountLevelMin,
            accountLevelMax,
            sortBy,
            sortOrder,
            search,
            statusFilter,
        );
        return {
            status: HttpStatus.OK,
            message: 'Users retrieved successfully.',
            data: result,
        };
    }

    // Get paginated/filterable vehicles
    @Get('get-vehicles')
    @HttpCode(HttpStatus.OK)
    async getVehicles(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('statusFilter') statusFilter?: VehicleStatus,
        @Query('search') search?: string,
    ) {
        const result = await this.getCreateDeleteService.getCurrentVehicles(
            page,
            limit,
            statusFilter,
            search,
        );
        return {
            status: HttpStatus.OK,
            message: 'Vehicles retrieved successfully.',
            data: result,
        };
    }

    // Get user statistics counts
    @Get('users-statistics')
    @HttpCode(HttpStatus.OK)
    async getUsersStatistics() {
        const stats = await this.getCreateDeleteService.getNumberOfUsers();
        return { status: HttpStatus.OK, message: 'User statistics', data: stats };
    }

    // Get vehicle statistics counts
    @Get('vehicles-statistics')
    @HttpCode(HttpStatus.OK)
    async getVehiclesStatistics() {
        const stats = await this.getCreateDeleteService.getNumberOfVehicles();
        return { status: HttpStatus.OK, message: 'Vehicle statistics', data: stats };
    }

    // Suspend user
    @Post('suspend-user')
    @HttpCode(HttpStatus.OK)
    async suspendUser(@Body('userId') userId: number) {

        // Check if the user exists.
        if (!userId) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
        const user = await this.getUserInfoService.findUserById(userId);
        if (user == null) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

        await this.getCreateDeleteService.suspendUser(userId);
        return { status: HttpStatus.OK, message: 'User suspended successfully.' };
    }

    // Unsuspend user
    @Post('unsuspend-user')
    @HttpCode(HttpStatus.OK)
    async unsuspendUser(
        @Body('userId') userId: number,
        @Body('status') status: UserStatus = UserStatus.APPROVED,
    ) {
        // Check if the user exists.
        if (!userId) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
        const user = await this.getUserInfoService.findUserById(userId);
        if (user == null) throw new ErrorHandler(ErrorCodes.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);

        await this.getCreateDeleteService.unsuspendUser(userId, status);
        return { status: HttpStatus.OK, message: 'User unsuspended successfully.' };
    }

    // Suspend vehicle
    @Post('suspend-vehicle')
    @HttpCode(HttpStatus.OK)
    async suspendVehicle(@Body('vehicleId') vehicleId: number) {
        // Check if the vehicle exists.
        if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is required', HttpStatus.BAD_REQUEST);
        const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
        if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);

        await this.getCreateDeleteService.suspendVehicle(vehicleId);
        return { status: HttpStatus.OK, message: 'Vehicle suspended successfully.' };
    }
    
    // Unsuspend vehicle
    @Post('unsuspend-vehicle')
    @HttpCode(HttpStatus.OK)
    async unsuspendVehicle(@Body('vehicleId') vehicleId: number) {
        // Check if the vehicle exists.
        if (!vehicleId) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle ID is required', HttpStatus.BAD_REQUEST);
        const vehicle = await this.getVehicleService.getVehicleByIdPrivate(vehicleId);
        if (!vehicle) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);

        // Check if the vehicle is suspended.
        if (vehicle.status !== VehicleStatus.SUSPENDED) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Vehicle is not suspended', HttpStatus.BAD_REQUEST);

        await this.getCreateDeleteService.unsuspendVehicle(vehicleId);
        return { status: HttpStatus.OK, message: 'Vehicle unsuspended successfully.' };
    }
}
