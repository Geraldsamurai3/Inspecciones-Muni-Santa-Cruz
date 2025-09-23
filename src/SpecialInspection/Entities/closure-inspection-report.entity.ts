// src/closure-inspections/entities/closure-inspection-report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClosureInspectionVisit } from './closure-inspection-visit.entity';


@Entity({ name: 'closure_inspection_reports' })
export class ClosureInspectionReport {
  @PrimaryGeneratedColumn()
  id: number;

  // Core identification
  @Column({ type: 'varchar', length: 200 })
  personName: string;               // Persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;                 // No. de ID

  // Property identifiers
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;          // No. de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;         // No. de Catastro

  // Permits / contract
  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;            // No. de permiso

  @Column({ type: 'varchar', length: 50 })
  contractNumber: string;           // No. de Contrato (must start with "OC-")

  @Column({ type: 'varchar', length: 100, nullable: true })
  workReceiptNumber?: string;       // Recibo de obra

  // Areas as strings to enforce "000 m²" format
  @Column({ type: 'varchar', length: 24, nullable: true })
  assessedArea?: string;            // Área tasada (e.g., "120 m²")

  @Column({ type: 'varchar', length: 24, nullable: true })
  builtArea?: string;               // Área construida (e.g., "085 m²")

  // Location & main visit
  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 100 })
  canton: string;

  @Column({ type: 'varchar', length: 100 })
  district: string;

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                 // fecha de visita (principal)

  // Address & notes
  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                 // dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;            // observaciones

  // Actions & Photos (simple arrays)
  @Column({ type: 'simple-json', nullable: true })
  actions?: string[];               // e.g., ["work_closure","seal_placement"]

  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];             // e.g., ["/uploads/1.jpg","https://.../2.png"]

  // Visits (child rows)
  @OneToMany(
    () => ClosureInspectionVisit,
    (visit) => visit.report,
    { cascade: ['insert', 'update'], orphanedRowAction: 'delete' },
  )
  visits?: ClosureInspectionVisit[];
}
