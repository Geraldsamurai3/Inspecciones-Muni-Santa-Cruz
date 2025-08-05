import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLegalEntityRequestDto {
  @IsString({ message: 'Legal name must be a string' })
  @IsNotEmpty({ message: 'Legal name is required' })
  @Length(1, 150, { message: 'Legal name must be between 1 and 150 characters' })
  legalName: string;

  @IsString({ message: 'Legal ID must be a string' })
  @IsNotEmpty({ message: 'Legal ID is required' })
  @Length(1, 20, { message: 'Legal ID must be between 1 and 20 characters' })
  legalId: string;
}
