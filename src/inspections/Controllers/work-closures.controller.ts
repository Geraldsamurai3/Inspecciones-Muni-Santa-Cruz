// src/work-closures/work-closures.controller.ts
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
import { WorkClosuresService } from '../Services/work-closures.service';
import { CreateWorkClosureDto } from '../DTO/create-work-closure.dto';
import { UpdateWorkClosureDto } from '../DTO/update-work-closure.dto';


@Controller('work-closures')
export class WorkClosuresController {
  constructor(private readonly service: WorkClosuresService) {}

  @Post()
  create(@Body() dto: CreateWorkClosureDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkClosureDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
