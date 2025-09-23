// src/closure-inspections/dto/update-closure-inspection-report.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClosureInspectionReportDto } from './create-closure-inspection-report.dto';

export class UpdateClosureInspectionReportDto extends PartialType(
  CreateClosureInspectionReportDto,
) {}
