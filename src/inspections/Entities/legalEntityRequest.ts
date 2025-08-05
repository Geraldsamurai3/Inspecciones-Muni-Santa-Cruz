import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('legal_entity_requests')
export class LegalEntityRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'legal_name', type: 'varchar', length: 150 })
  legalName: string;

  @Column({ name: 'legal_id', type: 'varchar', length: 20 })
  legalId: string;
}
