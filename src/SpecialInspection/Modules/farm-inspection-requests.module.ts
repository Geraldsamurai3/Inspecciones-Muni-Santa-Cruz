// src/farm-inspection-requests/farm-inspection-requests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmInspectionRequest } from '../Entities/farm-inspection-request.entity';
import { FarmInspectionRequestsController } from '../Controllers/farm-inspection-requests.controller';
import { FarmInspectionRequestsService } from '../Services/farm-inspection-requests.service';
@Module({
  imports: [TypeOrmModule.forFeature([FarmInspectionRequest])],
  controllers: [FarmInspectionRequestsController],
  providers: [FarmInspectionRequestsService],
  exports: [FarmInspectionRequestsService],
})
export class FarmInspectionRequestsModule {}
