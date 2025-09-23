// src/property-xxx-verifications/dto/create-property-xxx-verification.dto.ts
import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class CreatePropertyXxxVerificationDto {
  @IsString() @MaxLength(200)
  personName: string;

  @IsString() @MaxLength(25)
  idNumber: string;

  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsString() @MaxLength(120)
  typology: string;

  @IsOptional() @IsInt() @Min(0)
  housingUnits?: number;

  @IsBoolean()
  curbAndGutter: boolean;

  @IsString() @MaxLength(100)
  district: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsOptional() @IsDateString()
  visitDate?: string; // ISO 8601

  @IsOptional() @IsString() @MaxLength(400)
  address?: string;

  @IsOptional() @IsString() @MaxLength(200)
  others?: string;

  @IsOptional() @IsString()
  observations?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  photoUrls?: string[];
}
