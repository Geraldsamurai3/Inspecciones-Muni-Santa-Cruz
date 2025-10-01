// src/revenue-patents/dto/update-revenue-patent.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateRevenuePatentDto } from './create-revenue-patent.dto';

export class UpdateRevenuePatentDto extends PartialType(CreateRevenuePatentDto) {}
