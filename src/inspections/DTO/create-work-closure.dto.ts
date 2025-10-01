// src/work-closures/dto/create-work-closure.dto.ts
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
} from 'class-validator';
import { VisitNumber } from '../Enums/visit-number.enum';


export class CreateWorkClosureDto {
  // Property / paperwork
  @IsOptional() @IsString() @MaxLength(50)
  propertyNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  cadastralNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  contractNumber?: string;

  @IsOptional() @IsString() @MaxLength(50)
  permitNumber?: string;

  // Areas
  @IsOptional() @IsString() @MaxLength(24)
  assessedArea?: string;

  @IsOptional() @IsString() @MaxLength(24)
  builtArea?: string;

  // Visit enum
  @IsOptional() @IsEnum(VisitNumber)
  visitNumber?: VisitNumber;

  // Receipt boolean
  @IsBoolean()
  workReceipt: boolean;

  // Strings
  @IsOptional() @IsString() @MaxLength(500)
  actions?: string;

  @IsOptional() @IsString() @MaxLength(500)
  observations?: string;

  // Photos
  @IsOptional() @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
