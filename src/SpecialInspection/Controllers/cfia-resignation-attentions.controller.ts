// src/cfia-resignations/cfia-resignation-attentions.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { CreateCfiaResignationAttentionDto } from '../DTO/create-cfia-resignation-attention.dto';
import { UpdateCfiaResignationAttentionDto } from '../DTO/update-cfia-resignation-attention.dto';
import { CfiaResignationAttentionsService } from '../Services/cfia-resignation-attentions.service';


@Controller('cfia-resignation-attentions')
export class CfiaResignationAttentionsController {
  constructor(private readonly service: CfiaResignationAttentionsService) {}

  @Post()
  create(@Body() dto: CreateCfiaResignationAttentionDto) {
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
  update(@Param('id') id: number, @Body() dto: UpdateCfiaResignationAttentionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
