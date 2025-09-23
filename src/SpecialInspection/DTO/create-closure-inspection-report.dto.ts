// src/closure-inspections/dto/create-closure-inspection-report.dto.ts
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ArrayUnique,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClosureInspectionVisitDto } from './create-closure-inspection-visit.dto';

export class CreateClosureInspectionReportDto {
  // Core identification
  @IsString() @MaxLength(200)
  personName: string;

  @IsString() @MaxLength(25)
  idNumber: string;

  // Property identifiers
  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  // Permits / contract
  @IsOptional() @IsString() @MaxLength(50)
  permitNumber?: string;

  @IsString() @MaxLength(50)
  @Matches(/^OC-/i, { message: 'contractNumber must start with "OC-"' })
  contractNumber: string;

  @IsOptional() @IsString() @MaxLength(100)
  workReceiptNumber?: string;

  // Areas "000 m²"
  @IsOptional() @IsString() @MaxLength(24)
  @Matches(/^\d{1,6}\s?m²$/i, { message: 'assessedArea must look like "000 m²"' })
  assessedArea?: string;

  @IsOptional() @IsString() @MaxLength(24)
  @Matches(/^\d{1,6}\s?m²$/i, { message: 'builtArea must look like "000 m²"' })
  builtArea?: string;

  // Location & main visit
  @IsString() @MaxLength(100)
  province: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsString() @MaxLength(100)
  district: string;

  @IsOptional() @IsDateString()
  visitDate?: string;

  // Address & notes
  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsString()
  observations?: string;

  // Actions & Photos (simple arrays)
  @IsOptional() @IsArray() @ArrayUnique() @IsString({ each: true })
  actions?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];

  // Visits (child rows)
  @IsOptional() @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClosureInspectionVisitDto)
  visits?: CreateClosureInspectionVisitDto[];
}
