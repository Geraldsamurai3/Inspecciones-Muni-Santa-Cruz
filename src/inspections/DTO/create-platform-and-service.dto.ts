// src/platforms-and-services/dto/create-platform-and-service.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlatformAndServiceDto {
  @IsString()
  @MaxLength(100)
  procedureNumber: string;

  @IsOptional()
  @IsString()
  observation: string;
}
