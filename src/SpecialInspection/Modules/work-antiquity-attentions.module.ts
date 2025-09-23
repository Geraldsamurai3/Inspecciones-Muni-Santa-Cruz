// src/work-antiquity-attentions/work-antiquity-attentions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkAntiquityAttention } from '../Entities/work-antiquity-attention.entity';
import { WorkAntiquityAttentionsController } from '../Controllers/work-antiquity-attentions.controller';
import { WorkAntiquityAttentionsService } from '../Services/work-antiquity-attentions.service';


@Module({
  imports: [TypeOrmModule.forFeature([WorkAntiquityAttention])],
  controllers: [WorkAntiquityAttentionsController],
  providers: [WorkAntiquityAttentionsService],
  exports: [WorkAntiquityAttentionsService],
})
export class WorkAntiquityAttentionsModule {}
