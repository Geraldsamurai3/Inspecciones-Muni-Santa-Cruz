import {
  IsBoolean,
  IsOptional,
  IsString,
  IsArray
} from 'class-validator';

export class CreateConstructionDto {
  @IsOptional()
  @IsString({ message: 'Land use type must be a string' })
  landUseType?: string;

  @IsBoolean({ message: 'Matches location must be true or false' })
  matchesLocation: boolean;

  @IsBoolean({ message: 'Recommended must be true or false' })
  recommended: boolean;

  @IsOptional()
  @IsString({ message: 'Observations must be a string' })
  observations?: string;

  @IsOptional()
  @IsString({ message: 'Property number must be a string' })
  propertyNumber?: string;

  @IsOptional()
  @IsString({ message: 'Estimated age must be a string' })
  estimatedAge?: string;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of strings' })
  photos?: string[];
}
