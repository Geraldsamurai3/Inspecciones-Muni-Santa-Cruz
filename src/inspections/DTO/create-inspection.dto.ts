// src/inspections/dto/create-inspection.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { ApplicantType } from '../Enums/applicant.enum';

import { CreateIndividualRequestDto } from './create-individual-request.dto';
import { CreateLegalEntityRequestDto } from './create-legal-entity-request.dto';
import { CreateConstructionDto } from './create-construction.dto';
import { CreatePcCancellationDto } from './create-pc-cancellation.dto';
import { CreateGeneralInspectionDto } from './create-general-inspection.dto';
import { CreateTaxProcedureDto } from './create-tax-procedure.dto';
import { CreateMayorOfficeDto } from './create-mayor-office.dto';
import { CreateAntiquityDto } from './create-antiquity.dto';
import { CreateLandUseDto } from './create-land-use.dto';
import { CreateWorkReceiptDto } from './create-work-receipts.dto'; // verifica nombre de archivo (sing/plural)
import { CreateLocationDto } from './create-location.dto';
import { CreateConcessionDto } from './create-concession.dto';
import { CreateConcessionParcelDto } from './create-concession-parcel.dto';

/** ===== Helpers locales para transformar ===== */
function parseDMY(value: any): Date | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date) return value;

  const s = String(value).trim();
  // dd-mm-yyyy
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [, dd, MM, yyyy] = m;
    const d = new Date(`${yyyy}-${MM}-${dd}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  // fallback
  const d2 = new Date(s);
  return Number.isNaN(d2.getTime()) ? undefined : d2;
}

function mapApplicantToEnum(v: any): ApplicantType | undefined {
  if (!v) return ApplicantType.ANONYMOUS;
  const s = String(v).normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
  if (s.includes('FISICA')) return ApplicantType.INDIVIDUAL;
  if (s.includes('JURID')) return ApplicantType.COMPANY;
  if (s.includes('ANON')) return ApplicantType.ANONYMOUS;
  return undefined;
}

/** ===== DTO principal ===== */
export class CreateInspectionDto {
  @Transform(({ value }) => parseDMY(value))
  @IsDate()
  inspectionDate: Date;

  @IsString()
  @IsNotEmpty()
  procedureNumber: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  inspectorIds?: number[];

  @Transform(({ value }) => mapApplicantToEnum(value))
  @IsEnum(ApplicantType)
  applicantType: ApplicantType;

  // Ubicación (requerida)
  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;

  // ===== Bloques opcionales (dependen del flujo seleccionado) =====

  // Si usas este "construction" como contenedor general, déjalo opcional:
  @ValidateNested()
  @Type(() => CreateConstructionDto)
  @IsOptional()
  construction?: CreateConstructionDto;

  @ValidateNested()
  @Type(() => CreateLandUseDto)
  @IsOptional()
  landUse?: CreateLandUseDto;

  @ValidateNested()
  @Type(() => CreateAntiquityDto)
  @IsOptional()
  antiquity?: CreateAntiquityDto;

  @ValidateNested()
  @Type(() => CreatePcCancellationDto)
  @IsOptional()
  pcCancellation?: CreatePcCancellationDto;

  @ValidateNested()
  @Type(() => CreateGeneralInspectionDto)
  @IsOptional()
  generalInspection?: CreateGeneralInspectionDto;

  @ValidateNested()
  @Type(() => CreateWorkReceiptDto)
  @IsOptional()
  workReceipt?: CreateWorkReceiptDto;

  @ValidateNested()
  @Type(() => CreateTaxProcedureDto)
  @IsOptional()
  taxProcedure?: CreateTaxProcedureDto;

  @ValidateNested()
  @Type(() => CreateMayorOfficeDto)
  @IsOptional()
  mayorOffice?: CreateMayorOfficeDto;

  // Solicitante (uno u otro según applicantType)
  @ValidateIf(o => o.applicantType === ApplicantType.INDIVIDUAL)
  @ValidateNested()
  @Type(() => CreateIndividualRequestDto)
  individualRequest: CreateIndividualRequestDto;

  @ValidateIf(o => o.applicantType === ApplicantType.COMPANY)
  @ValidateNested()
  @Type(() => CreateLegalEntityRequestDto)
  legalEntityRequest: CreateLegalEntityRequestDto;

  // ZMT
  @ValidateNested()
  @Type(() => CreateConcessionDto)
  @IsOptional()
  concession?: CreateConcessionDto; // <-- camelCase

  @ValidateNested({ each: true })
  @Type(() => CreateConcessionParcelDto)
  @IsArray()
  @IsOptional()
  concessionParcels?: CreateConcessionParcelDto[];
}
