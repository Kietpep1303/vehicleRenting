import { Injectable, Inject } from '@nestjs/common';

// Imports Cloudinary API.
import { UploadApiResponse, UploadApiErrorResponse, v2 as Cloudinary } from 'cloudinary';

// Imports Streamifier.
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    constructor(
        @Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary
    ) {}

    // Uploads an image to Cloudinary.
    uploadImage(
        file: Express.Multer.File,
        folder: string,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
            {folder},
            (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}

