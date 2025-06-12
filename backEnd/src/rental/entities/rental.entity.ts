import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

// Imports vehicle entity.
import { VehicleEntity } from '../../vehicle/entities/vehicle.entity';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

export enum RentalStatus {
    DEPOSIT_PENDING = 'DEPOSIT PENDING',
    DEPOSIT_PAID = 'DEPOSIT PAID',
    OWNER_PENDING = 'OWNER PENDING',
    OWNER_APPROVED = 'OWNER APPROVED',
    CONTRACT_PENDING = 'CONTRACT PENDING',
    CONTRACT_SIGNED = 'CONTRACT SIGNED',
    REMAINING_PAYMENT_PAID = 'REMAINING PAYMENT PAID',
    RENTER_RECEIVED = 'RENTER RECEIVED',
    RENTER_RETURNED = 'RENTER RETURNED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DEPOSIT_REFUNDED = 'DEPOSIT REFUNDED',
}

@Index(['vehicleId', 'status'])
@Index(['renterId', 'status'])
@Entity('rental')
export class RentalEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'vehicle_id', type: 'int' })
    vehicleId: number;

    @ManyToOne(() => VehicleEntity, (vehicle) => vehicle.id)
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: VehicleEntity;

    @Column({ name: 'vehicle_owner_id', type: 'int' })
    vehicleOwnerId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'vehicle_owner_id' })
    vehicleOwner: UserEntity;

    @Column({ name: 'renter_id', type: 'int' })
    renterId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'renter_id' })
    renter: UserEntity;

    @Column({ name: 'renter_phone_number', type: 'varchar', length: 64 })
    renterPhoneNumber: string;

    // Request rental window.
    @Column({ name: 'start_datetime', type: 'timestamptz' })
    startDateTime: Date; 

    @Column({ name: 'end_datetime', type: 'timestamptz' })
    endDateTime: Date;

    @Column({ name: 'total_days', type: 'int' })
    totalDays: number;

    // Pricing.
    @Column({ name: 'daily_price', type: 'float', default: 0 })
    dailyPrice: number; 

    @Column({ name: 'total_price', type: 'float', default: 0 })
    totalPrice: number;

    @Column({ name: 'deposit_price', type: 'float', default: 0 }) // 30% of total price.
    depositPrice: number;

    // Workflow status.
    @Column({ name: 'status', type: 'enum', enum: RentalStatus, default: RentalStatus.DEPOSIT_PENDING })
    status: RentalStatus;

    // Workflow history that stores all the status of the rental.
    // Format: [{status: 'status', date: 'date'}, {status: 'status', date: 'date'}, ...]
    @Column({ name: 'status_workflow_history', type: 'jsonb', default: [] })
    statusWorkflowHistory: { status: string, date: Date }[];

    // Booking created and updated at.
    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

}
