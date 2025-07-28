// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsString()
  @Length(0, 100)
  @IsOptional()
  secondLastName?: string;

  @IsString()
  @Length(0, 20)
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  role: string;
}
