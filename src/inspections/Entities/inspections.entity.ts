// src/inspections/Entities/inspection.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  UpdateDateColumn,
  CreateDateColumn
} from 'typeorm';
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
import { User } from 'src/users/entities/user.entity';
import { InspectionStatus } from '../Enums/inspection-status.enum';
@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_date', type: 'date' })
  inspectionDate: Date;

  @Column({ name: 'procedure_number', type: 'varchar', length: 100 })
  procedureNumber: string;

  @ManyToMany(() => User, (user) => user.inspections, { eager: true })
  @JoinTable({
    name: 'inspection_users', // nombre de tabla intermedia
    joinColumn: { name: 'inspection_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  inspectors: User[];

  @Column({ type: 'enum', enum: ApplicantType })
  applicantType: ApplicantType;


// Audit opcional (útil para debugging)

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

// Estado actual de la inspección
@Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.NEW })
status: InspectionStatus;

// Momento en que pasó a "Revisado". Sirve para el cron.
@Column({ type: 'timestamp', nullable: true })
reviewedAt?: Date | null;



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
  @JoinColumn()                          
  concession?: Concession;
}

