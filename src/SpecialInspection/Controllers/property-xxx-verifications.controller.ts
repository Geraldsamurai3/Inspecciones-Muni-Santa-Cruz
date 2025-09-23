// src/property-xxx-verifications/property-xxx-verifications.controller.ts
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
import { PropertyXxxVerificationsService } from '../Services/property-xxx-verifications.service';
import { CreatePropertyXxxVerificationDto } from '../DTO/create-property-xxx-verification.dto';
import { UpdatePropertyXxxVerificationDto } from '../DTO/update-property-xxx-verification.dto';


@Controller('property-xxx-verifications')
export class PropertyXxxVerificationsController {
  constructor(private readonly service: PropertyXxxVerificationsService) {}

  @Post()
  create(@Body() dto: CreatePropertyXxxVerificationDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdatePropertyXxxVerificationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
