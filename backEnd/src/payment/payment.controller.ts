import { Controller, Post, Req, UseGuards, Body, HttpStatus } from '@nestjs/common';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../common/decorator/accountLevel.decorator';

// Imports payment service.
import { PaymentService } from './payment.service';

// Imports rental service and entity.
import { GetRentalInfoService } from '../rental/services/getRentalInfo.service';
import { RentalStatus } from '../rental/entities/rental.entity';

// Imports error codes.
import { ErrorCodes } from '../errorHandler/errorCodes';
import { ErrorHandler } from '../errorHandler/errorHandler';

@Controller('api/payment')
export class PaymentController {

    constructor(
        private readonly paymentService: PaymentService,
        private readonly getRentalInfoService: GetRentalInfoService
    ) {}

    @UseGuards(AuthGuard('jwt'), AccountLevelGuard)
    @RequiredAccountLevel(2)
    @Post('deposit-payment')
    async depositPayment(@Req() req: any, @Body('rentalId') rentalId: number) {
        try {
            // Check if the renter is the same as the database renter.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);
            if (rental.renterId !== req.user.userId) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the rental is cancelled and the deposit is pending.
            if (rental.status === RentalStatus.CANCELLED) throw new ErrorHandler(ErrorCodes.RENTAL_CANCELLED, 'Rental is cancelled', HttpStatus.BAD_REQUEST);
            if (rental.status !== RentalStatus.DEPOSIT_PENDING) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_DEPOSIT_PENDING, 'Rental is not deposit pending', HttpStatus.BAD_REQUEST);

            // Update the rental to deposit paid.
            const updatedRental = await this.paymentService.updateRentalToDepositPaid(rental);

            // Return the updated rental.
            return { status: HttpStatus.OK, message: 'Deposit payment successful.', data: updatedRental };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_DEPOSIT_PAYMENT, 'Failed to deposit payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @UseGuards(AuthGuard('jwt'), AccountLevelGuard)
    @RequiredAccountLevel(2)
    @Post('remaining-payment-payment')
    async remainingPaymentPayment(@Req() req: any, @Body('rentalId') rentalId: number) {
        try{
            // Check if the renter is the same as the database renter.
            const rental = await this.getRentalInfoService.getARentalRecord(rentalId);
            if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);
            if (rental.renterId !== req.user.userId) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

            // Check if the rental is cancelled and the remaining payment is pending.
            if (rental.status === RentalStatus.CANCELLED) throw new ErrorHandler(ErrorCodes.RENTAL_CANCELLED, 'Rental is cancelled', HttpStatus.BAD_REQUEST);
            if (rental.status !== RentalStatus.CONTRACT_SIGNED) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_REMAINING_PAYMENT_PENDING, 'Rental is not remaining payment pending', HttpStatus.BAD_REQUEST);

            // Update the rental to remaining payment paid.
            const updatedRental = await this.paymentService.updateRentalToRemainingPaymentPaid(rental);

            // Return the updated rental.
            return { status: HttpStatus.OK, message: 'Remaining payment payment successful.', data: updatedRental };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_REMAINING_PAYMENT_PAYMENT, 'Failed to remaining payment payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
