import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChatUserEntity } from './chatUser.entity';

@Entity('chat')
export class ChatEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'last_message_id', type: 'int' })
    lastMessageId: number;

    @Column({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @OneToMany(() => ChatUserEntity, (chatUser) => chatUser.chat)
    users: ChatUserEntity[];
}