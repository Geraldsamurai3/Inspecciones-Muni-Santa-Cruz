import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('antiquities')
export class Antiquity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'property_number', type: 'varchar', length: 50 })
  propertyNumber: string;

  @Column({ name: 'estimated_antiquity', type: 'varchar', length: 100 })
  estimatedAntiquity: string;

  @Column('simple-array', { nullable: true })
  photos: string[]; // file names or URLs
}
