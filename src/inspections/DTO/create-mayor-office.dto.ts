import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateMayorOfficeDto {
  @IsString({ message: 'Procedure type must be a string' })
  @IsNotEmpty({ message: 'Procedure type is required' })
  procedureType: string;

  @IsOptional()
  @IsString({ message: 'Observations must be a string' })
  observations?: string;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of strings' })
  photos?: string[]; // list of file names or URLs
}
