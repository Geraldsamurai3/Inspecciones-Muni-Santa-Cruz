// src/cloudinary/cloudinary.service.ts
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly client: any) {}

  async uploadImage(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = this.client.uploader.upload_stream(
        { folder, resource_type: 'image' },
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

  async deleteImage(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.uploader.destroy(publicId, (error, result) => {
        if (error) {
          return reject(new InternalServerErrorException(error.message));
        }
        if (!result) {
          return reject(new InternalServerErrorException('No response from Cloudinary'));
        }
        resolve(result);
      });
    });
  }
}
