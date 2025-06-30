import { Controller, Get, Param, HttpStatus, UseGuards, Query } from '@nestjs/common';

// Imports all constants.
import { CAR_BRAND, MOTORCYCLE_BRAND, CAR_MODELS, MOTORCYCLE_MODELS } from '../constants/brandModel.constant';
import { VEHICLE_TYPE } from '../constants/vehicleType.constant';
import { VEHICLE_COLOR } from '../constants/color.constant';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';

// Imports datasource.
import { DataSource } from 'typeorm';

@Controller('api/vehicle')
export class GetConstantsController {

    constructor(
        private readonly dataSource: DataSource,
    ) {}

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

    // Get constants of province.
    @UseGuards(AuthGuard('jwt'))
    @Get('constants/province')
    async getConstantsOfProvince() {
        const query = `
            SELECT code, name
            FROM provinces
            ORDER BY code ASC
        `;
        
        const rows: { code: string, name: string }[] = await this.dataSource.query(query);
        const data: [string, string][] = rows.map((row) => [row.code, row.name]);
        return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data };
    }

    // Get constants of district.
    @UseGuards(AuthGuard('jwt'))
    @Get('constants/district')
    async getConstantsOfDistrict(@Query('provinceCode') provinceCode: string) {
        // Check if the province code is valid.
        if (!provinceCode) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'Province code is required', HttpStatus.BAD_REQUEST);

        const query = `
            SELECT code, name
            FROM districts
            WHERE province_code = $1
            ORDER BY code ASC
        `;
        
        const rows: { code: string, name: string }[] = await this.dataSource.query(query, [provinceCode]);
        const data: [string, string][] = rows.map((row) => [row.code, row.name]);
        return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data };
    }

    // Get constants of ward.
    @UseGuards(AuthGuard('jwt'))
    @Get('constants/ward')
    async getConstantsOfWard(@Query('districtCode') districtCode: string) {
        // Check if the district code is valid.
        if (!districtCode) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, 'District code is required', HttpStatus.BAD_REQUEST);

        const query = `
            SELECT code, name
            FROM wards
            WHERE district_code = $1
            ORDER BY code ASC
        `;
        
        const rows: { code: string, name: string }[] = await this.dataSource.query(query, [districtCode]);
        const data: [string, string][] = rows.map((row) => [row.code, row.name]);
        return { status: HttpStatus.OK, message: 'Constants fetched successfully.', data };
    }

}
