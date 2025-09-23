// src/property-xxx-verifications/dto/update-property-xxx-verification.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyXxxVerificationDto } from './create-property-xxx-verification.dto';

export class UpdatePropertyXxxVerificationDto extends PartialType(
  CreatePropertyXxxVerificationDto,
) {}
