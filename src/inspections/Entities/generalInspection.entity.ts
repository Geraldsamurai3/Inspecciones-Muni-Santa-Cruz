import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('general_inspections')
export class GeneralInspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'property_number', type: 'varchar', length: 50 })
  propertyNumber: string;

  @Column({ name: 'observations', type: 'text' })
  observations: string;

  @Column('simple-array', { nullable: true })
  photos: string[];
}
