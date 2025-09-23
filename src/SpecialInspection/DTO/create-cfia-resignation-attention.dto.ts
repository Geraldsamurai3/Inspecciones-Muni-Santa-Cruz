// src/cfia-resignations/dto/create-cfia-resignation-attention.dto.ts
import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateCfiaResignationAttentionDto {
  // Person
  @IsString() @MaxLength(200)
  personName: string;

  @IsString() @MaxLength(25)
  idNumber: string;

  // Property / paperwork
  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  contractNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  permitNumber?: string;

  // Areas (free text; e.g., "120 m²")
  @IsOptional() @IsString() @MaxLength(24)
  assessedArea?: string;

  @IsOptional() @IsString() @MaxLength(24)
  builtArea?: string;

  // Location & visit
  @IsString() @MaxLength(100)
  province: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsString() @MaxLength(100)
  district: string;

  @IsOptional() @IsDateString()
  visitDate?: string; // ISO 8601

  // Notes & photos
  @IsOptional() @IsString()
  observations?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];
}
