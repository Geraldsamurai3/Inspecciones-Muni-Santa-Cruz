import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pc_cancellations')
export class PcCancellation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contract_number', type: 'varchar', length: 50 })
  contractNumber: string;

  @Column({ name: 'pc_number', type: 'varchar', length: 50 })
  pcNumber: string;

  @Column({ name: 'was_built', type: 'boolean' })
  wasBuilt: boolean;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations: string;

  @Column('simple-array', { nullable: true })
  photos: string[];
}
