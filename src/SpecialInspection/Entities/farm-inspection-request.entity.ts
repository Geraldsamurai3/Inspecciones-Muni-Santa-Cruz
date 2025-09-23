// src/farm-inspection-requests/entities/farm-inspection-request.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'farm_inspection_requests' })
export class FarmInspectionRequest {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Core fields ---
  @Column({ type: 'varchar', length: 200 })
  personName: string;                 // Persona

  @Column({ type: 'varchar', length: 25 })
  idNumber: string;                   // No. ID

  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;            // No. Finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;           // No. de Catastro

  @Column({ type: 'boolean', default: false })
  hasBuildingPermit: boolean;         // Permiso Const (boolean)

  @Column({ type: 'boolean', default: false })
  hasCommercialLicense: boolean;      // Lic comercial (boolean)

  @Column({ type: 'boolean', default: false })
  hasLiquorLicense: boolean;          // Lic de Licores (boolean)

  @Column({ type: 'varchar', length: 200, nullable: true })
  others?: string;                    // Otros (texto corto)

  @Column({ type: 'varchar', length: 100 })
  district: string;                   // Distrito

  @Column({ type: 'varchar', length: 100 })
  canton: string;                     // Cantón

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                   // Fecha de visita

  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                   // Dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;              // Observaciones

  // --- Photos (array of URLs/paths) ---
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];               // Fotos
}
