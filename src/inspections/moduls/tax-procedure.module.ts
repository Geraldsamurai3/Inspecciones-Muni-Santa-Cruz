import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxProceduresService } from '../Services/tax-procedures.service';
import { TaxProceduresController } from '../Controllers/tax-procedures.controller';
import { TaxProcedure } from '../Entities/taxProcedure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaxProcedure])],
  controllers: [TaxProceduresController],
  providers: [TaxProceduresService],
  exports: [TaxProceduresService], // Opcional: si querés usarlo desde otros módulos
})
export class TaxProceduresModule {}
