// src/inspections/Entities/concession.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Inspection } from './inspections.entity';
import { ConcessionParcel } from './zmt.consession.parcels.entity';
import { ConcessionType } from '../Enums/concession-type.enum';


@Entity('zmt_concessions')
export class Concession {
  @PrimaryGeneratedColumn()
  id: number;

  /** Número de expediente o contrato */
  @Column({ name: 'file_number', type: 'varchar', length: 50 })
  fileNumber: string;

  /** Tipo de concesión: nueva, renovación o modificación */
  @Column({ type: 'enum', enum: ConcessionType })
  concessionType: ConcessionType;

  /** Fecha en que se otorgó la concesión */
  @Column({ name: 'granted_at', type: 'date' })
  grantedAt: Date;

  /** Fecha de vencimiento (opcional) */
  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt?: Date;

  /** Observaciones generales sobre la concesión */
  @Column({ type: 'text', nullable: true })
  observations?: string;

  /** Rutas o URLs a fotos/planos escaneados */
  @Column('simple-array', { nullable: true })
  photos?: string[];

  /**
   * Lado inverso de la relación 1:1 con Inspection.
   * La FK ("concessionId") vive en la tabla "inspections".
   */
  @OneToOne(() => Inspection, inspection => inspection.concession)
  inspection: Inspection;

  /**
   * Una concesión puede abarcar múltiples parcelas.
   * Cascade permite crear/actualizar parcelas al guardar la concesión.
   */
  @OneToMany(() => ConcessionParcel, parcel => parcel.concession, { cascade: true })
  parcels: ConcessionParcel[];
}
