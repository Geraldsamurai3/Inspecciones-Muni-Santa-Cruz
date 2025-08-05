import { PartialType } from '@nestjs/mapped-types';
import { CreateTaxProcedureDto } from './create-tax-procedure.dto';

export class UpdateTaxProcedureDto extends PartialType(CreateTaxProcedureDto) {}
