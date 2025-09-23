// src/closure-inspections/dto/create-closure-inspection-visit.dto.ts
import { IsInt, Min, IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClosureInspectionVisitDto {
  @IsInt() @Min(1)
  sequence: number;

  @IsDateString()
  visitDate: string; // ISO 8601

  @IsOptional() @IsString() @MaxLength(200)
  note?: string;
}
