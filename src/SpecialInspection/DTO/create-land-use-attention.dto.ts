// src/land-use-attentions/dto/create-land-use-attention.dto.ts
import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateLandUseAttentionDto {
  // Applicant
  @IsString() @MaxLength(200)
  applicantName: string;

  @IsString() @MaxLength(25)
  applicantIdNumber: string;

  // Owner
  @IsString() @MaxLength(200)
  ownerName: string;

  @IsString() @MaxLength(25)
  ownerIdNumber: string;

  // Property / request
  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsString() @MaxLength(150)
  requestedLandUse: string;

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
  @IsOptional() @IsArray()
  // each photo as string (URL/path)
  // eslint-disable-next-line @typescript-eslint/ban-types
  photoUrls?: string[];
}
