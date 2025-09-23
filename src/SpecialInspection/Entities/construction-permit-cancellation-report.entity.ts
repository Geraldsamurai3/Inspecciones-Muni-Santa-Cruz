// src/construction-permit-cancellations/entities/construction-permit-cancellation-report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'construction_permit_cancellation_reports' })
export class ConstructionPermitCancellationReport {
  @PrimaryGeneratedColumn()
  id: number;

  // Person & IDs
  @Column({ type: 'varchar', length: 200 })
  personName: string;                 // persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;                   // No. Id

  // Property / paperwork
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;            // No. de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;           // No. de catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractNumber?: string;            // No. de contrato

  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;              // No. de permiso

  @Column({ type: 'varchar', length: 50, nullable: true })
  professionalCardNumber?: string;    // Carné Prof

  @Column({ type: 'boolean', default: false })
  built: boolean;                     // Construyó (sí/no)

  // Location & visit
  @Column({ type: 'varchar', length: 100 })
  district: string;                   // Distrito

  @Column({ type: 'varchar', length: 100 })
  canton: string;                     // Cantón

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                   // fecha de visita

  // Address & notes
  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                   // dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;              // observaciones

  // Photos (array of URLs/paths)
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];               // fotos
}
