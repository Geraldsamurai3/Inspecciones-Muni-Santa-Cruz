// src/inspections/Entities/concession-parcel.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { MojonType } from '../Enums/mojon-type.enum';
import { Concession } from './zmt.consession.enity';


@Entity('zmt_concession_parcels')
export class ConcessionParcel {
  @PrimaryGeneratedColumn()
  id: number;

  // — Sección 2: datos de plano y mojones —
  @Column({ name: 'plan_type', type: 'varchar', length: 50 })
  planType: string;

  @Column({ name: 'plan_number', type: 'varchar', length: 50 })
  planNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  area: number;

  @Column({ type: 'enum', enum: MojonType })
  mojonType: MojonType;

  @Column({ name: 'plan_complies', type: 'boolean' })
  planComplies: boolean;

  @Column({ name: 'respects_boundary', type: 'boolean' })
  respectsBoundary: boolean;

  @Column({ name: 'anchorage_mojones', type: 'varchar', length: 100 })
  anchorageMojones: string;

  // — Sección 3: topografía y cercas —
  @Column({ type: 'varchar', length: 50 })
  topography: string;

  @Column({ name: 'topography_other', type: 'varchar', length: 100, nullable: true })
  topographyOther?: string;

  @Column('simple-array', { name: 'fence_types', nullable: true })
  fenceTypes?: string[];

  @Column({ name: 'fences_invade_public', type: 'boolean' })
  fencesInvadePublic: boolean;

  // — Sección 4: acceso vial —
  @Column({ name: 'road_has_public_access', type: 'boolean' })
  roadHasPublicAccess: boolean;

  @Column({ name: 'road_description', type: 'text', nullable: true })
  roadDescription?: string;

  @Column({ name: 'road_limitations', type: 'text', nullable: true })
  roadLimitations?: string;

  @Column({ name: 'road_matches_plan', type: 'boolean' })
  roadMatchesPlan: boolean;

  @Column({
    name: 'right_of_way_width',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  rightOfWayWidth?: string;

  /** Relación muchos-a-uno con Concession */
  @ManyToOne(() => Concession, concession => concession.parcels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'concession_id' })
  concession: Concession;
}
