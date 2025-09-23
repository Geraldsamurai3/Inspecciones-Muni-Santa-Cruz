// src/work-inspection-reports/work-inspection-reports.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { WorkInspectionReportsService } from '../Services/work-inspection-reports.service';
import { CreateWorkInspectionReportDto } from '../DTO/create-work-inspection-report.dto';
import { UpdateWorkInspectionReportDto } from '../DTO/update-work-inspection-report.dto';


@Controller('work-inspection-reports')
export class WorkInspectionReportsController {
  constructor(private readonly service: WorkInspectionReportsService) {}

  @Post()
  create(@Body() dto: CreateWorkInspectionReportDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkInspectionReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
