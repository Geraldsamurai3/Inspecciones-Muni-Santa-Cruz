// src/platforms-and-services/platforms-and-services.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformAndService } from '../Entities/platforms-and-ervices.entity';
import { PlatformsAndServicesController } from '../Controllers/platforms-and-services.controller';
import { PlatformsAndServicesService } from '../Services/platforms-and-services.service';


@Module({
  imports: [TypeOrmModule.forFeature([PlatformAndService])],
  controllers: [PlatformsAndServicesController],
  providers: [PlatformsAndServicesService],
  exports: [PlatformsAndServicesService],
})
export class PlatformsAndServicesModule {}
