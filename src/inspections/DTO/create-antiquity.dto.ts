import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateAntiquityDto {
  @IsString()
  @IsNotEmpty()
  propertyNumber: string;

  @IsString()
  @IsNotEmpty()
  estimatedAntiquity: string;

  @IsOptional()
  @IsArray()
  photos?: string[]; // file names or URLs
}
