// src/cfia-resignations/cfia-resignation-attentions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CfiaResignationAttention } from '../Entities/cfia-resignation-attention.entity';
import { CfiaResignationAttentionsController } from '../Controllers/cfia-resignation-attentions.controller';
import { CfiaResignationAttentionsService } from '../Services/cfia-resignation-attentions.service';


@Module({
  imports: [TypeOrmModule.forFeature([CfiaResignationAttention])],
  controllers: [CfiaResignationAttentionsController],
  providers: [CfiaResignationAttentionsService],
  exports: [CfiaResignationAttentionsService],
})
export class CfiaResignationAttentionsModule {}
