// src/cfia-resignations/entities/cfia-resignation-attention.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'cfia_resignation_attentions' })
export class CfiaResignationAttention {
  @PrimaryGeneratedColumn()
  id: number;

  // Person
  @Column({ type: 'varchar', length: 200 })
  personName: string;           // Persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;             // No.Id

  // Property / paperwork
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;      // No de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;     // No de catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractNumber?: string;      // No de contrato

  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;        // No de permiso

  // Areas (kept as strings; you can store values like "120 m²")
  @Column({ type: 'varchar', length: 24, nullable: true })
  assessedArea?: string;        // Area tasada

  @Column({ type: 'varchar', length: 24, nullable: true })
  builtArea?: string;           // Area Const.

  // Location & visit
  @Column({ type: 'varchar', length: 100 })
  province: string;             // Provincia

  @Column({ type: 'varchar', length: 100 })
  canton: string;               // Cantón

  @Column({ type: 'varchar', length: 100 })
  district: string;             // Distrito

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;             // Fecha Visita

  // Notes & photos
  @Column({ type: 'text', nullable: true })
  observations?: string;        // Observaciones

  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];         // Fotos (array de URLs/paths)
}
