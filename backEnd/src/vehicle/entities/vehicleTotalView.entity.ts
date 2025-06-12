import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

// import vehicle entity.
import { VehicleEntity } from './vehicle.entity';

@Entity('vehicle_total_views')
export class VehicleTotalViewEntity {

    @PrimaryColumn({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;
  
    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;

    @Column({ name: 'total_views', type: 'int', default: 0 })
    totalViews: number;
    
}
