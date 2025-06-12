import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

// Imports vehicle entity.
import { VehicleEntity } from './vehicle.entity';

@Entity('vehicle_total_ratings')
export class VehicleTotalRatingEntity {

    @PrimaryColumn({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;

    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;

    @Column({ type: 'int' })
    totalRating: number;

    @Column({ type: 'float' })
    averageRating: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 

