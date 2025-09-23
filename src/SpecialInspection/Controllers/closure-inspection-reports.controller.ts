// src/closure-inspections/closure-inspection-reports.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ClosureInspectionReportsService } from '../Services/closure-inspection-reports.service';
import { CreateClosureInspectionReportDto } from '../DTO/create-closure-inspection-report.dto';
import { UpdateClosureInspectionReportDto } from '../DTO/update-closure-inspection-report.dto';


@Controller('closure-inspection-reports')
export class ClosureInspectionReportsController {
  constructor(private readonly service: ClosureInspectionReportsService) {}

  @Post()
  create(@Body() dto: CreateClosureInspectionReportDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateClosureInspectionReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
