// src/farm-inspection-requests/farm-inspection-requests.controller.ts
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
import { FarmInspectionRequestsService } from '../Services/farm-inspection-requests.service';
import { CreateFarmInspectionRequestDto } from '../DTO/create-farm-inspection-request.dto';
import { UpdateFarmInspectionRequestDto } from '../DTO/update-farm-inspection-request.dto';

@Controller('farm-inspection-requests')
export class FarmInspectionRequestsController {
  constructor(private readonly service: FarmInspectionRequestsService) {}

  @Post()

  create(@Body() dto: CreateFarmInspectionRequestDto) {
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
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFarmInspectionRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
