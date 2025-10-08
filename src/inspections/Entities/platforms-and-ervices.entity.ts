import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'platforms_and_services' })
export class PlatformAndService {
  @PrimaryGeneratedColumn()
  id: number; // numeric auto-increment

  @Column({ type: 'varchar', length: 100 })
  procedureNumber: string; // número trámite

  @Column({ type: 'text', nullable: true })
  observation?: string; // observación
}
