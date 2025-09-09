// src/inspections/Entities/inspection.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
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
@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_date', type: 'varchar', length: 10, transformer: {
    to: (value: Date | string) => {
      if (!value) return null;
      if (typeof value === 'string') {
        // Si ya es string, verificar que tenga formato YYYY-MM-DD
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
      }
      // Si es Date, convertir a YYYY-MM-DD
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    from: (value: string) => {
      // Retornar como string directamente para evitar conversiones de zona horaria
      return value;
    }
  }})
  inspectionDate: string;

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

