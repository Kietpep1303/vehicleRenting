import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

// Imports vehicle entity.
import { VehicleEntity } from './vehicle.entity';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

@Index('IDX_VEHICLE_RATING_VEHICLE_ID', ['vehicleId', 'rating'])
@Entity('vehicle_ratings')
export class VehicleRatingEntity {

    @PrimaryColumn({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;

    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;

    @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;
    
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 

