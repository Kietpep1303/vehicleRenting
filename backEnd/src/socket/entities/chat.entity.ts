import { UserEntity } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

@Index('IDX_CHAT_SENDER_ID', ['senderId'])
@Index('IDX_CHAT_RECEIVER_ID', ['receiverId'])
@Entity('chat')
export class ChatEntity {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ name: 'sender_id', type: 'int' })
    senderId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'sender_id' })
    sender: UserEntity;

    @Column({ name: 'receiver_id', type: 'int' })
    receiverId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'receiver_id' })
    receiver: UserEntity;

    @Column({ name: 'message', type: 'jsonb' })
    message: {
        senderId: number;
        receiverId: number;
        type: 'text' | 'image';
        content: string;
        createdAt: Date;
    }[];

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}