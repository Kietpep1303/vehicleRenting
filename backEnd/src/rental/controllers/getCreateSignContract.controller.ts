import { Controller, Get, HttpStatus, Param, Query, UseGuards, UsePipes, ValidationPipe, Body, Post, Req, ParseIntPipe } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental services.
import { GetRentalInfoService } from '../services/getRentalInfo.service';
import { GetCreateSignContractService } from '../services/getCreateSignContract.service';

// Imports rental entity.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';

// Imports vehicle services.
import { GetVehicleService } from '../../vehicle/services/getVehicle.service';

// Imports user services.
import { GetUserInfoService } from '../../user/services/getUserInfo.service';

// Imports auth services.
import { AuthService } from '../../auth/services/auth.service';

// Imports dto.
import { CreateRentalConfirmationDto } from '../dto/create-rental-confirm.dto';
import { CreateRentalRecordDto } from '../dto/create-rental-record.dto';
import { ContractDto } from '../dto/contract.dto';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ContractStatus } from '../entities/contract.entity';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class GetCreateSignContractController {
    constructor(
        private readonly getCreateSignContractService: GetCreateSignContractService,
        private readonly getRentalInfoService: GetRentalInfoService,
        private readonly getUserInfoService: GetUserInfoService,
        private readonly authService: AuthService
    ) {}

    // Get the prepared contract.
    @Get('prepare-contract')
    async prepareContract(@Req() req: any, @Query('rentalId') rentalId: number) {
        try {
            // Check if the rental exists.
            if (!rentalId) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the rental is in the correct status.
            if (rental.status !== RentalStatus.OWNER_APPROVED) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_IN_CORRECT_STATUS, 'Rental is not in the correct status', HttpStatus.BAD_REQUEST);

            // Check if the user is the owner of the rental.
            if (rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the owner of the rental', HttpStatus.FORBIDDEN);

            // Get the prepared contract.
            const contract = await this.getCreateSignContractService.getPreparedContract(rentalId);
            return { status: HttpStatus.OK, message: 'Contract prepared successfully.', data: contract };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_PREPARED_CONTRACT, 'Failed to get prepared contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all contracts from a rental ID.
    @Get('get-all-contracts-from-rental-id')
    async getAllContractsFromRentalId(@Req() req: any, @Query('rentalId') rentalId: number) {
        try {
            // Check if the rental exists.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the user is the renter or the vehicle owner of the rental.
            if (rental.renterId !== req.user.userId && rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_RENTER_OR_OWNER_OF_RENTAL, 'User is not the renter or the vehicle owner of the rental', HttpStatus.FORBIDDEN);

            // Get all contracts from the rental.
            const contracts = await this.getCreateSignContractService.getContractsFromRentalId(rentalId);
            return { status: HttpStatus.OK, message: 'Contracts retrieved successfully.', data: contracts };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_ALL_CONTRACTS_FROM_RENTAL_ID, 'Failed to get all contracts from rental ID', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    
    }

    // Get the contract by ID.
    @Get('get-contract-by-id')
    async getContractById(@Req() req: any, @Query('contractId') contractId: string) {
        try {
            // Check if the contract exists.
            const contract = await this.getCreateSignContractService.getContractFromContractId(contractId);
            if (!contract) throw new ErrorHandler(ErrorCodes.CONTRACT_NOT_FOUND, 'Contract not found', HttpStatus.BAD_REQUEST);

           // Get contract details.
           return { status: HttpStatus.OK, message: 'Contract retrieved successfully.', data: contract };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_GET_CONTRACT_BY_ID, 'Failed to get contract by ID', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create the contract.
    @Post('create-contract')
    async createContract(
        @Req() req: any,
        @Query('rentalId') rentalId: number,
        @Body() body: ContractDto
    ) {
        try {
            // Check if the rental exists and the status is contract pending.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);
            if (rental.status !== RentalStatus.OWNER_APPROVED) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_IN_CORRECT_STATUS, 'Rental is not in the correct status', HttpStatus.BAD_REQUEST);

            // Check if the user is the owner of the rental.
            if (rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the owner of the rental', HttpStatus.FORBIDDEN);
            
            // Create the contract.
            const contract = await this.getCreateSignContractService.createContract(rentalId, body);
            return { status: HttpStatus.OK, message: 'Contract created successfully.', data: contract };

        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_CREATE_CONTRACT, 'Failed to create contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Renter sign the contract.
    @Post('renter-sign-contract')
    async renterSignContract(
        @Req() req: any, 
        @Body('contractId') contractId: string, 
        @Body('decision') decision: boolean,
        @Body('password') password: string
    ) {
        try {
            // Check if the contract exists.
            const contract = await this.getCreateSignContractService.getContractFromContractId(contractId);
            if (!contract) throw new ErrorHandler(ErrorCodes.CONTRACT_NOT_FOUND, 'Contract not found', HttpStatus.BAD_REQUEST);
            if (contract.renterStatus !== ContractStatus.PENDING) throw new ErrorHandler(ErrorCodes.CONTRACT_NOT_IN_CORRECT_STATUS, 'Contract is signed or rejected', HttpStatus.BAD_REQUEST);
            
            // Check if the rental exists.
            const rental = await this.getRentalInfoService.getARentalRecord(contract.rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);
            
            // Check if the user is the renter of the rental.
            if (rental.renterId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_RENTER, 'User is not the renter of the rental', HttpStatus.FORBIDDEN);

            // Validate the password.
            const isValid = await this.authService.validatePassword(req.user.userId, password);
            if (!isValid) throw new ErrorHandler(ErrorCodes.PASSWORD_INCORRECT, 'Password is incorrect', HttpStatus.BAD_REQUEST);

            // Sign the contract.
            const signedContract = await this.getCreateSignContractService.renterDecisionToSignContract(contractId, decision);
            return { status: HttpStatus.OK, message: 'Contract signed successfully.', data: signedContract };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_RENTER_SIGN_CONTRACT, 'Failed to renter sign contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Vehicle owner sign the contract.
    @Post('vehicle-owner-sign-contract')
    async vehicleOwnerSignContract(
        @Req() req: any, 
        @Body('contractId') contractId: string, 
        @Body('decision') decision: boolean,
        @Body('password') password: string
    ) {
        try {
            // Check if the contract exists.
            const contract = await this.getCreateSignContractService.getContractFromContractId(contractId);
            if (!contract) throw new ErrorHandler(ErrorCodes.CONTRACT_NOT_FOUND, 'Contract not found', HttpStatus.BAD_REQUEST);
            if (contract.ownerStatus !== ContractStatus.PENDING) throw new ErrorHandler(ErrorCodes.CONTRACT_NOT_IN_CORRECT_STATUS, 'Contract is signed or rejected', HttpStatus.BAD_REQUEST);

            // Check if the rental exists.
            const rental = await this.getRentalInfoService.getARentalRecord(contract.rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the user is the vehicle owner of the rental.
            if (rental.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the vehicle owner of the rental', HttpStatus.FORBIDDEN);

            // Validate the password.
            const isValid = await this.authService.validatePassword(req.user.userId, password);
            if (!isValid) throw new ErrorHandler(ErrorCodes.PASSWORD_INCORRECT, 'Password is incorrect', HttpStatus.BAD_REQUEST);

            // Sign the contract.
            const signedContract = await this.getCreateSignContractService.vehicleOwnerDecisionToSignContract(contractId, decision);
            return { status: HttpStatus.OK, message: 'Contract signed successfully.', data: signedContract };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_VEHICLE_OWNER_SIGN_CONTRACT, 'Failed to vehicle owner sign contract', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

