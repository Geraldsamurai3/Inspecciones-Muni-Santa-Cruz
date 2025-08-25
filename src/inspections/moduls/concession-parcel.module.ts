// src/inspections/concession-parcel/concession-parcel.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConcessionParcel } from '../Entities/zmt.consession.parcels.entity';
import { ConcessionParcelService } from '../Services/concession-parcel.service';
import { ConcessionParcelController } from '../Controllers/concession-parcel.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConcessionParcel]),
  ],
  providers: [ConcessionParcelService],
  controllers: [ConcessionParcelController],
  exports: [ConcessionParcelService],
})
export class ConcessionParcelModule {}
