import { HttpStatus, Injectable } from '@nestjs/common';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports favorite vehicle entity.
import { FavoriteVehicleEntity } from '../entities/favoriteVehicle.entity';

@Injectable()
export class FavoriteVehicleService {
    constructor(
        @InjectRepository(FavoriteVehicleEntity) private favoriteVehicleRepository: Repository<FavoriteVehicleEntity>,
    ) {}

    // Check if the vehicle is already in the favorite list.
    async checkFavoriteVehicle(userId: number, vehicleId: number) {
        const favoriteVehicle = await this.favoriteVehicleRepository.findOne({ where: { userId, vehicleId } });
        return favoriteVehicle ? true : false;
    }

    // Create a new favorite vehicle.
    async createFavoriteVehicle(userId: number, vehicleId: number) {
        const favoriteVehicle = this.favoriteVehicleRepository.create({
            userId,
            vehicleId
        });
        await this.favoriteVehicleRepository.save(favoriteVehicle);
    }

    // Delete a favorite vehicle.
    async deleteFavoriteVehicle(userId: number, vehicleId: number) {
        await this.favoriteVehicleRepository.delete({ userId, vehicleId });
    }

    // Get all favorite vehicles.
    async getFavoriteVehicles(userId: number, page: number, limit: number) {
        const [favoriteVehicles, total] = await this.favoriteVehicleRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit
        });
        const result = {
            favoriteVehicles,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
        return result;
    }
}