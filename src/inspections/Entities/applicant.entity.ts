import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApplicantType } from "../Enums/applicant.enum";

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ApplicantType })
  applicantType: ApplicantType;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  personalId: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  companyId: string;
}
