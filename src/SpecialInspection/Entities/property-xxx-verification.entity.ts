// src/property-xxx-verifications/entities/property-xxx-verification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'property_xxx_verifications' })
export class PropertyXxxVerification {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Core fields ---
  @Column({ type: 'varchar', length: 200 })
  personName: string;                 // Persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;                   // No. de ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;            // No. de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;           // No. de catastro

  @Column({ type: 'varchar', length: 120 })
  typology: string;                   // Tipología

  @Column({ type: 'int', nullable: true })
  housingUnits?: number;              // Unidades Hab

  @Column({ type: 'boolean', default: false })
  curbAndGutter: boolean;             // Cordón y caño (sí/no)

  @Column({ type: 'varchar', length: 100 })
  district: string;                   // Distrito

  @Column({ type: 'varchar', length: 100 })
  canton: string;                     // Cantón

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                   // Fecha de visita

  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                   // Dirección

  @Column({ type: 'varchar', length: 200, nullable: true })
  others?: string;                    // Campo "otros"

  @Column({ type: 'text', nullable: true })
  observations?: string;              // Observaciones

  // --- Photos (array of URLs/paths) ---
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];               // Fotografías
}
