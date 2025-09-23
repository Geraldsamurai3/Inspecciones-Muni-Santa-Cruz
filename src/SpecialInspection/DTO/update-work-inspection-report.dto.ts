// src/work-inspection-reports/dto/update-work-inspection-report.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkInspectionReportDto } from './create-work-inspection-report.dto';

export class UpdateWorkInspectionReportDto extends PartialType(
  CreateWorkInspectionReportDto,
) {}
