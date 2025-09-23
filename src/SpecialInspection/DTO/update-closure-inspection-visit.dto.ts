// src/closure-inspections/dto/update-closure-inspection-visit.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClosureInspectionVisitDto } from './create-closure-inspection-visit.dto';

export class UpdateClosureInspectionVisitDto extends PartialType(CreateClosureInspectionVisitDto) {}
