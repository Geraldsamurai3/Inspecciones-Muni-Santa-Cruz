import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { District } from "../Enums/district.enum";

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: District })
  district: District;

  @Column()
  exactAddress: string;
}