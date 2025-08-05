import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralInspection } from '../Entities/generalInspection.entity';
import { GeneralInspectionService } from '../Services/general-inspection.service';
import { GeneralInspectionController } from '../Controllers/general-inspection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralInspection])],
  controllers: [GeneralInspectionController],
  providers: [GeneralInspectionService],
})
export class GeneralInspectionModule {}
