// src/revenue-patents/entities/revenue-patent.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LicenseType } from '../Enums/license-type.enum';
import { ZoneDemarcationOption } from '../Enums/zone-demarcation-option.enum';
import { RegulatoryPlanConformityOption } from '../Enums/regulatory-plan-conformity-option.enum';

@Entity({ name: 'revenue_patents' })
export class RevenuePatent {
  @PrimaryGeneratedColumn()
  id: number; // numeric id (auto-increment)

  // Top-level info
  @Column({ type: 'varchar', length: 200 })
  tradeName: string;                      // nombre comercial

  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;                // número de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;               // número de catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  landUseReference?: string;              // referencia de uso de suelo

  @Column({ type: 'enum', enum: LicenseType })
  licenseType: LicenseType;               // tipo de licencia

@Column({ type: 'varchar', length: 16, nullable: true })
  educationalCenters?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  childNutritionCenters?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  religiousFacilities?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  elderCareCenters?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  hospitals?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  clinics?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  ebais?: string;

  // Zone demarcation (enum + optional observation)
  @Column({
    type: 'enum',
    enum: ZoneDemarcationOption,
    default: ZoneDemarcationOption.ACCORDING_TO_LAND_USE,
  })
  zoneDemarcation: ZoneDemarcationOption;

  @Column({ type: 'varchar', length: 400, nullable: true })
  zoneDemarcationObservation?: string;

  // Regulatory plan conformity (enum + optional observation)
  @Column({
    type: 'enum',
    enum: RegulatoryPlanConformityOption,
    default: RegulatoryPlanConformityOption.ACCORDING_TO_REGULATORY_PLAN,
  })
  regulatoryPlanConformity: RegulatoryPlanConformityOption;

  @Column({ type: 'varchar', length: 400, nullable: true })
  regulatoryPlanObservation?: string;

  // Notes & photos
  @Column({ type: 'text', nullable: true })
  observations?: string;

  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[]; // array of URLs/paths
}
