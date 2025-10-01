// src/revenue-patents/revenue-patents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenuePatent } from '../Entities/revenue-patent.entity';
import { RevenuePatentsService } from '../Services/revenue-patents.service';
import { RevenuePatentsController } from '../Controllers/revenue-patents.controller';


@Module({
  imports: [TypeOrmModule.forFeature([RevenuePatent])],
  controllers: [RevenuePatentsController],
  providers: [RevenuePatentsService],
  exports: [RevenuePatentsService],
})
export class RevenuePatentsModule {}
