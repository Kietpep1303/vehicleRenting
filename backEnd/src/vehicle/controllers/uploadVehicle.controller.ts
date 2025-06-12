import { Controller, HttpCode, HttpStatus, Post, Req, UseInterceptors, UploadedFiles, Body, Get, Param, Query, UseGuards, Put, Delete} from '@nestjs/common';

// Imports error codes.
import { ErrorCodes } from '../../errorHandler/errorCodes';
import { ErrorHandler } from '../../errorHandler/errorHandler';

// Imports JWT.
import { AuthGuard } from '@nestjs/passport';
import { AccountLevelGuard } from '../../common/guards/accountLevel.guard';
import { RequiredAccountLevel } from '../../common/decorator/accountLevel.decorator';


// Imports file interceptor.
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Imports dto.
import { UploadNewVehicleDto } from '../dto/upload-new-vehicle.dto';
import { UpdateVehicleInfoDto } from '../dto/update-vehicle-info.dto';
import { RejectedReuploadVehicleDto } from '../dto/rejected-reupload-vehicle.dto';

// Imports vehicle status.
import { VehicleStatus } from '../entities/vehicle.entity';

// Imports services.
import { CreateUpdateDeleteVehicleService } from '../services/createUpdateDeleteVehicle.service';
import { VehicleValidationService } from '../services/vehicleValidation.service';
import { GetVehicleService } from '../services/getVehicle.service';

@Controller('api/vehicle')
export class UploadVehicleController {

    constructor(
        private readonly createUpdateDeleteVehicleService: CreateUpdateDeleteVehicleService,
        private readonly vehicleValidationService: VehicleValidationService,
        private readonly getVehicleService: GetVehicleService,
    ) {}

    // Request to upload a new vehicle.
    @UseGuards(AuthGuard('jwt'), AccountLevelGuard)
    @RequiredAccountLevel(2)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'imageFront', maxCount: 1 },
            { name: 'imageEnd', maxCount: 1 },
            { name: 'imageRearRight', maxCount: 1 },
            { name: 'imageRearLeft', maxCount: 1 },
            { name: 'imagePic1', maxCount: 1 },
            { name: 'imagePic2', maxCount: 1 },
            { name: 'imagePic3', maxCount: 1 },
            { name: 'imagePic4', maxCount: 1 },
            { name: 'imagePic5', maxCount: 1 },
            { name: 'vehicleRegistrationFront', maxCount: 1 },
            { name: 'vehicleRegistrationBack', maxCount: 1 }
        ],
        {
            storage: memoryStorage(),
            limits: { fileSize: 1024 * 1024 * 5 }, // Limit the file size to 5MB.
        }),
    )
    @Post('request-upload-new-vehicle')
    @HttpCode(HttpStatus.CREATED)
    async requestUploadNewVehicle(
        @Req() req: any,
        @UploadedFiles() files: {
            imageFront?: Express.Multer.File[],
            imageEnd?: Express.Multer.File[],
            imageRearRight?: Express.Multer.File[],
            imageRearLeft?: Express.Multer.File[],
            imagePic1?: Express.Multer.File[],
            imagePic2?: Express.Multer.File[],
            imagePic3?: Express.Multer.File[],
            imagePic4?: Express.Multer.File[],
            imagePic5?: Express.Multer.File[],
            vehicleRegistrationFront?: Express.Multer.File[],
            vehicleRegistrationBack?: Express.Multer.File[]
        },
        @Body() dto: UploadNewVehicleDto
    ) {
        try {
            // Ensure required images are provided
            for (const key of ['imageFront','imageEnd','imageRearRight','imageRearLeft', 'vehicleRegistrationFront', 'vehicleRegistrationBack'] as const) {
                if (!files[key] || files[key].length === 0) {
                    throw new ErrorHandler(ErrorCodes.FAILED_TO_UPLOAD_VEHICLE, `${key} is required`, HttpStatus.BAD_REQUEST);
                }
            }

            // Check validation of the vehicle.
            await this.vehicleValidationService.checkUploadNewVehicleValidation(dto);

            // Request to upload a new vehicle.
            const vehicle = await this.createUpdateDeleteVehicleService.requestUploadNewVehicle(req.user.userId, dto, files);
            return { status: HttpStatus.CREATED, message: 'Request to upload new vehicle successfully.', data: vehicle };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_UPLOAD_VEHICLE, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Reupload REJECTED vehicle.
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'imageFront', maxCount: 1 },
            { name: 'imageEnd', maxCount: 1 },
            { name: 'imageRearRight', maxCount: 1 },
            { name: 'imageRearLeft', maxCount: 1 },
            { name: 'imagePic1', maxCount: 1 },
            { name: 'imagePic2', maxCount: 1 },
            { name: 'imagePic3', maxCount: 1 },
            { name: 'imagePic4', maxCount: 1 },
            { name: 'imagePic5', maxCount: 1 },
            { name: 'vehicleRegistrationFront', maxCount: 1 },
            { name: 'vehicleRegistrationBack', maxCount: 1 }
        ],
        {
            storage: memoryStorage(),
            limits: { fileSize: 1024 * 1024 * 5 }, // Limit the file size to 5MB.
        }),
    )
    @Put('reupload-rejected-vehicle')
    @HttpCode(HttpStatus.OK)
    async reuploadRejectedVehicle(
        @Req() req: any,
        @UploadedFiles() files: {
            imageFront?: Express.Multer.File[],
            imageEnd?: Express.Multer.File[],
            imageRearRight?: Express.Multer.File[],
            imageRearLeft?: Express.Multer.File[],
            imagePic1?: Express.Multer.File[],
            imagePic2?: Express.Multer.File[],
            imagePic3?: Express.Multer.File[],
            imagePic4?: Express.Multer.File[],
            imagePic5?: Express.Multer.File[],
            vehicleRegistrationFront?: Express.Multer.File[],
            vehicleRegistrationBack?: Express.Multer.File[]
        },
        @Body() dto: RejectedReuploadVehicleDto
    ) {
        try {
            // Check if the user is the owner of the vehicle.
            const vehicleInfo = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
            if (!vehicleInfo) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicleInfo.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);

            // Check if the vehicle is rejected.
            if (vehicleInfo.status !== VehicleStatus.REJECTED) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_REJECTED, 'Vehicle is not rejected', HttpStatus.FORBIDDEN);
            
            // Validate the update vehicle info.
            await this.vehicleValidationService.checkRejectedUpdateVehicleValidation(dto);

            // Reupload the vehicle.
            await this.createUpdateDeleteVehicleService.reuploadRejectedVehicle(vehicleInfo, dto, files);
            return { status: HttpStatus.OK, message: 'Reupload rejected vehicle successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_UPLOAD_VEHICLE, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Update vehicle information if the vehicle is approved.
    @UseGuards(AuthGuard('jwt'))
    @Put('update-vehicle-info')
    @HttpCode(HttpStatus.OK)
    async updateVehicleInfo(
        @Req() req: any,
        @Body() dto: UpdateVehicleInfoDto
    ) {
        try {
            // Check if the user is the owner of the vehicle and the vehicle is approved.
            const vehicleInfo = await this.getVehicleService.getVehicleByIdPrivate(dto.vehicleId);
            if (!vehicleInfo) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_FOUND, 'Vehicle not found', HttpStatus.NOT_FOUND);
            if (vehicleInfo.userId !== req.user.userId) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_OWNER, 'User is not the owner of the vehicle', HttpStatus.FORBIDDEN);
            if (vehicleInfo.status !== VehicleStatus.APPROVED) throw new ErrorHandler(ErrorCodes.VEHICLE_NOT_APPROVED, 'Vehicle is not approved', HttpStatus.FORBIDDEN);

            // Validate the update vehicle info.
            await this.vehicleValidationService.checkUpdateVehicleInfoValidation(dto);

            // Update the vehicle info.
            await this.createUpdateDeleteVehicleService.updateVehicleInfo(dto);
            return { status: HttpStatus.OK, message: 'Vehicle info updated successfully.' };
        } catch (error) {
            if (error instanceof ErrorHandler) throw error;
            console.log(error);
            throw new ErrorHandler(ErrorCodes.FAILED_TO_UPDATE_VEHICLE, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}