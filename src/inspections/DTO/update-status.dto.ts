import { IsEnum } from 'class-validator';
import { InspectionStatus } from '../Enums/inspection-status.enum';

export class UpdateStatusDto {
  @IsEnum(InspectionStatus)
  status!: InspectionStatus;
}
