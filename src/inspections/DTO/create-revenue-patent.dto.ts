// src/revenue-patents/dto/create-revenue-patent.dto.ts
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { LicenseType } from '../Enums/license-type.enum';
import { ZoneDemarcationOption } from '../Enums/zone-demarcation-option.enum';
import { RegulatoryPlanConformityOption } from '../Enums/regulatory-plan-conformity-option.enum';


// Accept "000m" or "000 m" (exactly three digits + 'm')
const DIST_REGEX = /^\d{1,9}\s?m$/i;

export class CreateRevenuePatentDto {
  @IsString() @MaxLength(200)
  tradeName: string;

  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  landUseReference?: string;

  @IsEnum(LicenseType)
  licenseType: LicenseType;

  // Distances
  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'educationalCenters must look like "000m" or "000 m"' })
  educationalCenters?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'childNutritionCenters must look like "000m" or "000 m"' })
  childNutritionCenters?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'religiousFacilities must look like "000m" or "000 m"' })
  religiousFacilities?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'elderCareCenters must look like "000m" or "000 m"' })
  elderCareCenters?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'hospitals must look like "000m" or "000 m"' })
  hospitals?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'clinics must look like "000m" or "000 m"' })
  clinics?: string;

  @IsOptional() @IsString() @Matches(DIST_REGEX, { message: 'ebais must look like "000m" or "000 m"' })
  ebais?: string;

  // Zone demarcation + observation
  @IsOptional() @IsEnum(ZoneDemarcationOption)
  zoneDemarcation?: ZoneDemarcationOption;

  @IsOptional() @IsString() @MaxLength(400)
  zoneDemarcationObservation?: string;

  // Regulatory plan conformity + observation
  @IsOptional() @IsEnum(RegulatoryPlanConformityOption)
  regulatoryPlanConformity?: RegulatoryPlanConformityOption;

  @IsOptional() @IsString() @MaxLength(400)
  regulatoryPlanObservation?: string;

  // Notes & photos
  @IsOptional() @IsString()
  observations?: string;

  @IsOptional() @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
