// src/work-inspection-reports/work-inspection-reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkInspectionReport } from '../Entities/work-inspection-report.entity';
import { WorkInspectionReportsController } from '../Controllers/work-inspection-reports.controller';
import { WorkInspectionReportsService } from '../Services/work-inspection-reports.service';


@Module({
  imports: [TypeOrmModule.forFeature([WorkInspectionReport])],
  controllers: [WorkInspectionReportsController],
  providers: [WorkInspectionReportsService],
  exports: [WorkInspectionReportsService],
})
export class WorkInspectionReportsModule {}
