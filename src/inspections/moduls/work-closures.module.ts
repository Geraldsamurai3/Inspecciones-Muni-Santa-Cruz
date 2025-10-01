// src/work-closures/work-closures.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkClosuresController } from '../Controllers/work-closures.controller';
import { WorkClosuresService } from '../Services/work-closures.service';
import { WorkClosure } from '../Entities/work-closure.entity';


@Module({
  imports: [TypeOrmModule.forFeature([WorkClosure])],
  controllers: [WorkClosuresController],
  providers: [WorkClosuresService],
  exports: [WorkClosuresService],
})
export class WorkClosuresModule {}
