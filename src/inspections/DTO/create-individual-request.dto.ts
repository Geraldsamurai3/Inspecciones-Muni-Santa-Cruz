import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateIndividualRequestDto {
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Length(1, 100, { message: 'First name must be between 1 and 100 characters' })
  firstName: string;

  @IsString({ message: 'Last name 1 must be a string' })
  @IsNotEmpty({ message: 'Last name 1 is required' })
  @Length(1, 100, { message: 'Last name 1 must be between 1 and 100 characters' })
  lastName1: string;

  @IsOptional()
  @IsString({ message: 'Last name 2 must be a string' })
  @Length(0, 100, { message: 'Last name 2 cannot exceed 100 characters' })
  lastName2?: string;

  @IsString({ message: 'Physical ID must be a string' })
  @IsNotEmpty({ message: 'Physical ID is required' })
  @Length(1, 20, { message: 'Physical ID must be between 1 and 20 characters' })
  physicalId: string;
}
