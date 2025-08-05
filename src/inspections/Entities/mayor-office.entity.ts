import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('mayor_offices')
export class MayorOffice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  procedureType: string;

  @Column({ nullable: true })
  observations: string;

  @Column("simple-array", { nullable: true })
  photos: string[]; // rutas o nombres de los archivos subidos
}
