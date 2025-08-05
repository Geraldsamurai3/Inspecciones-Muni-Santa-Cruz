import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateGeneralInspectionDto {
  @IsString()
  @IsNotEmpty()
  propertyNumber: string;

  @IsString()
  @IsNotEmpty()
  observations: string;

  @IsOptional()
  @IsArray()
  photos?: string[];
}
