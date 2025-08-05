import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TaxProcedureType } from '../Enums/tax-procedure.enum';


@Entity('tax_procedures')
export class TaxProcedure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TaxProcedureType })
  procedureType: TaxProcedureType;
}
