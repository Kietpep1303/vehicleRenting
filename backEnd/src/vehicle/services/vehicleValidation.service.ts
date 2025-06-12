import { HttpStatus, Injectable } from '@nestjs/common';

// Imports all constants.
import { CAR_BRAND, MOTORCYCLE_BRAND, CAR_MODELS, MOTORCYCLE_MODELS } from '../constants/brandModel.constant';
import { VEHICLE_TYPE } from '../constants/vehicleType.constant';
import { VEHICLE_COLOR } from '../constants/color.constant';

// Imports dto.
import { UploadNewVehicleDto } from '../dto/upload-new-vehicle.dto';
import { UpdateVehicleInfoDto } from '../dto/update-vehicle-info.dto';
import { RejectedReuploadVehicleDto } from '../dto/rejected-reupload-vehicle.dto';

// Error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes } from '../../errorHandler/errorCodes';

@Injectable()
export class VehicleValidationService {

    constructor() {}

    // Check vehicle validation.
    async checkUploadNewVehicleValidation(dto: UploadNewVehicleDto) {

        // Check vehicle type.
        if (!VEHICLE_TYPE.includes(dto.vehicleType)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_TYPE, 'Invalid vehicle type', HttpStatus.BAD_REQUEST);
        }

        // Check brand type.
        if (!CAR_BRAND.includes(dto.brand) && !MOTORCYCLE_BRAND.includes(dto.brand)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_BRAND, 'Invalid brand', HttpStatus.BAD_REQUEST);
        }

        // Check model type.
        const models = (CAR_BRAND.includes(dto.brand) ? CAR_MODELS[dto.brand] : MOTORCYCLE_MODELS[dto.brand]);
        if (!models.includes(dto.model)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_MODEL, 'Invalid model', HttpStatus.BAD_REQUEST);
        }

        // Check color type.
        if (!VEHICLE_COLOR.includes(dto.color)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_COLOR, 'Invalid color', HttpStatus.BAD_REQUEST);
        }

        // Check time format.
        // HH:MM:SS on 30 minutes interval.
        const timePattern = /^([01]\d|2[0-3]):(00|30):00$/;
        ['timePickupStart', 'timePickupEnd', 'timeReturnStart', 'timeReturnEnd'].forEach(timeField => {
            const value = (dto as any)[timeField] as string;
            if (!timePattern.test(value)) {
                throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, 'Invalid time format', HttpStatus.BAD_REQUEST);
            }
        });

        const toMinutes = (time: string) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }
        if (toMinutes(dto.timePickupEnd) - toMinutes(dto.timePickupStart) < 120) {
            throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, 'Pickup window must be at least 2 hours', HttpStatus.BAD_REQUEST);
        }

        if (toMinutes(dto.timeReturnEnd) - toMinutes(dto.timeReturnStart) < 120) {
            throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, 'Return window must be at least 2 hours', HttpStatus.BAD_REQUEST);
        }

    }
    
    async checkRejectedUpdateVehicleValidation(dto: RejectedReuploadVehicleDto) {
        // if vehicle type is provided, check if it is valid.
        if (dto.vehicleType && !VEHICLE_TYPE.includes(dto.vehicleType)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_TYPE, 'Invalid vehicle type', HttpStatus.BAD_REQUEST);
        }

        // if brand is provided, check if it is valid.
        if (dto.brand && !CAR_BRAND.includes(dto.brand) && !MOTORCYCLE_BRAND.includes(dto.brand)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_BRAND, 'Invalid brand', HttpStatus.BAD_REQUEST);
        }

        // if model is provided, check if it is valid.
        if (dto.model) {
            const models = (CAR_BRAND.includes(dto.brand) ? CAR_MODELS[dto.brand] : MOTORCYCLE_MODELS[dto.brand]);
            if (!models.includes(dto.model)) {
                throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_MODEL, 'Invalid model', HttpStatus.BAD_REQUEST);
            }
        }

        // if color is provided, check if it is valid.
        if (dto.color && !VEHICLE_COLOR.includes(dto.color)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_COLOR, 'Invalid color', HttpStatus.BAD_REQUEST);
        }

        // Check time format.
        const timePattern = /^([01]\d|2[0-3]):(00|30):00$/;
        const toMinutes = (time: string) => time.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes, 0);

        [
            ['timePickupStart','timePickupEnd','Pickup'],
            ['timeReturnStart','timeReturnEnd','Return'],
        ].forEach(([startKey, endKey, label]) => {
            const start = (dto as any)[startKey]
            const end = (dto as any)[endKey];

            if (start || end) {
                if (!start || !end) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, `${label} time must provided together`, HttpStatus.BAD_REQUEST);
                if (![start, end].every(time => timePattern.test(time))) {
                    throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, `${label} time format must be HH:MM:SS on 30 minutes interval`, HttpStatus.BAD_REQUEST);
                }
                if (toMinutes(end) - toMinutes(start) < 120) {
                    throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, `${label} window must be at least 2 hours`, HttpStatus.BAD_REQUEST);
                }
           }
        });
    }

    async checkUpdateVehicleInfoValidation(dto: UpdateVehicleInfoDto) {
        // Check color type.
        if (dto.color && !VEHICLE_COLOR.includes(dto.color)) {
            throw new ErrorHandler(ErrorCodes.INVALID_VEHICLE_COLOR, 'Invalid color', HttpStatus.BAD_REQUEST);
        }

        // Check time format.
        const timePattern = /^([01]\d|2[0-3]):(00|30):00$/;
        const toMinutes = (time: string) => time.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes, 0);

        [
            ['timePickupStart','timePickupEnd','Pickup'],
            ['timeReturnStart','timeReturnEnd','Return'],
        ].forEach(([startKey, endKey, label]) => {
            const start = (dto as any)[startKey]
            const end = (dto as any)[endKey];

            if (start || end) {
                if (!start || !end) throw new ErrorHandler(ErrorCodes.DTO_VALIDATION_ERROR, `${label} time must provided together`, HttpStatus.BAD_REQUEST);
                if (![start, end].every(time => timePattern.test(time))) {
                    throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, `${label} time format must be HH:MM:SS on 30 minutes interval`, HttpStatus.BAD_REQUEST);
                }
                if (toMinutes(end) - toMinutes(start) < 120) {
                    throw new ErrorHandler(ErrorCodes.INVALID_TIME_FORMAT, `${label} window must be at least 2 hours`, HttpStatus.BAD_REQUEST);
                }
           }
        });
    }
}
