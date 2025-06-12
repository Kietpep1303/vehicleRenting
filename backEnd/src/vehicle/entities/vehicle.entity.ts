import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

// Vehicle status enum.
export enum VehicleStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    HIDDEN = 'HIDDEN'
}

// Indexing for faster queries.
@Index('IDX_VEHICLE_STATUS', ['status'])
@Index('IDX_VEHICLE_STATUS_CREATED_AT', ['status', 'createdAt'])

@Index('IDX_VEHICLE_VEHICLE_TYPE', ['vehicleType'])
@Index('IDX_VEHICLE_BRAND', ['brand'])
@Index('IDX_VEHICLE_MODEL', ['model'])
@Index('IDX_VEHICLE_YEAR', ['year'])
@Index('IDX_VEHICLE_COLOR', ['color'])
@Index('IDX_VEHICLE_CITY', ['city'])
@Index('IDX_VEHICLE_DISTRICT', ['district'])
@Entity('vehicle')
export class VehicleEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ name: 'image_front', type: 'varchar', length: 255 })
    imageFront: string;

    @Column({ name: 'image_end', type: 'varchar', length: 255 })
    imageEnd: string;

    @Column({ name: 'image_rear_right', type: 'varchar', length: 255 })
    imageRearRight: string;

    @Column({ name: 'image_rear_left', type: 'varchar', length: 255 })
    imageRearLeft: string;

    @Column({ name: 'image_pic1', type: 'varchar', length: 255, nullable: true })
    imagePic1: string;

    @Column({ name: 'image_pic2', type: 'varchar', length: 255, nullable: true })
    imagePic2: string;

    @Column({ name: 'image_pic3', type: 'varchar', length: 255, nullable: true })
    imagePic3: string;

    @Column({ name: 'image_pic4', type: 'varchar', length: 255, nullable: true })
    imagePic4: string;

    @Column({ name: 'image_pic5', type: 'varchar', length: 255, nullable: true })
    imagePic5: string;

    @Column({ name: 'brand', type: 'varchar', length: 64 })
    brand: string;

    @Column({ name: 'model', type: 'varchar', length: 64 })
    model: string;

    @Column({ name: 'year', type: 'int' })
    year: number;

    @Column({ name: 'vehicle_type', type: 'varchar', length: 64 })
    vehicleType: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 64 })
    engine: string;

    @Column({ type: 'varchar', length: 64 })
    transmission: string;

    @Column({ name: 'fuel_type', type: 'varchar', length: 64 })
    fuelType: string;

    @Column({ type: 'varchar', length: 64 })
    color: string;

    @Column({ name: 'seating_capacity', type: 'int' })
    seatingCapacity: number;

    @Column({ name: 'air_conditioning', type: 'boolean' })
    airConditioning: boolean;

    @Column({ name: 'gps', type: 'boolean' })
    gps: boolean;

    @Column({ name: 'bluetooth', type: 'boolean' })
    bluetooth: boolean;
    
    @Column({ name: 'map', type: 'boolean' })
    map: boolean;

    @Column({ name: 'dash_camera', type: 'boolean' })
    dashCamera: boolean;

    @Column({ name: 'camera_back', type: 'boolean' })
    cameraBack: boolean;

    @Column({ name: 'collision_sensors', type: 'boolean' })
    collisionSensors: boolean;

    @Column({ name: 'etc', type: 'boolean' })
    ETC: boolean;

    @Column({ name: 'safety_air_bag', type: 'boolean' })
    safetyAirBag: boolean;

    @Column({ type: 'int' })
    price: number;

    @Column({ name: 'vehicle_registration_id', type: 'varchar', length: 64 })
    vehicleRegistrationId: string;

    @Column({ name: 'vehicle_registration_front', type: 'varchar', length: 255 })
    vehicleRegistrationFront: string;

    @Column({ name: 'vehicle_registration_back', type: 'varchar', length: 255 })
    vehicleRegistrationBack: string;

    @Column({ name: 'created_at', type: 'timestamp' }) 
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp' }) 
    updatedAt: Date;

    @Column({ name: 'city', type: 'varchar', length: 64 })
    city: string;

    @Column({ name: 'district', type: 'varchar', length: 64 })
    district: string;

    @Column({ name: 'ward', type: 'varchar', length: 64 })
    ward: string;

    @Column({ name: 'address', type: 'varchar', length: 255 })
    address: string;

    @Column({ name: 'time_pickup_start', type: 'time' })
    timePickupStart: Date;

    @Column({ name: 'time_pickup_end', type: 'time' })
    timePickupEnd: Date;

    @Column({ name: 'time_return_start', type: 'time' })
    timeReturnStart: Date;

    @Column({ name: 'time_return_end', type: 'time' })
    timeReturnEnd: Date;

    @Column({ name: 'status', type: 'enum', enum: VehicleStatus, default: VehicleStatus.PENDING })
    status: VehicleStatus;

    @Column({ name: 'rejected_reason', type: 'text', nullable: true })
    rejectedReason: string;

}
