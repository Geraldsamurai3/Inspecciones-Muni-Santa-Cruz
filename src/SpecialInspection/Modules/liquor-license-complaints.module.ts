// src/special-inspections/liquor-license-complaints.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiquorLicenseComplaint } from '../Entities/liquor-license-complaint.entity';
import { LiquorLicenseComplaintsController } from '../Controllers/liquor-license-complaints.controller';
import { LiquorLicenseComplaintsService } from '../Services/liquor-license-complaints.service';
@Module({
  imports: [TypeOrmModule.forFeature([LiquorLicenseComplaint])],
  controllers: [LiquorLicenseComplaintsController],
  providers: [LiquorLicenseComplaintsService],
  exports: [LiquorLicenseComplaintsService],
})
export class LiquorLicenseComplaintsModule {}
