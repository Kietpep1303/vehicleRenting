import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
import { Provider } from '@nestjs/common';

export const CloudinaryProvider: Provider = {
    provide: 'CLOUDINARY',
    useFactory: (configService: ConfigService) => {
        cloudinary.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        } as ConfigOptions);
        return cloudinary;
    },
    inject: [ConfigService],
};
