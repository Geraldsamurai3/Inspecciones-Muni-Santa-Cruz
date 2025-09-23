// src/land-use-attentions/dto/update-land-use-attention.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLandUseAttentionDto } from './create-land-use-attention.dto';

export class UpdateLandUseAttentionDto extends PartialType(CreateLandUseAttentionDto) {}
