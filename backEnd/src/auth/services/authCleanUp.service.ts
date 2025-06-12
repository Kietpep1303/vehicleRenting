import { Injectable } from '@nestjs/common';

// Imports cron.
import { Cron, CronExpression } from '@nestjs/schedule';

// Imports typeORM.
import { InjectRepository }     from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';

// Imports auth entity.
import { AuthEntity } from '../entities/auth.entity';

// Imports standard date.
import { generateDate } from 'src/common/utils/standardDate.util';

@Injectable()
export class AuthCleanUpService {
    constructor(
        @InjectRepository(AuthEntity) private readonly authRepository: Repository<AuthEntity>
    ) {}

    // Clean up expired refresh tokens.
    @Cron(CronExpression.EVERY_HOUR)
    async cleanUpExpiredRefreshTokens() {
        const result = await this.authRepository.delete({ expiresAt: LessThan(generateDate()) });
        console.log(`${result.affected} expired refresh tokens deleted.`);
    }
}
