import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  Length,
} from 'class-validator';

export class CreatePcCancellationDto {
  @IsString({ message: 'Contract number must be a string' })
  @IsNotEmpty({ message: 'Contract number is required' })
  @Length(1, 50, { message: 'Contract number must be up to 50 characters' })
  contractNumber: string;

  @IsString({ message: 'PC number must be a string' })
  @IsNotEmpty({ message: 'PC number is required' })
  @Length(1, 50, { message: 'PC number must be up to 50 characters' })
  pcNumber: string;

  @IsBoolean({ message: 'Was built must be true or false' })
  wasBuilt: boolean;

  @IsOptional()
  @IsString({ message: 'Observations must be a string' })
  observations?: string;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of strings' })
  photos?: string[];
}
