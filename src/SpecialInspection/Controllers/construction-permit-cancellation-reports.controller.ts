// src/construction-permit-cancellations/construction-permit-cancellation-reports.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ConstructionPermitCancellationReportsService } from '../Services/construction-permit-cancellation-reports.service';
import { CreateConstructionPermitCancellationReportDto } from '../DTO/create-construction-permit-cancellation-report.dto';
import { UpdateConstructionPermitCancellationReportDto } from '../DTO/update-construction-permit-cancellation-report.dto';


@Controller('construction-permit-cancellation-reports')
export class ConstructionPermitCancellationReportsController {
  constructor(private readonly service: ConstructionPermitCancellationReportsService) {}

  @Post()
  create(@Body() dto: CreateConstructionPermitCancellationReportDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateConstructionPermitCancellationReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
