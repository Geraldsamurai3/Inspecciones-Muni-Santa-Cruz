import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('constructions')
export class Construction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  landUseType: string;

  @Column({ default: false })
  matchesLocation: boolean;

  @Column({ default: false })
  recommended: boolean;

  @Column({ nullable: true })
  observations: string;

  @Column({ nullable: true })
  propertyNumber: string;

  @Column({ nullable: true })
  estimatedAge: string;

  @Column("simple-array", { nullable: true })
  photos: string[];
}
