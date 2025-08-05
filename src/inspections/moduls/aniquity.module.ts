import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Antiquity } from '../Entities/antiquity.entity';
import { AntiquityService } from '../Services/antiquity.service';
import { AntiquityController } from '../Controllers/aniquity.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Antiquity])],
  controllers: [AntiquityController],
  providers: [AntiquityService],
})
export class AntiquityModule {}
