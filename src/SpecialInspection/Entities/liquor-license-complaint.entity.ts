// src/special-inspections/entities/liquor-license-complaint.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'liquor_license_complaints' })
export class LiquorLicenseComplaint {
  @PrimaryGeneratedColumn()
  id: number;

  // --- Core fields ---
  @Column({ type: 'varchar', length: 200 })
  applicantName: string;            // Solicitante

  @Column({ type: 'varchar', length: 25 })
  applicantIdNumber: string;        // NO. de ID

  @Column({ type: 'varchar', length: 150 })
  licenseType: string;              // Tipo de Licencia

  @Column({ type: 'varchar', length: 200, nullable: true })
  tradeName?: string;               // Nombre Comercial

  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;          // No. de Finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;         // No. de Catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  landUseReference?: string;        // Ref. Uso de suelo

  @Column({ type: 'varchar', length: 100 })
  province: string;                 // Provincia

  @Column({ type: 'varchar', length: 100 })
  canton: string;                   // Cantón

  @Column({ type: 'varchar', length: 100 })
  district: string;                 // Distrito

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                 // Fecha Visita

  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                 // Dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;            // Observaciones

  // --- Booleans (Yes/No checks) ---
  @Column({ type: 'boolean', default: false })
  hasPublicPrivateSchools: boolean;

  @Column({ type: 'boolean', default: false })
  hasChildNutritionCenters: boolean;

  @Column({ type: 'boolean', default: false })
  hasReligiousFacilities: boolean;

  @Column({ type: 'boolean', default: false })
  hasElderCareCenters: boolean;

  @Column({ type: 'boolean', default: false })
  hasHospitals: boolean;

  @Column({ type: 'boolean', default: false })
  hasClinics: boolean;

  @Column({ type: 'boolean', default: false })
  hasEbais: boolean;

  @Column({ type: 'boolean', default: false })
  demarcatedUseZoneCompliant: boolean; // “Zona demarcada de uso (según uso de suelo)”

  @Column({ type: 'boolean', default: false })
  regulatoryPlanCompliant: boolean;    // “Conforme al Plan Regulador”

  // --- Photos (array of URLs/paths) ---
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[]; // e.g., ["https://.../1.jpg", "/uploads/2.png"]
}
