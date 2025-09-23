// src/work-inspection-reports/dto/create-work-inspection-report.dto.ts
import {
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateWorkInspectionReportDto {
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

  // Areas (free text, e.g., "120 m²")
  @IsOptional() @IsString() @MaxLength(24)
  assessedArea?: string;

  @IsOptional() @IsString() @MaxLength(24)
  builtArea?: string;

  // Visits
  @IsOptional() @IsDateString()
  visit1Date?: string;

  @IsOptional() @IsDateString()
  visit2Date?: string;

  @IsOptional() @IsDateString()
  visit3Date?: string;

  @IsOptional() @IsString() @MaxLength(100)
  workReceiptNumber?: string;

  // Location & main visit
  @IsString() @MaxLength(100)
  district: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsOptional() @IsDateString()
  visitDate?: string;

  // Address & notes
  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsArray()
  @IsString({ each: true })
  actions?: string[];

  @IsOptional() @IsString()
  observations?: string;
}
