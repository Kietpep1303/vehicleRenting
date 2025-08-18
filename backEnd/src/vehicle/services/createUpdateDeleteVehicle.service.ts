import { HttpStatus, Inject, Injectable } from '@nestjs/common';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports standard time.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports vehicle entities
import { VehicleEntity, VehicleStatus } from '../entities/vehicle.entity';

// Imports cloudinary service.
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

// Imports dto.
import { UploadNewVehicleDto } from '../dto/upload-new-vehicle.dto';
import { UpdateVehicleInfoDto } from '../dto/update-vehicle-info.dto';
import { RejectedReuploadVehicleDto } from '../dto/rejected-reupload-vehicle.dto';

// Imports redis.
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class CreateUpdateDeleteVehicleService {

    constructor(
        @InjectRepository(VehicleEntity) private vehicleRepository: Repository<VehicleEntity>,
        private cloudinaryService: CloudinaryService,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) {}


    // Request to upload a new vehicle. 
    // They must be approved by the admin to be visible to rent on the platform.
    async requestUploadNewVehicle(UID: number, dto: UploadNewVehicleDto, files: {
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
    }) {

        // Upload images to cloudinary.
        const imageFields = ['imageFront','imageEnd','imageRearRight','imageRearLeft','imagePic1','imagePic2','imagePic3','imagePic4','imagePic5', 'vehicleRegistrationFront', 'vehicleRegistrationBack'] as const;
        const uploadTasks = imageFields.map(field => {
            const fileArray = files[field];
            if (fileArray && fileArray.length) {
                return this.cloudinaryService
                    .uploadImage(fileArray[0], 'vehicle')
                    .then((uploaded: any) => { dto[field] = uploaded.secure_url; });
            }
            return Promise.resolve();
        });
        await Promise.all(uploadTasks);

        // Create a new vehicle.
        const vehicle = await this.vehicleRepository.create({
            userId: UID,
            ...dto,
            createdAt: generateDate(),
            updatedAt: generateDate(),
            status: VehicleStatus.PENDING
        });

        // Return the vehicle.
        return await this.vehicleRepository.save(vehicle);
    }

    // Reupload REJECTED vehicle.
    async reuploadRejectedVehicle(vehicle: VehicleEntity, dto: RejectedReuploadVehicleDto, files: {
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
    }) {

        // Upload images to cloudinary.
        const imageFields = ['imageFront','imageEnd','imageRearRight','imageRearLeft','imagePic1','imagePic2','imagePic3','imagePic4','imagePic5', 'vehicleRegistrationFront', 'vehicleRegistrationBack'] as const;
        const uploadTasks = imageFields.map(field => {
            const fileArray = files[field];
            if (fileArray && fileArray.length) {
                return this.cloudinaryService
                    .uploadImage(fileArray[0], 'vehicle')
                    .then((uploaded: any) => { dto[field] = uploaded.secure_url; });
            }
            return Promise.resolve();
        });
        await Promise.all(uploadTasks);

        // Copy provided DTO fields into the vehicle entity.
        const { vehicleId: _, ...rest } = dto;
        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined) {
                (vehicle as any)[key] = value;
            }
        });

        // Reset status to pending.
        vehicle.status = VehicleStatus.PENDING;
        vehicle.updatedAt = generateDate();

        // Save the vehicle.
        await this.vehicleRepository.save(vehicle);
    }

    // Update vehicle information.
    async updateVehicleInfo(dto: UpdateVehicleInfoDto) {
        const { vehicleId, ...rest } = dto;

        const updated = await this.vehicleRepository.update(vehicleId, { ...rest, updatedAt: generateDate() });

        // Delete the cache if it exists.
        const cacheKey = `vehicles_Id_public_${vehicleId}`;
        if (await this.redisClient.exists(cacheKey)) await this.redisClient.del(cacheKey);

        return updated;
    }

    // Temporarily hide a vehicle.
    async hideVehicle(vehicle: VehicleEntity) {
        vehicle.status = VehicleStatus.HIDDEN;
        await this.vehicleRepository.save(vehicle);

        // Delete the cache if it exists.
        const cacheKey = `vehicles_Id_public_${vehicle.id}`;
        if (await this.redisClient.exists(cacheKey)) await this.redisClient.del(cacheKey);
    }

    // Unhide a vehicle.
    async unhideVehicle(vehicle: VehicleEntity) {
        vehicle.status = VehicleStatus.APPROVED;
        await this.vehicleRepository.save(vehicle);
    }

    // Delete vehicle.
    async deleteVehicle(vehicleId: number) {
        const deleted = await this.vehicleRepository.delete(vehicleId);

        // Delete the cache if it exists.
        const cacheKey = `vehicles_Id_public_${vehicleId}`;
        if (await this.redisClient.exists(cacheKey)) await this.redisClient.del(cacheKey);

        return deleted;
    }
}
