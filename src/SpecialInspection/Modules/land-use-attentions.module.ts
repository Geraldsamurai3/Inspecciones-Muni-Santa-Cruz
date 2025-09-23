// src/land-use-attentions/land-use-attentions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandUseAttentionsService } from '../Services/land-use-attentions.service';
import { LandUseAttentionsController } from '../Controllers/land-use-attentions.controller';
import { LandUseAttention } from '../Entities/land-use-attention.entity';


@Module({
  imports: [TypeOrmModule.forFeature([LandUseAttention])],
  controllers: [LandUseAttentionsController],
  providers: [LandUseAttentionsService],
  exports: [LandUseAttentionsService],
})
export class LandUseAttentionsModule {}
