// src/land-use-attentions/entities/land-use-attention.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'land_use_attentions' })
export class LandUseAttention {
  @PrimaryGeneratedColumn()
  id: number;

  // Applicant
  @Column({ type: 'varchar', length: 200 })
  applicantName: string;           // solicitante

  @Column({ type: 'varchar', length: 25 })
  applicantIdNumber: string;       // No.ID (solicitante)

  // Owner
  @Column({ type: 'varchar', length: 200 })
  ownerName: string;               // propietario

  @Column({ type: 'varchar', length: 25 })
  ownerIdNumber: string;           // No. de ID (propietario)

  // Property / request
  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;        // No. de Catastro

  @Column({ type: 'varchar', length: 150 })
  requestedLandUse: string;        // Uso solicitado

  // Location & visit
  @Column({ type: 'varchar', length: 100 })
  province: string;                // provincia

  @Column({ type: 'varchar', length: 100 })
  canton: string;                  // cantón

  @Column({ type: 'varchar', length: 100 })
  district: string;                // distrito

  @Column({ type: 'date', nullable: true })
  visitDate?: Date;                // fecha de visita

  // Address & notes
  @Column({ type: 'varchar', length: 400, nullable: true })
  address?: string;                // dirección

  @Column({ type: 'text', nullable: true })
  observations?: string;           // observaciones

  // Photos (array of URLs/paths)
  @Column({ type: 'simple-json', nullable: true })
  photoUrls?: string[];            // fotos
}
