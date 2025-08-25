// src/inspections/dto/create-inspection.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { Inspector } from '../Enums/inspector.enum';
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
import { CreateWorkReceiptDto } from './create-work-receipts.dto';
import { CreateLocationDto } from './create-location.dto';
import { CreateConcessionDto } from './create-concession.dto';
import { CreateConcessionParcelDto } from './create-concession-parcel.dto';

export class CreateInspectionDto {
  @IsDateString()
  inspectionDate: Date;

  @IsString()
  @IsNotEmpty()
  procedureNumber: string;

  @IsArray()
  @IsEnum(Inspector, { each: true })
  performedBy: Inspector[];

  @IsEnum(ApplicantType)
  applicantType: ApplicantType;

  @ValidateNested()
  @Type(() => CreateConstructionDto)
  construction: CreateConstructionDto;

  @ValidateNested()
  @Type(() => CreatePcCancellationDto)
  pcCancellation: CreatePcCancellationDto;

  @ValidateNested()
  @Type(() => CreateWorkReceiptDto)
  workReceipt: CreateWorkReceiptDto;

  @ValidateNested()
  @Type(() => CreateGeneralInspectionDto)
  generalInspection: CreateGeneralInspectionDto;

  @ValidateNested()
  @Type(() => CreateTaxProcedureDto)
  taxProcedure: CreateTaxProcedureDto;

  @ValidateNested()
  @Type(() => CreateMayorOfficeDto)
  mayorOffice: CreateMayorOfficeDto;

  @ValidateNested()
  @Type(() => CreateAntiquityDto)
  antiquity: CreateAntiquityDto;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location: CreateLocationDto;

  @ValidateNested()
  @Type(() => CreateLandUseDto)
  landUse: CreateLandUseDto;

  
  @ValidateNested()
  @Type(() => CreateIndividualRequestDto)
  individualRequest: CreateIndividualRequestDto;


  @ValidateNested()
  @Type(() => CreateLegalEntityRequestDto)
  legalEntityRequest: CreateLegalEntityRequestDto;

  @ValidateNested()
  @Type(() => CreateConcessionDto)
  Concession: CreateConcessionDto

  @ValidateNested({ each: true })
  @Type(() => CreateConcessionParcelDto)
  ConcessionParcels: CreateConcessionParcelDto[];
}
