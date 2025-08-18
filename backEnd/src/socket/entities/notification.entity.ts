// Imports TypeORM.
import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

@Entity('notification')
export class NotificationEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Index()
    @Column({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ name: 'event', type: 'jsonb' })
    event: {
        message: string;
        data: any;
    };

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead: boolean;

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}

