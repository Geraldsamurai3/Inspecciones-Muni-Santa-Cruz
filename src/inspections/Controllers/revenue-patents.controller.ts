// src/revenue-patents/revenue-patents.controller.ts
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
import { RevenuePatentsService } from '../Services/revenue-patents.service';
import { CreateRevenuePatentDto } from '../DTO/create-revenue-patent.dto';
import { UpdateRevenuePatentDto } from '../DTO/update-revenue-patent.dto';


@Controller('revenue-patents')
export class RevenuePatentsController {
  constructor(private readonly service: RevenuePatentsService) {}

  @Post()
  create(@Body() dto: CreateRevenuePatentDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRevenuePatentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
