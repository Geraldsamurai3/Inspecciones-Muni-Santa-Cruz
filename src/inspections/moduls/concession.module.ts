// src/inspections/concession/concession.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Concession } from '../Entities/zmt.consession.enity';
import { ConcessionService } from '../Services/concession.service';
import { ConcessionController } from '../Controllers/concession.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Concession]),
  ],
  providers: [ConcessionService],
  controllers: [ConcessionController],
  exports: [ConcessionService],
})
export class ConcessionModule {}
