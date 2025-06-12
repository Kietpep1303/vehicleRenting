import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatEntity } from '../entities/chat.entity';

// Import standard date.
import { generateDate } from '../../common/utils/standardDate.util';

@Injectable()
export class ChatCleanUpService {
    constructor(
        @InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async handleChatCleanup() {
        const thirtyDaysAgo = generateDate();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await this.chatRepository.delete({
            createdAt: LessThan(thirtyDaysAgo),
        });
        
        console.log(`Deleted ${result.affected} chats older than 30 days`);
    }
}