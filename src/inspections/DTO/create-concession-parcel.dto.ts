import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MojonType } from '../Enums/mojon-type.enum';

export class CreateConcessionParcelDto {
  @IsString() @IsNotEmpty()
  planType: string;

  @IsString() @IsNotEmpty()
  planNumber: string;

  @Transform(({ value }) => {
    if (value == null || value === '') return '';
    return String(value);
  })
  @IsNumberString()
  area: string;  // se transformará a number en el service

  @IsEnum(MojonType)
  mojonType: MojonType;

  @IsBoolean()
  planComplies: boolean;

  @IsBoolean()
  respectsBoundary: boolean;

  @IsString() @IsNotEmpty()
  anchorageMojones: string;

  @IsString() @IsNotEmpty()
  topography: string;

  @IsOptional()
  @IsString()
  topographyOther?: string;

  @IsOptional()
  @IsArray()
  fenceTypes?: string[];

  @IsBoolean()
  fencesInvadePublic: boolean;

  @IsBoolean()
  roadHasPublicAccess: boolean;

  @IsOptional()
  @IsString()
  roadDescription?: string;

  @IsOptional()
  @IsString()
  roadLimitations?: string;

  @IsBoolean()
  roadMatchesPlan: boolean;

  @IsOptional()
  @IsString()
  rightOfWayWidth?: string;
}
