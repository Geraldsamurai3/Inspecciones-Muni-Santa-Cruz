import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsEnum,
  IsBoolean,
  IsArray
} from 'class-validator';
import { MojonType } from '../Enums/mojon-type.enum';

export class CreateConcessionParcelDto {
  @IsString() @IsNotEmpty()
  planType: string;

  @IsString() @IsNotEmpty()
  planNumber: string;

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

   @IsString()
  topographyOther: string;

 @IsArray()
  fenceTypes: string[];

  @IsBoolean()
  fencesInvadePublic: boolean;

  @IsBoolean()
  roadHasPublicAccess: boolean;

   @IsString()
  roadDescription: string;

   @IsString()
  roadLimitations: string;

  @IsBoolean()
  roadMatchesPlan: boolean;

   @IsString()
  rightOfWayWidth: string;
}
