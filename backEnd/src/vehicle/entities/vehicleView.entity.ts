import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

// import vehicle entity.
import { VehicleEntity } from './vehicle.entity';

@Entity('vehicle_views')
@Index('idx_vehicle_views_vehicle_id_date', ['vehicleId', 'date'])
export class VehicleViewEntity {

    @PrimaryColumn({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;
  
    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;

    @PrimaryColumn({ type: 'date' })
    date: string;

    @Column({ type: 'int', default: 0 })
    views: number;
    
}
