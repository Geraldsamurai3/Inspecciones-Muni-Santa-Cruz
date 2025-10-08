// src/platforms-and-services/platforms-and-services.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PlatformsAndServicesService } from '../Services/platforms-and-services.service';
import { CreatePlatformAndServiceDto } from '../DTO/create-platform-and-service.dto';
import { UpdatePlatformAndServiceDto } from '../DTO/update-platform-and-service.dto';


@Controller('platforms-and-services')
export class PlatformsAndServicesController {
  constructor(private readonly service: PlatformsAndServicesService) {}

  @Post()
  create(@Body() dto: CreatePlatformAndServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlatformAndServiceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
