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
import { InspectionStatus } from '../Enums/inspection-status.enum';
import { CreateCollectionDto } from './create-collection.dto';
import { CreateRevenuePatentDto } from './create-revenue-patent.dto';
import { CreateWorkClosureDto } from './create-work-closure.dto';
import { CreatePlatformAndServiceDto } from './create-platform-and-service.dto';

/** ===== Helpers locales para transformar ===== */
function parseToDateString(value: any): string | undefined {
  if (value == null || value === '') return undefined;
  
  const s = String(value).trim();
  
  // Si viene en formato ISO (del frontend): "2025-09-09T00:00:00.000Z"
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  if (isoMatch) {
    const [, yyyy, MM, dd] = isoMatch;
    return `${yyyy}-${MM}-${dd}`;
  }
  
  // dd-mm-yyyy -> yyyy-mm-dd
  const dmyMatch = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyMatch) {
    const [, dd, MM, yyyy] = dmyMatch;
    return `${yyyy}-${MM}-${dd}`;
  }
  
  // yyyy-mm-dd (ya está en el formato correcto)
  const ymdMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    return ymdMatch[0];
  }
  
  // Fallback: intentar parsear como fecha y extraer componentes
  const date = new Date(s);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return undefined;
}

function mapApplicantToEnum(v: any): ApplicantType | undefined {
  if (!v) return ApplicantType.ANONYMOUS;
  const s = String(v).normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
  if (s.includes('FISICA')) return ApplicantType.INDIVIDUAL;
  if (s.includes('JURID')) return ApplicantType.COMPANY;
  if (s.includes('ANON')) return ApplicantType.ANONYMOUS;
  // Fallback to anonymous to avoid validation failures when frontend sends
  // unexpected variants (e.g. missing accents or slightly different casing).
  return ApplicantType.ANONYMOUS;
}

/** ===== DTO principal ===== */
export class CreateInspectionDto {
  // Accept a variety of date formats from the frontend and convert to YYYY-MM-DD string
  @Transform(({ value }) => parseToDateString(value))
  @IsOptional()
  @IsString()
  inspectionDate?: string;

  // Ensure procedureNumber is treated as a string even if the frontend sends a number
  @Transform(({ value }) => {
    if (value == null) return undefined;
    const s = String(value).trim();
    return s === '' ? undefined : s;
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  procedureNumber?: string;

 @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(id => parseInt(id, 10));
    return [];
  })
  inspectorIds?: number[];


  @IsOptional()
  @IsString()
  dependency?: string;

  
  // Allow frontend strings like "Persona Fisica" / "PERSONA FISICA" etc. and map them
  @Transform(({ value }) => mapApplicantToEnum(value))
  @IsEnum(ApplicantType)
  @IsOptional()
  applicantType?: ApplicantType;


//Newly added field for inspection status
@IsOptional()
@IsEnum(InspectionStatus)
status?: InspectionStatus;



  @ValidateNested()
  @Type(() => CreateConstructionDto)
  @IsOptional()
  construction?: CreateConstructionDto;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  @IsOptional()
  location?: CreateLocationDto;

  // ===== Bloques opcionales (dependen del flujo seleccionado) =====

  // Si usas este "construction" como contenedor general, déjalo opcional:
 

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
  @IsOptional()
  individualRequest?: CreateIndividualRequestDto;

  @ValidateIf(o => o.applicantType === ApplicantType.COMPANY)
  @ValidateNested()
  @Type(() => CreateLegalEntityRequestDto) 
  @IsOptional()
  legalEntityRequest?: CreateLegalEntityRequestDto;

  // ZMT
  @ValidateNested()
  @Type(() => CreateConcessionDto)
  @IsOptional()
  concession?: CreateConcessionDto

  @ValidateNested({ each: true })
  @Type(() => CreateConcessionParcelDto)
  @IsOptional()
  concessionParcels?: CreateConcessionParcelDto[];


@ValidateNested()
  @Type(() => CreateCollectionDto)
  @IsOptional()
  collection?: CreateCollectionDto;

@ValidateNested()
  @Type(() => CreateRevenuePatentDto)
  @IsOptional()
  revenuePatent?: CreateRevenuePatentDto;

  @ValidateNested()
  @Type(() => CreateWorkClosureDto)
  @IsOptional()
  workClosure?: CreateWorkClosureDto;

  @ValidateNested()
  @Type(() => CreatePlatformAndServiceDto)
  @IsOptional()
  platformAndService?: CreatePlatformAndServiceDto;
}
