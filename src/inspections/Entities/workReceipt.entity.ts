import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { WorkState } from '../Enums/WorkState.enum';

@Entity('work_receipts')
export class WorkReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'visit_date', type: 'date' })
  visitDate: Date;

  @Column({ type: 'enum', enum: WorkState })
  state: WorkState;

  @Column('simple-array', { nullable: true })
  photos: string[];
}
