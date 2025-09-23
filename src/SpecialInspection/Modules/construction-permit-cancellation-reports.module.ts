// src/construction-permit-cancellations/construction-permit-cancellation-reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionPermitCancellationReportsService } from '../Services/construction-permit-cancellation-reports.service';
import { ConstructionPermitCancellationReport } from '../Entities/construction-permit-cancellation-report.entity';
import { ConstructionPermitCancellationReportsController } from '../Controllers/construction-permit-cancellation-reports.controller';


@Module({
  imports: [TypeOrmModule.forFeature([ConstructionPermitCancellationReport])],
  controllers: [ConstructionPermitCancellationReportsController],
  providers: [ConstructionPermitCancellationReportsService],
  exports: [ConstructionPermitCancellationReportsService],
})
export class ConstructionPermitCancellationReportsModule {}
