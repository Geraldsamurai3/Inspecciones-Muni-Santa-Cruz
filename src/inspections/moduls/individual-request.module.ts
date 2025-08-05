// individual-request.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualRequest } from '../Entities/individual-request.entity';
import { IndividualRequestService } from '../Services/individual-request.service';
import { IndividualRequestController } from '../Controllers/individual-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IndividualRequest])],
  providers: [IndividualRequestService],
  controllers: [IndividualRequestController],
})
export class IndividualRequestModule {}
