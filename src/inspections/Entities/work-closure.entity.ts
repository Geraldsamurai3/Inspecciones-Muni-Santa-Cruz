// src/work-closures/entities/work-closure.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { VisitNumber } from '../Enums/visit-number.enum';


@Entity({ name: 'work_closures' })
export class WorkClosure {
  @PrimaryGeneratedColumn()
  id: number; // numeric id (AUTO_INCREMENT)

  // Property / paperwork
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;           // Número de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;          // Número de catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractNumber?: string;           // No de contrato

  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;             // Número de permiso

  // Areas (kept as strings; e.g., "120 m²")
  @Column({ type: 'varchar', length: 24, nullable: true })
  assessedArea?: string;             // Área tasada

  @Column({ type: 'varchar', length: 24, nullable: true })
  builtArea?: string;                // Área construida

  // Visit marker (enum)
  @Column({ type: 'enum', enum: VisitNumber, nullable: true })
  visitNumber?: VisitNumber;         // Visit No1/No2/No3 (enum)

  // Receipt of work (boolean)
  @Column({ type: 'boolean', default: false })
  workReceipt: boolean;              // Recibo de obra

  // Strings as requested
  @Column({ type: 'varchar', length: 500, nullable: true })
  actions?: string;                  // Acciones (string)

  @Column({ type: 'varchar', length: 500, nullable: true })
  observations?: string;             // Observaciones (string)

  // Photos (array of URL/paths)
  @Column({ type: 'simple-json', nullable: true })
  photos?: string[];              // Fotos
}
