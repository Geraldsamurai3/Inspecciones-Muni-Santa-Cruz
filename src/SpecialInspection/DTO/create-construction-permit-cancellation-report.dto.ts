// src/construction-permit-cancellations/dto/create-construction-permit-cancellation-report.dto.ts
import {
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateConstructionPermitCancellationReportDto {
  // Person & IDs
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

  @IsOptional() @IsString() @MaxLength(50)
  professionalCardNumber?: string;

  @IsBoolean()
  built: boolean; // true = sí construyó, false = no

  // Location & visit
  @IsString() @MaxLength(100)
  district: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsOptional() @IsDateString()
  visitDate?: string; // ISO 8601

  // Address & notes
  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsString()
  observations?: string;

  // Photos
  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];
}
