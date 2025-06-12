import { HttpStatus, Inject, Injectable } from '@nestjs/common';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

// Imports entities.
import { VehicleEntity, VehicleStatus } from '../entities/vehicle.entity';
import { VehicleViewEntity } from '../entities/vehicleView.entity';
import { VehicleRatingEntity } from '../entities/vehicleRating.entity';
import { VehicleTotalViewEntity } from '../entities/vehicleTotalView.entity';

// Imports standard time.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports redis.
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

// Imports rental entities.
import { RentalEntity, RentalStatus } from '../../rental/entities/rental.entity';

@Injectable()
export class GetVehicleService {
    constructor(
        @InjectRepository(VehicleEntity) private vehicleRepository: Repository<VehicleEntity>,
        @InjectRepository(VehicleViewEntity) private vehicleViewRepository: Repository<VehicleViewEntity>,
        @InjectRepository(VehicleRatingEntity) private vehicleRatingRepository: Repository<VehicleRatingEntity>,
        @InjectRepository(VehicleTotalViewEntity) private vehicleTotalViewRepository: Repository<VehicleTotalViewEntity>,
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis
    ) {}

    // Helper to remove sensitive fields for public endpoints
    private sanitizePublicVehicle(vehicle?: VehicleEntity): Partial<VehicleEntity> {
        if (!vehicle) return {} as Partial<VehicleEntity>;
        return {
            id: vehicle.id,
            userId: vehicle.userId,
            title: vehicle.title,
            imageFront: vehicle.imageFront,
            imageEnd: vehicle.imageEnd,
            imageRearRight: vehicle.imageRearRight,
            imageRearLeft: vehicle.imageRearLeft,
            price: vehicle.price,
        };
    }

    // Increase the view count of a vehicle.
    async increaseVehicleViewCount(vehicleId: number) {
        await this.dataSource.transaction(async manager => {
            // Insert into vehicle_views table.
            await manager.query(
               `INSERT INTO vehicle_views (vehicle_id, date, views)
               VALUES ($1, CURRENT_DATE, 1)
               ON CONFLICT (vehicle_id, date)
               DO UPDATE SET views = vehicle_views.views + 1`,
               [vehicleId]
            );

            // Insert into vehicle_total_views table.
            await manager.query(
                `INSERT INTO vehicle_total_views (vehicle_id, total_views)
                VALUES ($1, 1)
                ON CONFLICT (vehicle_id)
                DO UPDATE SET total_views = vehicle_total_views.total_views + 1`,
               [vehicleId]
            );
        });
    }

    // Get vehicle by id [PRIVATE].
    async getVehicleByIdPrivate(vehicleId: number) {
        const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
        if (!vehicle) return null;
        return vehicle;
    }

    // Get vehicle by account owner [PRIVATE, PAGINATION].
    async getVehiclesByAccountOwner(userId: number, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const [vehicles, total] = await this.vehicleRepository.findAndCount({
            where: { userId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' }
        });
        return {
            vehicles,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1
        };
    }

    // Get vehicle by id [PUBLIC].
    async getVehicleByIdPublic(vehicleId: number) {

        // Get the cache key.
        const cacheKey = `vehicles_Id_public_${vehicleId}`;
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) {
            await this.increaseVehicleViewCount(vehicleId);
            return JSON.parse(cachedData);
        }

        const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId, status: VehicleStatus.APPROVED } });
        if (!vehicle) return null;

        // Increase the view count of the vehicle.
        await this.increaseVehicleViewCount(vehicleId);

        // Fetch all-time total from the table.
        const totalViews = await this.vehicleTotalViewRepository.findOne({ where: { vehicleId } });
        (vehicle as any).totalViews = totalViews ? totalViews.totalViews : 0;

        // Exclude registration fields.
        delete (vehicle as any).vehicleRegistrationId;
        delete (vehicle as any).vehicleRegistrationFront;
        delete (vehicle as any).vehicleRegistrationBack;

        // Exclude address field and status, rejectedReason.
        delete (vehicle as any).address;
        delete (vehicle as any).status;
        delete (vehicle as any).rejectedReason;

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(vehicle), 'EX', 60 * 60 * 24); // 24 hours.
        return vehicle;
    }

    // Get vehicles by most views in the last 30 days [PUBLIC, PAGINATION].
    async getVehiclesByMostViews30days(page = 1, limit = 10) {

        // Get the cache key.
        const today = generateDate().toISOString().split('T')[0];
        const cacheKey = `vehicles_most_views_30days_${today}`;
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const skip = (page - 1) * limit;

        // Compute the date 30 days ago for the stats query
        const todayStr = generateDate().toISOString().split('T')[0];
        const [year, month, day] = todayStr.split('-').map(Number);
        const boundary = new Date(year, month - 1, day);
        boundary.setDate(boundary.getDate() - 30);
        const yyyy = boundary.getFullYear();
        const mm = String(boundary.getMonth() + 1).padStart(2, '0');
        const dd = String(boundary.getDate()).padStart(2, '0');
        const startDate = `${yyyy}-${mm}-${dd}`;

        // Grab both metrics in one go.
        const stats = await this.vehicleViewRepository
          .createQueryBuilder('view')
          .innerJoin('view.vehicle', 'v')
          // include all-time total_views via summary table
          .leftJoin(VehicleTotalViewEntity, 'tot', 'tot.vehicleId = view.vehicleId')
          .select('view.vehicleId', 'vehicleId')
          .addSelect('SUM(view.views)', 'last_30_days_views')
          .addSelect('COALESCE(tot.totalViews, 0)', 'total_views')
          .where('view.date >= :startDate', { startDate })
          .andWhere('v.status = :approved', { approved: VehicleStatus.APPROVED })
          .groupBy('view.vehicleId, tot.totalViews')
          .orderBy('last_30_days_views', 'DESC')
          .offset(skip)
          .limit(limit)
          .getRawMany<{ vehicleId: string; last_30_days_views: string; total_views: string }>();
      
        // Count distinct vehicles over the same window.
        const totalRaw = await this.vehicleViewRepository
          .createQueryBuilder('daily')
          .innerJoin('daily.vehicle','v')
          .select('COUNT(DISTINCT daily.vehicleId)','count')
          .where(`daily.date >= CURRENT_DATE - INTERVAL '29 days'`)
          .andWhere('v.status = :approved',{ approved: VehicleStatus.APPROVED })
          .getRawOne<{ count: string }>();
      
        const total = totalRaw ? +totalRaw.count : 0;
        const ids = stats.map(s => +s.vehicleId);
        const vehicles = ids.length
          ? await this.vehicleRepository.find({ where: { id: In(ids) } })
          : [];
      
        const map = new Map(vehicles.map(v => [v.id, v]));
        const items = stats.map(s => ({
          vehicle: this.sanitizePublicVehicle(map.get(+s.vehicleId)),
          last30daysViews: Number(s['last_30_days_views']),
          totalViews: Number(s['total_views']),
        }));
      
        const result = {
          vehicles: items,
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1,
        };

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24); // 24 hours.
        return result;
    }

    // Get vehicles by most views all the time [PUBLIC, PAGINATION].
    async getVehiclesByMostViewsAllTime(page: number = 1, limit: number = 10) {

          // Get the cache key.
          const today = generateDate().toISOString().split('T')[0];
          const cacheKey = `vehicles_most_views_all_time_${today}`;
          const cachedData = await this.redisClient.get(cacheKey);
          if (cachedData) return JSON.parse(cachedData);

        // Count approved vehicles with any views
        const total = await this.vehicleTotalViewRepository
            .createQueryBuilder('tot')
            .innerJoin('tot.vehicle', 'v')
            .where('v.status = :approved', { approved: VehicleStatus.APPROVED })
            .getCount();

        // Fetch paginated totals
        const skip = (page - 1) * limit;
        const stats = await this.vehicleTotalViewRepository
            .createQueryBuilder('tot')
            .innerJoin('tot.vehicle', 'v')
            .select('tot.vehicleId', 'vehicleId')
            .addSelect('tot.totalViews', 'totalViews')
            .where('v.status = :approved', { approved: VehicleStatus.APPROVED })
            .orderBy('tot.totalViews', 'DESC')
            .skip(skip)
            .take(limit)
            .getRawMany<{ vehicleId: string; totalViews: string }>();

        // Load the related vehicles
        const ids = stats.map(s => Number(s.vehicleId));
        const vehicles = ids.length
            ? await this.vehicleRepository.find({ where: { id: In(ids) } })
            : [];
        const map = new Map(vehicles.map(v => [v.id, v]));
        
        // Build result items
        const items = stats.map(s => ({
            vehicle: this.sanitizePublicVehicle(map.get(Number(s.vehicleId))),
            totalViews: Number(s.totalViews),
        }));

        // Return paginated result
        const result = {
            vehicles: items,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60 * 24); // 24 hours.
        return result;
    }

    // Get recent approved vehicles [PUBLIC, PAGINATION].
    async getRecentApprovedVehicles(page: number = 1, limit: number = 10) {

        // Get the cache key.
        const cacheKey = `vehicles_recent_approved`;
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const skip = (page - 1) * limit;
        // Load approved vehicles with pagination
        const [vehicles, total] = await this.vehicleRepository.findAndCount({
            where: { status: VehicleStatus.APPROVED },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const ids = vehicles.map(v => v.id);
        // Fetch all-time totals for these vehicles
        const totalViewsRecords = await this.vehicleTotalViewRepository.find({ where: { vehicleId: In(ids) } });
        const totalViewsMap = new Map(totalViewsRecords.map(rec => [rec.vehicleId, rec.totalViews]));
        // Build result items with totalViews
        const items = vehicles.map(v => ({
            vehicle: this.sanitizePublicVehicle(v),
            totalViews: totalViewsMap.get(v.id) ?? 0,
        }));
        const result = {
            vehicles: items,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60); // 1 minute.
        return result;
    }

   // Get random approved vehicles [PUBLIC, PAGINATION].
   async getRandomApprovedVehicles(page: number = 1, limit: number = 10) {

        // Get the cache key.
        const cacheKey = `vehicles_random_approved`;
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const skip = (page - 1) * limit;

        // Count total approved vehicles
        const total = await this.vehicleRepository.count({
            where: { status: VehicleStatus.APPROVED }
        });

        // Grab a random “page” of vehicles
        const raw = await this.vehicleRepository
            .createQueryBuilder('v')
            .where('v.status = :approved', { approved: VehicleStatus.APPROVED })
            .orderBy('RANDOM()')
            .offset(skip)
            .limit(limit)
            .getMany();

        const ids = raw.map(v => v.id);
        const totalViewsRecords = ids.length
            ? await this.vehicleTotalViewRepository.find({ where: { vehicleId: In(ids) } })
            : [];
        const totalViewsMap = new Map(totalViewsRecords.map(r => [r.vehicleId, r.totalViews]));

        // Build the same “items” array as in recent method
        const items = raw.map(v => ({
            vehicle: this.sanitizePublicVehicle(v),
            totalViews: totalViewsMap.get(v.id) ?? 0,
        }));

        const totalPages = Math.ceil(total / limit);
        const result = {
            vehicles: items,
            total, 
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };  

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'PX', 5000); // 5 seconds.
        return result;
    }

    // Get paginated vehicles with optional filters [PUBLIC, PAGINATION].
    async getVehiclesByFilters(
        title?: string,
        vehicleType?: string,
        brand?: string,
        model?: string,
        year?: number,
        color?: string,
        city?: string,
        district?: string,
        startDateTime?: Date,
        endDateTime?: Date,
        page: number = 1,
        limit: number = 10,
    ) {

        // Get the cache key.
        const filter = { title, vehicleType, brand, model, year, color, city, district };
        const keyParams = Object.entries(filter).filter(([_, value]) => value !== undefined).map(([key, value]) => `${key}_${value}`).join('_');
        const cacheKey = `vehicles_filters_${keyParams}`;
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) return JSON.parse(cachedData);

        const skip = (page - 1) * limit;
        const qb = this.vehicleRepository.createQueryBuilder('v')
            .where('v.status = :approved', { approved: VehicleStatus.APPROVED });

        if (title) {
            const search = `%${title}%`;
            qb.andWhere(
                '(v.title ILIKE :search OR v.brand ILIKE :search OR v.model ILIKE :search OR v.description ILIKE :search)',
                { search }
            );
        }
        if (startDateTime && endDateTime) {
            qb.leftJoin(
              RentalEntity,
              'r_avail',
              `
                r_avail.vehicleId = v.id
                AND r_avail.status NOT IN (:...invalidStatuses)
                AND r_avail.startDateTime <= :endDateTime
                AND r_avail.endDateTime   >= :startDateTime
              `,
              {
                invalidStatuses: [RentalStatus.CANCELLED, RentalStatus.DEPOSIT_REFUNDED],
                startDateTime,
                endDateTime,
              }
            )
            .andWhere('r_avail.id IS NULL');
        }
        if (vehicleType) qb.andWhere('v.vehicleType = :vehicleType', { vehicleType });
        if (brand) qb.andWhere('v.brand = :brand', { brand });
        if (model) qb.andWhere('v.model = :model', { model });
        if (year) qb.andWhere('v.year = :year', { year });
        if (color) qb.andWhere('v.color = :color', { color });
        if (city) qb.andWhere('v.city = :city', { city });
        if (district) qb.andWhere('v.district = :district', { district });

        const total = await qb.getCount();
        const vehicles = await qb
            .orderBy('v.createdAt', 'DESC')
            .offset(skip)
            .limit(limit)
            .getMany();
        // fetch all-time totals for these vehicles
        const ids = vehicles.map(v => v.id);
        const totalViewsRecords = ids.length
            ? await this.vehicleTotalViewRepository.find({ where: { vehicleId: In(ids) } })
            : [];
        const totalViewsMap = new Map(totalViewsRecords.map(rec => [rec.vehicleId, rec.totalViews]));
        // build items with totalViews
        const items = vehicles.map(v => ({
            vehicle: this.sanitizePublicVehicle(v),
            totalViews: totalViewsMap.get(v.id) ?? 0,
        }));
        const result = {
            vehicles: items,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };

        // Store the data in redis.
        await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 60); // 1 minute.
        return result;
    }

}