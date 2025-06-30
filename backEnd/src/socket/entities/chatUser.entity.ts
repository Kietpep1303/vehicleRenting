import { UserEntity } from 'src/user/entities/user.entity';
import { ChatEntity } from './chat.entity';
import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';

@Index('IDX_CHAT_USERID', ['userId'])
@Index('IDX_CHAT_SESSIONID', ['sessionId'])
@Entity('chat_user')
export class ChatUserEntity {

    @PrimaryColumn({ name: 'session_id', type: 'int' })
    sessionId: number;

    @ManyToOne(() => ChatEntity, (chat) => chat.users)
    @JoinColumn({ name: 'session_id' })
    chat: ChatEntity;

    @PrimaryColumn({ name: 'user_id', type: 'int' })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}
