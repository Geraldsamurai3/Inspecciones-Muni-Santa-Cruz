// src/special-inspections/dto/create-liquor-license-complaint.dto.ts
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class CreateLiquorLicenseComplaintDto {
  // Core fields
  @IsString() @MaxLength(200)
  applicantName: string;

  @IsString() @MaxLength(25) @IsNotEmpty()
  applicantIdNumber: string;

  @IsString() @MaxLength(150) @IsNotEmpty()
  licenseType: string;

  @IsOptional() @IsString() @MaxLength(200)
  tradeName?: string;

  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  landUseReference?: string;

  @IsString() @MaxLength(100)
  province: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsString() @MaxLength(100)
  district: string;

  @IsOptional() @IsDateString()
  visitDate?: string; // ISO 8601

  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsString()
  observations?: string;

  // Booleans
  @IsBoolean() hasPublicPrivateSchools: boolean;
  @IsBoolean() hasChildNutritionCenters: boolean;
  @IsBoolean() hasReligiousFacilities: boolean;
  @IsBoolean() hasElderCareCenters: boolean;
  @IsBoolean() hasHospitals: boolean;
  @IsBoolean() hasClinics: boolean;
  @IsBoolean() hasEbais: boolean;
  @IsBoolean() demarcatedUseZoneCompliant: boolean;
  @IsBoolean() regulatoryPlanCompliant: boolean;

  // Photos
  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];
}
