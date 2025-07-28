import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ default: 'inspector' })
  role: string;   

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
