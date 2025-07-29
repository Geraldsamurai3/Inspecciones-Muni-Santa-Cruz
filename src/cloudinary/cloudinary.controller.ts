// src/cloudinary/cloudinary.controller.ts
import { Controller, Post, Delete, Query, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string,
  ) {
    return this.cloudinary.uploadImage(file, folder);
  }

  @Delete('destroy')
  destroy(@Query('publicId') publicId: string) {
    return this.cloudinary.deleteImage(publicId);
  }
}
