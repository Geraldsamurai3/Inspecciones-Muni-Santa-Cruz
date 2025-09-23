// src/work-antiquity-attentions/dto/update-work-antiquity-attention.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkAntiquityAttentionDto } from './create-work-antiquity-attention.dto';

export class UpdateWorkAntiquityAttentionDto extends PartialType(
  CreateWorkAntiquityAttentionDto,
) {}
