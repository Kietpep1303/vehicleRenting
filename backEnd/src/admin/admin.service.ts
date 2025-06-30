import { Injectable } from '@nestjs/common';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports user entity.
import { UserEntity, UserStatus } from 'src/user/entities/user.entity';

// Imports vehicle entity.
import { VehicleEntity, VehicleStatus } from 'src/vehicle/entities/vehicle.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(VehicleEntity) private readonly vehicleRepository: Repository<VehicleEntity>
    ) {}
    
    // Get pagenation requested level 2 users.
    async getRequestedLevel2Users(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await this.userRepository.findAndCount({
            where: { accountLevel: 1, status: UserStatus.PENDING  },
            skip,
            take: limit,
        });
        return { 
            users,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }

    // Get pagenation requested vehicles.
    async getRequestedVehicles(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [vehicles, total] = await this.vehicleRepository.findAndCount({
            where: { status: VehicleStatus.PENDING },
            skip,
            take: limit,
        });
        return { 
            vehicles,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }

    // Approve OR reject a requested level 2 user.
    async approveOrRejectRequestedLevel2User(userId: number, status: boolean, rejectedReason?: string) {
        const payload = status ? { status: UserStatus.APPROVED, accountLevel: 2 } : { status: UserStatus.REJECTED, rejectedReason: rejectedReason };
        await this.userRepository.update( { id: userId, status: UserStatus.PENDING }, payload );
    }

    // Approve OR reject a requested vehicle.
    async approveOrRejectRequestedVehicle(vehicleId: number, status: boolean, rejectedReason?: string) {
        const payload = status ? { status: VehicleStatus.APPROVED } : { status: VehicleStatus.REJECTED, rejectedReason };
        await this.vehicleRepository.update({ id: vehicleId, status: VehicleStatus.PENDING }, payload );

    }
}
