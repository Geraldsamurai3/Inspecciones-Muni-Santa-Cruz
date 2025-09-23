// src/work-antiquity-attentions/dto/create-work-antiquity-attention.dto.ts
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateWorkAntiquityAttentionDto {
  // People
  @IsString() @MaxLength(200)
  applicantName: string;

  @IsString() @MaxLength(25)
  applicantIdNumber: string;

  @IsString() @MaxLength(200)
  ownerName: string;

  // Property
  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  // Work age, format "00 años" (space optional)
  @IsOptional() @IsString() @MaxLength(16)
  @Matches(/^\d{1,3}\s?años$/i, { message: 'workAge must look like "00 años"' })
  workAge?: string;

  // Location & visit
  @IsString() @MaxLength(100)
  province: string;

  @IsString() @MaxLength(100)
  canton: string;

  @IsString() @MaxLength(100)
  district: string;

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
