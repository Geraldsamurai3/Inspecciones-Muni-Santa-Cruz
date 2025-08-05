// src/cloudinary/cloudinary.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key:    this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            return reject(new InternalServerErrorException(error.message));
          }
          if (!result) {
            return reject(new InternalServerErrorException('No response from Cloudinary'));
          }
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(new InternalServerErrorException(error.message));
        }
        if (!result) {
          return reject(new InternalServerErrorException('No response from Cloudinary'));
        }
        resolve(result as UploadApiResponse);
      });
    });
  }
}
