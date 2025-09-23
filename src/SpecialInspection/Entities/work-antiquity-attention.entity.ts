// src/work-antiquity-attentions/entities/work-antiquity-attention.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'work_antiquity_attentions' })
export class WorkAntiquityAttention {
  @PrimaryGeneratedColumn()
  id: number;

  // People
  @Column({ type: 'varchar', length: 200 })
  applicantName: string;               // Solicitante

  @Column({ type: 'varchar', length: 25 })
  applicantIdNumber: string;           // No. de ID

  @Column({ type: 'varchar', length: 200 })
  ownerName: string;                   // Propietario

  // Property
  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;             // No. de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;            // No. de catastro

  // Work age (stored as text to enforce the "00 años" format)
  @Column({ type: 'varchar', length: 16, nullable: true })
  workAge?: string;                    // Antigüedad (e.g., "12 años")

  // Location & visit
  @Column({ type: 'varchar', length: 100 })
  province: string;                    // Provincia

  @Column({ type: 'varchar', length: 100 })
  canton: string;                      // Cantón

  @Column({ type: 'varchar', length: 100 })
  district: string;                    // Distrito

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                    // Fecha visita

  // Address & notes
  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                    // Dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;               // Observaciones

  // Photos (array of URLs/paths)
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];                // Fotos
}
