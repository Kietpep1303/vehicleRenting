import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    service: 'gmail',
                    auth: {
                        user: configService.get<string>('EMAIL_USER'),
                        pass: configService.get<string>('EMAIL_PASS'),
                    },
                },
                defaults: {
                    from: `"No-Reply" <${configService.get<string>('EMAIL_FROM') ?? configService.get<string>('EMAIL_USER')}>`,
                },
            }),
        }),
    ],
    exports: [MailerModule],
})

export class EmailModule {}
