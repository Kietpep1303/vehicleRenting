import { Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Query, Req, UseGuards, Body } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';

// Imports rental services.
import { OwnerDecisionRentalService } from '../services/ownerDecisionRental.service';
import { GetRentalInfoService } from '../services/getRentalInfo.service';

// Imports rental entity.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';

// Imports dto.
import { OwnerRentalDecisionDto } from '../dto/owner-decision.dto';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

@UseGuards(AuthGuard('jwt'), AccountLevelGuard)
@RequiredAccountLevel(2)
@Controller('api/rental')
export class OwnerDecisionRentalController {

    constructor(
        private readonly ownerDecisionRentalService: OwnerDecisionRentalService,
        private readonly getRentalInfoService: GetRentalInfoService
    ) {}
    
    @Post('owner-rental-decision')
    async ownerRentalDecision(
        @Req() req: any,
        @Body() dto: OwnerRentalDecisionDto
    ) {
        try {
            // Check if the rental exists.
            const rentalResult = await this.getRentalInfoService.getARentalRecord(dto.rentalId);
            if (!rentalResult) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the user is the owner of the rental.
            if (rentalResult.vehicleOwnerId !== req.user.userId) throw new ErrorHandler(ErrorCodes.USER_NOT_VEHICLE_OWNER_OF_RENTAL, 'User is not the owner of the rental', HttpStatus.FORBIDDEN);

            // Check if the rental is already made decision.
            if (rentalResult.status === RentalStatus.CANCELLED) throw new ErrorHandler(ErrorCodes.RENTAL_CANCELLED, 'Rental is cancelled', HttpStatus.BAD_REQUEST);
            if (rentalResult.status !== RentalStatus.OWNER_PENDING) throw new ErrorHandler(ErrorCodes.RENTAL_ALREADY_MADE_DECISION, 'Rental is already made decision', HttpStatus.BAD_REQUEST);

            // Approve OR reject the rental.
            const rental = await this.ownerDecisionRentalService.approveOrRejectRental(rentalResult, dto.status);
            return { status: HttpStatus.OK, message: 'Rental decision made successfully.', data: rental };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_MAKE_OWNER_DECISION, 'Failed to make owner decision', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}