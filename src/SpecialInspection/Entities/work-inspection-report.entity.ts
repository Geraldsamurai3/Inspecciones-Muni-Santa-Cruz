// src/work-inspection-reports/entities/work-inspection-report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'work_inspection_reports' })
export class WorkInspectionReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Person & IDs
  @Column({ type: 'varchar', length: 200 })
  personName: string;                 // persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;                   // NO. ID

  // Property / paperwork
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;            // No. de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;           // No. de Catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractNumber?: string;            // No. de contrato

  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;              // No. de permiso

  // Areas (free text, e.g., "120 m²")
  @Column({ type: 'varchar', length: 24, nullable: true })
  assessedArea?: string;              // Área tasada

  @Column({ type: 'varchar', length: 24, nullable: true })
  builtArea?: string;                 // Área de Const

  // Visits
  @Column({ type: 'date', nullable: true })
  visit1Date?: Date;                  // Visita No. 1

  @Column({ type: 'date', nullable: true })
  visit2Date?: Date;                  // Visita No. 2

  @Column({ type: 'date', nullable: true })
  visit3Date?: Date;                  // Visita No. 3

  @Column({ type: 'varchar', length: 100, nullable: true })
  workReceiptNumber?: string;         // recibo de obra

  // Location & main visit
  @Column({ type: 'varchar', length: 100 })
  district: string;                   // distrito

  @Column({ type: 'varchar', length: 100 })
  canton: string;                     // cantón

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                   // fecha de visita

  // Address & notes
  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                   // dirección

  @Column({ type: 'simple-json', nullable: true })
  actions?: string[];                 // acciones (p.ej. ["inspection","notice"])

  @Column({ type: 'text', nullable: true })
  observations?: string;              // observaciones
}
