import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, Index } from 'typeorm';

// Imports chat entities.
import { ChatEntity } from './chat.entity';

// Imports user entities.
import { UserEntity } from 'src/user/entities/user.entity';

@Index('IDX_CHAT_MESSAGE_SESSIONID', ['sessionId'])
@Index('IDX_CHAT_MESSAGE_SENDERID', ['senderId'])
@Entity('chat_message')
export class ChatMessageEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'session_id', type: 'int' })
    sessionId: number;

    @ManyToOne(() => ChatEntity, (chat) => chat.id)
    @JoinColumn({ name: 'session_id' })
    chat: ChatEntity;

    @Column({ name: 'sender_id', type: 'int' })
    senderId: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'sender_id' })
    sender: UserEntity;

    @Column({ name: 'type', type: 'enum', enum: ['text', 'image', 'vehicle'] })
    type: 'text' | 'image' | 'vehicle';

    @Column({ type: 'jsonb' })
    content: any;

    @Column({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}