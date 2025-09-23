// src/cfia-resignations/dto/update-cfia-resignation-attention.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCfiaResignationAttentionDto } from './create-cfia-resignation-attention.dto';

export class UpdateCfiaResignationAttentionDto extends PartialType(
  CreateCfiaResignationAttentionDto,
) {}
