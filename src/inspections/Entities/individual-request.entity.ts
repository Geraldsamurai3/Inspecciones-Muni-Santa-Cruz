import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('individual_requests')
export class IndividualRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name_1', type: 'varchar', length: 100 })
  lastName1: string;

  @Column({ name: 'last_name_2', type: 'varchar', length: 100, nullable: true })
  lastName2: string;

  @Column({ name: 'physical_id', type: 'varchar', length: 20 })
  physicalId: string;
}