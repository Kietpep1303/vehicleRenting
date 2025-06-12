import { SetMetadata } from '@nestjs/common';

export const ACCOUNT_LEVEL_KEY = 'accountLevel';

export const RequiredAccountLevel = (level: number) => SetMetadata(ACCOUNT_LEVEL_KEY, level);
