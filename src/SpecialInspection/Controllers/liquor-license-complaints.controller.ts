// src/special-inspections/liquor-license-complaints.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { LiquorLicenseComplaintsService } from '../Services/liquor-license-complaints.service';
import { CreateLiquorLicenseComplaintDto } from '../DTO/create-liquor-license-complaint.dto';
import { UpdateLiquorLicenseComplaintDto } from '../DTO/update-liquor-license-complaint.dto';

@Controller('liquor-license-complaints')
export class LiquorLicenseComplaintsController {
  constructor(
    private readonly service: LiquorLicenseComplaintsService,
  ) {}

  @Post()
  create(@Body() dto: CreateLiquorLicenseComplaintDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('canton') canton?: string,
    @Query('district') district?: string,
  ) {
    return this.service.findAll({ q, canton, district });
  }

  @Get(':id')
  findOne(@Param('id') id:number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateLiquorLicenseComplaintDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
