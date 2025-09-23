// src/construction-permit-cancellations/dto/update-construction-permit-cancellation-report.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionPermitCancellationReportDto } from './create-construction-permit-cancellation-report.dto';

export class UpdateConstructionPermitCancellationReportDto extends PartialType(
  CreateConstructionPermitCancellationReportDto,
) {}
