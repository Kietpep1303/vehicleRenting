import { Controller, Get, Param, HttpStatus, UseGuards } from '@nestjs/common';

// Imports all constants.
import { CAR_BRAND, MOTORCYCLE_BRAND, CAR_MODELS, MOTORCYCLE_MODELS } from '../constants/brandModel.constant';
import { VEHICLE_TYPE } from '../constants/vehicleType.constant';
import { VEHICLE_COLOR } from '../constants/color.constant';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';


@Controller('api/vehicle')
export class GetConstantsController {

    constructor() {}

    // Get all constants.
    @UseGuards(AuthGuard('jwt'))
    @Get('constants')
    async getConstants() {
        return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data: {
            vehicleType: VEHICLE_TYPE,
            carBrand: CAR_BRAND,
            motorcycleBrand: MOTORCYCLE_BRAND,
            color: VEHICLE_COLOR,
        }};
    }

    // Get constants of a brand.
    @UseGuards(AuthGuard('jwt'))
    @Get('constants/:vehicleType/:brand')
    async getConstantsOfBrand(@Param('vehicleType') vehicleType: string, @Param('brand') brand: string) {
        // Check if the vehicle type is valid.
        if (!VEHICLE_TYPE.includes(vehicleType)) throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_TYPE, 'Invalid vehicle type', HttpStatus.BAD_REQUEST);
        if (vehicleType === 'car') {
            const isCarBrand = CAR_BRAND.includes(brand);
            if (!isCarBrand) throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_BRAND, 'Invalid vehicle brand', HttpStatus.BAD_REQUEST);
            return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data: CAR_MODELS[brand] };
        } else {
            const isMotorcycleBrand = MOTORCYCLE_BRAND.includes(brand);
            if (!isMotorcycleBrand) throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_BRAND, 'Invalid vehicle brand', HttpStatus.BAD_REQUEST);
            return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data: MOTORCYCLE_MODELS[brand] };
        }
    }

}
