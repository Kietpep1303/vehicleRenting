import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

@Entity('auth')
export class AuthEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id', type: 'int' })
    userId: number;
    
    // Foreign key with user entity.
    @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ name: 'device_id', type: 'text' })
    deviceId: string;

    @Column({ name: 'device_name', type: 'text' })
    deviceName: string;

    @Column({ name: 'refresh_token', type: 'text' })
    refreshToken: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

}
