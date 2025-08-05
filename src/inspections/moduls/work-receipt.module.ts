import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkReceipt } from '../Entities/workReceipt.entity';
import { WorkReceiptService } from '../Services/work-receipt.service';
import { WorkReceiptController } from '../Controllers/work-receipt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkReceipt])],
  controllers: [WorkReceiptController],
  providers: [WorkReceiptService],
})
export class WorkReceiptModule {}
