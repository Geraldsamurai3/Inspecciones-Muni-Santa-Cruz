import { TypeOrmModule } from "@nestjs/typeorm";
import { MayorOffice } from "../Entities/mayor-office.entity";
import { MayorOfficeController } from "../Controllers/mayor-office.controller";
import { MayorOfficeService } from "../Services/mayor-office.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([MayorOffice])],
  controllers: [MayorOfficeController],
  providers: [MayorOfficeService],
})
export class MayorOfficeModule {}
