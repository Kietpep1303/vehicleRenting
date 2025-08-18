import { Injectable } from '@nestjs/common';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Imports user entity.
import { UserEntity, UserStatus } from 'src/user/entities/user.entity';

// Imports auth entity.
import { AuthEntity } from 'src/auth/entities/auth.entity';

// Imports vehicle entity.
import { VehicleEntity, VehicleStatus } from 'src/vehicle/entities/vehicle.entity';

@Injectable()
export class GetCreateDeleteUserVehicleService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(VehicleEntity) private readonly vehicleRepository: Repository<VehicleEntity>,
        @InjectRepository(AuthEntity) private readonly authRepository: Repository<AuthEntity>
    ) {}

    // Get all the current users [PAGENATION].
    async getCurrentUsers(
        page: number = 1, 
        limit: number = 10,
        accountLevelMin?: number,
        accountLevelMax?: number,
        sortBy: keyof UserEntity = 'createdAt',
        sortOrder: 'ASC' | 'DESC' = 'DESC',
        search?: string,
        statusFilter?: 'ACTIVE' | 'SUSPENDED',
    ) {
        const skip = (page - 1) * limit;
        const query = this.userRepository.createQueryBuilder('user');

        // Status group filter: ACTIVE => NO_LEVEL_2 | PENDING | APPROVED ; SUSPENDED only
        if (statusFilter) {
            if (statusFilter === 'ACTIVE') {
                query.andWhere('user.status IN (:...activeStatuses)', {
                    activeStatuses: [
                        UserStatus.NO_LEVEL_2,
                        UserStatus.PENDING,
                        UserStatus.APPROVED,
                    ],
                });
            } else {
                query.andWhere('user.status = :suspended', { suspended: UserStatus.SUSPENDED });
            }
        }

        // accountLevel range filter.
        if (accountLevelMin != null) query.andWhere('user.accountLevel >= :accountLevelMin', { accountLevelMin });
        if (accountLevelMax != null) query.andWhere('user.accountLevel <= :accountLevelMax', { accountLevelMax });
       
        // Free text search filter.
        if (search) {
            query.andWhere(
                '(user.nickname ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
                { search: `%${search}%` },
              );
        }

        // Sorting.
        query.orderBy(`user.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit);

        // Execute the query.
        const [users, total] = await query.getManyAndCount();

        // Strip out password from the users.
        const usersWithoutPassword = users.map(({ password, ...user }) => user);

        return {
            users: usersWithoutPassword,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }

    // Get all the current vehicles [PAGINATION] with optional status filter and search.
    async getCurrentVehicles(
        page: number = 1,
        limit: number = 10,
        statusFilter?: VehicleStatus,
        search?: string,
    ) {
        const skip = (page - 1) * limit;
        const qb = this.vehicleRepository.createQueryBuilder('vehicle');

        // Filter by vehicle status if provided.
        if (statusFilter) {
            qb.andWhere('vehicle.status = :status', { status: statusFilter });
        }

        // Free-text search on title or registration ID.
        if (search) {
            qb.andWhere(
                '(vehicle.title ILIKE :search OR vehicle.vehicleRegistrationId ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Sort newest first and apply pagination.
        qb.orderBy('vehicle.createdAt', 'DESC')
          .skip(skip)
          .take(limit);

        const [vehicles, total] = await qb.getManyAndCount();

        return {
            vehicles,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }

    // Get all the number of users.
    async getNumberOfUsers() {
        // Count users by account level and status.
        const rawLevels = await this.userRepository
            .createQueryBuilder('user')
            .select('user.accountLevel', 'level')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.accountLevel')
            .getRawMany();

        // Initialize level counts 0-3
        const levelCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
        let total = 0;
        rawLevels.forEach(row => {
            const lvl = parseInt(row.level, 10);
            const cnt = parseInt(row.count, 10);
            levelCounts[lvl] = cnt;
            total += cnt;
        });

        // Count users by status
        const rawStatuses = await this.userRepository
            .createQueryBuilder('user')
            .select('user.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.status')
            .getRawMany();

        // Group statuses: ACTIVE = NO_LEVEL_2, PENDING, APPROVED; SUSPENDED otherwise
        const activeStatuses = [
            UserStatus.NO_LEVEL_2,
            UserStatus.PENDING,
            UserStatus.APPROVED,
        ];
        let active = 0;
        let suspended = 0;
        rawStatuses.forEach(row => {
            const cnt = parseInt(row.count, 10);
            if (activeStatuses.includes(row.status as UserStatus)) {
                active += cnt;
            } else if (row.status === UserStatus.SUSPENDED) {
                suspended = cnt;
            }
        });

        return {
            level0: levelCounts[0],
            level1: levelCounts[1],
            level2: levelCounts[2],
            level3: levelCounts[3],
            total,
            active,
            suspended,
        };
    }

    // Get all the number of vehicles.
    async getNumberOfVehicles() {
        // Count vehicles by status.
        const raw = await this.vehicleRepository
            .createQueryBuilder('vehicle')
            .select('vehicle.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('vehicle.status')
            .getRawMany();

        // Initialize counts for each status.
        const statusCounts: Record<VehicleStatus, number> = {
            [VehicleStatus.PENDING]: 0,
            [VehicleStatus.APPROVED]: 0,
            [VehicleStatus.REJECTED]: 0,
            [VehicleStatus.HIDDEN]: 0,
            [VehicleStatus.SUSPENDED]: 0,
        };
        let total = 0;
        for (const row of raw) {
            const s = row.status as VehicleStatus;
            const cnt = parseInt(row.count, 10);
            statusCounts[s] = cnt;
            total += cnt;
        }

        return {
            pending: statusCounts[VehicleStatus.PENDING],
            approved: statusCounts[VehicleStatus.APPROVED],
            rejected: statusCounts[VehicleStatus.REJECTED],
            hidden: statusCounts[VehicleStatus.HIDDEN],
            suspended: statusCounts[VehicleStatus.SUSPENDED],
            total,
        };
    }

    // Suspend a user.
    async suspendUser(userId: number) {
        const user = await this.userRepository.update(userId, { status: UserStatus.SUSPENDED });

        // Delete all the user's auth tokens.
        await this.authRepository.delete({ userId });

        // Suspend all the user's vehicles.
        await this.vehicleRepository.update({ userId }, { status: VehicleStatus.SUSPENDED });

        return user;
    }
    
    // Unsuspend a user.
    async unsuspendUser(userId: number, status: UserStatus) {
        const user = await this.userRepository.update(userId, { status });

        // Unsuspend all the user's vehicles.
        await this.vehicleRepository.update({ userId }, { status: VehicleStatus.APPROVED });

        return user;
    }

    // Suspend a vehicle.
    async suspendVehicle(vehicleId: number) {
        const vehicle = await this.vehicleRepository.update(vehicleId, { status: VehicleStatus.SUSPENDED });
    
        return vehicle;
    }

    // Unsuspend a vehicle.
    async unsuspendVehicle(vehicleId: number) {
        const vehicle = await this.vehicleRepository.update(vehicleId, { status: VehicleStatus.APPROVED });

        return vehicle;
    }
    
}