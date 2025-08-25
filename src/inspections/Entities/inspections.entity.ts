// src/inspections/Entities/inspection.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Inspector } from '../Enums/inspector.enum';
import { ApplicantType } from '../Enums/applicant.enum';
import { IndividualRequest } from './individual-request.entity';
import { LegalEntityRequest } from './legalEntityRequest';
import { Construction } from './construction.entity';
import { PcCancellation } from './pcCancellation.entity';
import { WorkReceipt } from './workReceipt.entity';
import { GeneralInspection } from './generalInspection.entity';
import { TaxProcedure } from './taxProcedure.entity';
import { MayorOffice } from './mayor-office.entity';
import { Antiquity } from './antiquity.entity';
import { LandUse } from './landUse.entity';
import { Location } from './location.entity';
import { Concession } from './zmt.consession.enity';
@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_date', type: 'date' })
  inspectionDate: Date;

  @Column({ name: 'procedure_number', type: 'varchar', length: 100 })
  procedureNumber: string;

  @Column("simple-array", { name: 'performed_by' })
  performedBy: Inspector[];

  @Column({ type: 'enum', enum: ApplicantType })
  applicantType: ApplicantType;

  @OneToOne(() => IndividualRequest, { cascade: true, nullable: true })
  @JoinColumn()
  individualRequest?: IndividualRequest;

  @OneToOne(() => LegalEntityRequest, { cascade: true, nullable: true })
  @JoinColumn()
  legalEntityRequest?: LegalEntityRequest;

  @OneToOne(() => Construction, { cascade: true })
  @JoinColumn()
  construction: Construction;

  @OneToOne(() => PcCancellation, { cascade: true })
  @JoinColumn()
  pcCancellation: PcCancellation;

  @OneToOne(() => WorkReceipt, { cascade: true })
  @JoinColumn()
  workReceipt: WorkReceipt;

  @OneToOne(() => GeneralInspection, { cascade: true })
  @JoinColumn()
  generalInspection: GeneralInspection;

  @OneToOne(() => TaxProcedure, { cascade: true })
  @JoinColumn()
  taxProcedure: TaxProcedure;

  @OneToOne(() => MayorOffice, { cascade: true })
  @JoinColumn()
  mayorOffice: MayorOffice;

  @OneToOne(() => Antiquity, { cascade: true })
  @JoinColumn()
  antiquity: Antiquity;

  @OneToOne(() => Location, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToOne(() => LandUse, { cascade: true })
  @JoinColumn()
  landUse: LandUse;

  @OneToOne(() => Concession, concession => concession.inspection, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()                          // <-- aquí
  concession?: Concession;
}

