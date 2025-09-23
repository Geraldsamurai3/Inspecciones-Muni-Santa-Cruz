// src/property-xxx-verifications/property-xxx-verifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyXxxVerificationsController } from '../Controllers/property-xxx-verifications.controller';
import { PropertyXxxVerificationsService } from '../Services/property-xxx-verifications.service';
import { PropertyXxxVerification } from '../Entities/property-xxx-verification.entity';


@Module({
  imports: [TypeOrmModule.forFeature([PropertyXxxVerification])],
  controllers: [PropertyXxxVerificationsController],
  providers: [PropertyXxxVerificationsService],
  exports: [PropertyXxxVerificationsService],
})
export class PropertyXxxVerificationsModule {}
