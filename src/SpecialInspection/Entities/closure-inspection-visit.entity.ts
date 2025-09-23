// src/closure-inspections/entities/closure-inspection-visit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ClosureInspectionReport } from './closure-inspection-report.entity';

@Entity({ name: 'closure_inspection_visits' })
export class ClosureInspectionVisit {
  @PrimaryGeneratedColumn()
  id: number ;

  @Column({ type: 'smallint', default: 1 })
  sequence: number;                // Visita No. (1, 2, 3, ...)

  @Column({ type: 'date' })
  visitDate: Date;                 // Fecha de la visita

  @Column({ type: 'varchar', length: 200, nullable: true })
  note?: string;                   // Nota opcional

  @ManyToOne(() => ClosureInspectionReport, (report) => report.visits, {
    onDelete: 'CASCADE',
  })
  report: ClosureInspectionReport;
}
