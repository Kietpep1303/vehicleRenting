// Imports TypeORM.
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// add UserStatus enum
export enum UserStatus {
    NO_LEVEL_2 = 'X',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    SUSPENDED = 'SUSPENDED'
}

@Index('IDX_USER_NICKNAME', ['nickname'])
@Index('IDX_USER_ACCOUNT_LEVEL', ['accountLevel'])
@Index('IDX_USER_STATUS', ['status'])
@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn() 
    id: number;
    
    // Level 0 and 1 information.
    @Column({ type: 'varchar', length: 64 }) 
    nickname: string;

    @Column({ type: 'varchar', length: 64, unique: true }) 
    email: string;

    @Column({ type: 'varchar', length: 64 }) 
    password: string;

    @Column({ name: 'create_at', type: 'timestamp' }) 
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp' }) 
    updatedAt: Date;

    @Column({ name: 'account_level', type: 'int', default: 0 }) 
    accountLevel: number;

    @Column({ type: 'varchar', length: 255, nullable: true }) 
    avatar: string;

    @Column({ name: 'phone_number', type: 'varchar', length: 64, nullable: true, unique: true })
    phoneNumber: string;

    // Level 2 information.
    @Column({ name: 'first_name', type: 'varchar', length: 64, nullable: true }) 
    firstName: string;

    @Column({ name: 'middle_name', type: 'varchar', length: 64, nullable: true }) 
    middleName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 64, nullable: true }) 
    lastName: string;

    @Column({ name: 'id_card_number', type: 'varchar', length: 64, nullable: true, unique: true }) 
    idCardNumber: string;

    @Column({ name: 'id_card_front', type: 'varchar', length: 255, nullable: true }) 
    idCardFront: string;

    @Column({ name: 'id_card_back', type: 'varchar', length: 255, nullable: true }) 
    idCardBack: string;

    @Column({ name: 'driver_license', type: 'varchar', length: 64, nullable: true, unique: true }) 
    driverLicense: string;

    @Column({ name: 'driver_license_front', type: 'varchar', length: 255, nullable: true }) 
    driverLicenseFront: string;

    @Column({ name: 'driver_license_back', type: 'varchar', length: 255, nullable: true }) 
    driverLicenseBack: string;

    // User level 2 status.
    @Column({ name: 'status', type: 'enum', enum: UserStatus, default: UserStatus.NO_LEVEL_2 })
    status: UserStatus;

    @Column({ name: 'rejected_reason', type: 'text', nullable: true  })
    rejectedReason: string;
}
