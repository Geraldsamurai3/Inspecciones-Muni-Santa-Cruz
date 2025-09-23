// src/special-inspections/dto/update-liquor-license-complaint.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLiquorLicenseComplaintDto } from './create-liquor-license-complaint.dto';

export class UpdateLiquorLicenseComplaintDto extends PartialType(
  CreateLiquorLicenseComplaintDto,
) {}
