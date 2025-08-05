// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Length, Matches } from 'class-validator';

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
  @Matches(/^\d{7,20}$/, {
    message: 'Cédula debe tener entre 7 y 20 dígitos',
  })
  cedula: string

  @IsString()
  @IsOptional()
  role: string;
}
