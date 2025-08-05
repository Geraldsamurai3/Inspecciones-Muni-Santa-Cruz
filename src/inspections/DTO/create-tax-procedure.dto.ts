import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaxProcedureType } from '../Enums/tax-procedure.enum';

export class CreateTaxProcedureDto {
  @IsEnum(TaxProcedureType, { message: 'Procedure type must be a valid value' })
  @IsNotEmpty({ message: 'Procedure type is required' })
  procedureType: TaxProcedureType;
}
