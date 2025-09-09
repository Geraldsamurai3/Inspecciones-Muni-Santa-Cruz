
import { Inspection } from 'src/inspections/Entities/inspections.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;
  
  @Column({ length: 100, nullable: true })
  secondLastName?: string;

  @Column({ length: 20, unique: true })
  cedula: string

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ default: 'inspector' })
  role: string;   

  @Column({ default: false })
  isBlocked: boolean;


  @Column({ nullable: true })   
  resetToken?: string;

  @Column({ type: 'bigint', nullable: true })
  resetTokenExpires?: number;


  @CreateDateColumn()
  createdAt: Date;

   @ManyToMany(() => Inspection, (inspection) => inspection.inspectors)
  inspections: Inspection[];

  // Método para devolver datos seguros sin campos sensibles
  toSafeObject() {
    const { passwordHash, resetToken, resetTokenExpires, isBlocked, ...safeData } = this;
    return safeData;
  }
}
