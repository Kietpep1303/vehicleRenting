import { HttpStatus, Injectable } from '@nestjs/common';

// Imports repository.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports standard time.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports vehicle entities
import { VehicleEntity, VehicleStatus } from '../entities/vehicle.entity';

// Imports vehicle rating entity.
import { VehicleRatingEntity } from '../entities/vehicleRating.entity';
import { VehicleTotalRatingEntity } from '../entities/vehicleTotalRating.entity';

@Injectable()
export class CreateEditRatingService {

    constructor(
        @InjectRepository(VehicleEntity) private vehicleRepository: Repository<VehicleEntity>,
        @InjectRepository(VehicleRatingEntity) private vehicleRatingRepository: Repository<VehicleRatingEntity>,
        @InjectRepository(VehicleTotalRatingEntity) private vehicleTotalRatingRepository: Repository<VehicleTotalRatingEntity>,
    ) {}

    // Create a new rating.
    async createRating(userId: number, vehicleId: number, rating: number, comment: string) {
        // Add the rating to the vehicle rating table.
        const newRating = this.vehicleRatingRepository.create({
            vehicleId,
            userId,
            rating,
            comment
        });
        await this.vehicleRatingRepository.save(newRating);
        // Add the rating to the vehicle total rating table.
        const vehicleTotal = await this.vehicleTotalRatingRepository.findOne({ where: { vehicleId } });
        if (!vehicleTotal) {
            const newTotalRating = this.vehicleTotalRatingRepository.create({
                vehicleId,
                totalRating: 1,
                averageRating: rating
            });
            await this.vehicleTotalRatingRepository.save(newTotalRating);
        } else {
            // Compute new total count and average
            const oldCount = vehicleTotal.totalRating;
            const sumBefore = vehicleTotal.averageRating * oldCount;
            const sumAfter = sumBefore + rating;
            vehicleTotal.totalRating = oldCount + 1;
            vehicleTotal.averageRating = sumAfter / vehicleTotal.totalRating;
            await this.vehicleTotalRatingRepository.save(vehicleTotal);
        }
        return newRating;
    }

    // Edit a rating.
    async editRating(userId: number, vehicleId: number, rating: number, comment: string) {

        // Find existing rating to get the previous value
        const existingRating = await this.vehicleRatingRepository.findOne({ where: { userId, vehicleId } });
        if (!existingRating) return null;
        
        const previousRating = existingRating.rating;
        existingRating.rating = rating;
        existingRating.comment = comment;
        await this.vehicleRatingRepository.save(existingRating);

        // Update the total rating in the vehicle total rating table.
        const vehicleTotal = await this.vehicleTotalRatingRepository.findOne({ where: { vehicleId } });
        if (!vehicleTotal) return null;
        const count = vehicleTotal.totalRating;
        const sumBefore = vehicleTotal.averageRating * count;
        const sumAfter = sumBefore - previousRating + rating;
        vehicleTotal.averageRating = sumAfter / count;
        await this.vehicleTotalRatingRepository.save(vehicleTotal);
        return existingRating;
    }

    // Get the average rating of a vehicle.
    async getAverageRating(vehicleId: number) {
        const vehicleTotal = await this.vehicleTotalRatingRepository.findOne({ where: { vehicleId } });
        if (!vehicleTotal) return null;
        return vehicleTotal.averageRating;
    }

    // Get pagenation of ratings of a vehicle.
    async getPaginationRatings(vehicleId: number, rating: number = 0, page: number, limit: number) {
        // Build filter for rating if specified
        const where = (rating === 0) ? { vehicleId } : { vehicleId, rating };
        // Fetch and count with ordering: newest first, then lowest rating
        const [ratings, total] = await this.vehicleRatingRepository.findAndCount({
            where,
            order: {
                createdAt: 'DESC',
                rating: 'ASC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { 
            ratings, 
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }

    // Check if the user has rated the vehicle.
    async isRated(userId: number, vehicleId: number) {
        const rating = await this.vehicleRatingRepository.findOne({ where: { userId, vehicleId } });
        if (!rating) return false;
        return true;
    }
}