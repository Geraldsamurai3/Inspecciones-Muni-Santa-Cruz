// src/farm-inspection-requests/dto/create-farm-inspection-request.dto.ts
import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateFarmInspectionRequestDto {
  @IsString() @MaxLength(200)
  personName: string;

  @IsString() @MaxLength(25)
  idNumber: string;

  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsBoolean()
  hasBuildingPermit: boolean;

  @IsBoolean()
  hasCommercialLicense: boolean;

  @IsBoolean()
  hasLiquorLicense: boolean;

  @IsOptional() @IsString() @MaxLength(200)
  others?: string;

  @IsString() @MaxLength(100)
  district: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsOptional() @IsDateString()
  visitDate?: string; // ISO 8601

  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsString()
  observations?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];
}
