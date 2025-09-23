// src/farm-inspection-requests/dto/update-farm-inspection-request.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmInspectionRequestDto } from './create-farm-inspection-request.dto';

export class UpdateFarmInspectionRequestDto extends PartialType(
  CreateFarmInspectionRequestDto,
) {}
