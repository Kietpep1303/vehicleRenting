import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';

// Imports rental entity.
import { RentalEntity } from './rental.entity';

export enum ContractStatus {
    PENDING = 'PENDING',
    SIGNED = 'SIGNED',
    REJECTED = 'REJECTED'
}

@Entity('contract')
export class ContractEntity {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 255 })
    id: string;

    @Column({ name: 'rental_id', type: 'int' })
    rentalId: number;

    @ManyToOne(() => RentalEntity, (rental) => rental.id)
    @JoinColumn({ name: 'rental_id' })
    rental: RentalEntity;

    @Column({ name: 'contract_data', type: 'jsonb' })
    contractData: any;

    @Column({ name: 'renter_status', type: 'enum', enum: ContractStatus })
    renterStatus: ContractStatus;

    @Column({ name: 'owner_status', type: 'enum', enum: ContractStatus })
    ownerStatus: ContractStatus;

    @Column({ name: 'contract_status', type: 'enum', enum: ContractStatus })
    contractStatus: ContractStatus;

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
