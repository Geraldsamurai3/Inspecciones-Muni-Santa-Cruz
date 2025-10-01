// src/work-closures/dto/update-work-closure.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkClosureDto } from './create-work-closure.dto';

export class UpdateWorkClosureDto extends PartialType(CreateWorkClosureDto) {}
