import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

// Imports vehicle entity.
import { VehicleEntity } from './vehicle.entity';

@Index('IDX_FAVORITE_VEHICLE_USER_ID', ['userId'])
@Index('IDX_FAVORITE_VEHICLE_VEHICLE_ID', ['vehicleId'])
@Entity('favorite_vehicle')
export class FavoriteVehicleEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;

    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;
}
