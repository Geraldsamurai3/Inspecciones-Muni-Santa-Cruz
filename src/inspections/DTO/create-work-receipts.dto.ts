import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { WorkState } from '../Enums/WorkState.enum';

export class CreateWorkReceiptDto {
  @IsDateString({}, { message: 'Visit date must be a valid date string' })
  visitDate: Date;

  @IsEnum(WorkState, { message: 'State must be a valid WorkState enum value' })
  state: WorkState;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of strings' })
  photos?: string[];
}
