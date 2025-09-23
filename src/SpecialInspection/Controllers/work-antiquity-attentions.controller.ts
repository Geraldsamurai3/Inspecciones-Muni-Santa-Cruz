// src/work-antiquity-attentions/work-antiquity-attentions.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { WorkAntiquityAttentionsService } from '../Services/work-antiquity-attentions.service';
import { CreateWorkAntiquityAttentionDto } from '../DTO/create-work-antiquity-attention.dto';
import { UpdateWorkAntiquityAttentionDto } from '../DTO/update-work-antiquity-attention.dto';


@Controller('work-antiquity-attentions')
export class WorkAntiquityAttentionsController {
  constructor(private readonly service: WorkAntiquityAttentionsService) {}

  @Post()
  create(@Body() dto: CreateWorkAntiquityAttentionDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateWorkAntiquityAttentionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
