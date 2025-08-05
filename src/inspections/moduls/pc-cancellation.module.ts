import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcCancellation } from '../Entities/pcCancellation.entity';
import { PcCancellationService } from '../Services/pc-cancellation.service';
import { PcCancellationController } from '../Controllers/pc-cancellation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PcCancellation])],
  providers: [PcCancellationService],
  controllers: [PcCancellationController],
})
export class PcCancellationModule {}
