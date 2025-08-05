import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { District } from '../Enums/district.enum';


export class CreateLocationDto {
  @IsEnum(District, { message: 'District must be a valid value from the enum' })
  @IsNotEmpty({ message: 'District is required' })
  district: District;

  @IsString({ message: 'Exact address must be a string' })
  @IsNotEmpty({ message: 'Exact address is required' })
  exactAddress: string;
}
