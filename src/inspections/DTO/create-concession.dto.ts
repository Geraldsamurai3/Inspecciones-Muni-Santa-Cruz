import {
  IsEnum,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsString,
  IsArray
} from 'class-validator';
import { ConcessionType } from '../Enums/concession-type.enum';

export class CreateConcessionDto {
  @IsString() @IsNotEmpty()
  fileNumber: string;

  @IsEnum(ConcessionType)
  concessionType: ConcessionType;

  @IsDateString()
  grantedAt: Date;

  
  @IsDateString()
  expiresAt: Date;

  
  @IsString()
  observations: string;

  @IsOptional()
  @IsArray()
  photos?: string[];
}
