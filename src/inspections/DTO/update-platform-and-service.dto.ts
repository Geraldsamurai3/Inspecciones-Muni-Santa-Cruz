// src/platforms-and-services/dto/update-platform-and-service.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformAndServiceDto } from './create-platform-and-service.dto';

export class UpdatePlatformAndServiceDto extends PartialType(CreatePlatformAndServiceDto) {}
