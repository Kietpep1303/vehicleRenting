import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

// Imports user entity.
import { UserEntity } from '../../user/entities/user.entity';

@Entity('otp')
export class OtpEntity {

    @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, user => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ type: 'int' })
    otp: number;

    @Column({ name: 'expire_at', type: 'timestamp' })
    expireAt: Date;

}
