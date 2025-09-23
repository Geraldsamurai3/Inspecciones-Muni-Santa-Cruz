// src/closure-inspections/closure-inspection-reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClosureInspectionReport } from '../Entities/closure-inspection-report.entity';
import { ClosureInspectionReportsController } from '../Controllers/closure-inspection-reports.controller';
import { ClosureInspectionReportsService } from '../Services/closure-inspection-reports.service';
import { ClosureInspectionVisit } from '../Entities/closure-inspection-visit.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ClosureInspectionReport, ClosureInspectionVisit])],
  controllers: [ClosureInspectionReportsController],
  providers: [ClosureInspectionReportsService],
  exports: [ClosureInspectionReportsService],
})
export class ClosureInspectionReportsModule {}
