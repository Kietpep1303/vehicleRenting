import { HttpStatus, Inject, Injectable } from '@nestjs/common';

// Import TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Imports entities.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';
import { VehicleStatus } from 'src/vehicle/entities/vehicle.entity';

@Injectable()
export class GetRentalInfoService {
    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
    ) {}

    // Helper to remove sensitive fields for public endpoints
    private sanitizeRental(rental: RentalEntity) {
        return {
            id: rental.id,
            vehicleId: rental.vehicleId,
            renterId: rental.renterId,
            startDateTime: rental.startDateTime,
            endDateTime: rental.endDateTime,
            totalPrice: rental.totalPrice,
            status: rental.status,
            createdAt: rental.createdAt,
            updatedAt: rental.updatedAt,
        };
    }

    // Get a record of a rental [PRIVATE].
    async getARentalRecord(rentalId: number) {
        const rental = await this.rentalRepository.findOne({ where: { id: rentalId } });
        if (!rental) return null;
        return rental;
    }

    // Get all rentals of a RENTER [PRIVATE, PAGINATION].
    async getAllRenterRentals(userId: number, page: number = 1, limit: number = 10) {
        
        const skip = (page - 1) * limit;
        const [rentals, total] = await this.rentalRepository.findAndCount({
            where: { renterId: userId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const sanitizedRentals = rentals.map(r => this.sanitizeRental(r));
        return {
            rentals: sanitizedRentals,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    }

    // Get all current status rentals of a RENTER [PRIVATE, PAGINATION].
    async getAllCurrentStatusRentals(userId: number, status: RentalStatus, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [rentals, total] = await this.rentalRepository.findAndCount({
            where: { renterId: userId, status },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const sanitizedRentals = rentals.map(r => this.sanitizeRental(r));
        return {
            rentals: sanitizedRentals,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    }

    // Get all rentals of a vehicle's OWNER [PRIVATE, PAGINATION].
    async getAllRentalOfAVehicle(vehicleId: number, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [rentals, total] = await this.rentalRepository.findAndCount({
            where: { vehicleId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const sanitizedRentals = rentals.map(r => this.sanitizeRental(r));
        return {
            rentals: sanitizedRentals,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    }

    // Get all current status rentals of a vehicle's OWNER [PRIVATE, PAGINATION].
    async getAllCurrentStatusRentalOfAVehicle(vehicleId: number, status: RentalStatus, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [rentals, total] = await this.rentalRepository.findAndCount({
            where: { vehicleId, status },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const sanitizedRentals = rentals.map(r => this.sanitizeRental(r));
        return {
            rentals: sanitizedRentals,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    }

    // Get all the owner's pending rentals [PRIVATE, PAGINATION].
    async getAllOwnerStatusRentals(userId: number, status: RentalStatus, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [rentals, total] = await this.rentalRepository.findAndCount({
            where: { vehicleOwnerId: userId, status },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        const sanitizedRentals = rentals.map(r => this.sanitizeRental(r));
        return {
            rentals: sanitizedRentals,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        }
    }

    // Check if a renter has completed rental for a specific vehicle.
    async hasCompletedRental(userId: number, vehicleId: number): Promise<boolean> {
        const count = await this.rentalRepository.count({
            where: { renterId: userId, vehicleId, status: RentalStatus.COMPLETED }
        });
        return count > 0;
    }
}
