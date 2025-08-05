import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateLandUseDto {
  @IsString()
  @IsNotEmpty()
  requestedUse: string;

  @IsBoolean()
  matchesLocation: boolean;

  @IsBoolean()
  isRecommended: boolean;
}
