import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('land_uses')
export class LandUse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'requested_use', type: 'varchar', length: 255 })
  requestedUse: string;

  @Column({ name: 'matches_location', type: 'boolean' })
  matchesLocation: boolean;

  @Column({ name: 'is_recommended', type: 'boolean' })
  isRecommended: boolean;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations: string;}
