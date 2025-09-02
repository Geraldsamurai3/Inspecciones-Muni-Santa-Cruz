// src/inspections/inspections.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionService } from './inspections.service';
import { InspectionController } from './inspections.controller';
import { IndividualRequest } from './Entities/individual-request.entity';
import { LegalEntityRequest } from './Entities/legalEntityRequest';
import { Construction } from './Entities/construction.entity';
import { PcCancellation } from './Entities/pcCancellation.entity';
import { WorkReceipt } from './Entities/workReceipt.entity';
import { GeneralInspection } from './Entities/generalInspection.entity';
import { TaxProcedure } from './Entities/taxProcedure.entity';
import { MayorOffice } from './Entities/mayor-office.entity';
import { Antiquity } from './Entities/antiquity.entity';
import { Location } from './Entities/location.entity';
import { LandUse } from './Entities/landUse.entity';
import { Inspection } from './Entities/inspections.entity';
import { Concession } from './Entities/zmt.consession.enity';
import { ConcessionParcel } from './Entities/zmt.consession.parcels.entity';
import { User } from 'src/users/entities/user.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Nueva importación

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      IndividualRequest,
      LegalEntityRequest,
      Construction,
      PcCancellation,
      WorkReceipt,
      GeneralInspection,
      TaxProcedure,
      MayorOffice,
      Antiquity,
      Location,
      LandUse,
      Concession,
      ConcessionParcel,
      User,
    ]),
    CloudinaryModule, 
  ],
  controllers: [InspectionController],
  providers: [InspectionService],
  exports: [InspectionService]
})
export class InspectionsModule {}