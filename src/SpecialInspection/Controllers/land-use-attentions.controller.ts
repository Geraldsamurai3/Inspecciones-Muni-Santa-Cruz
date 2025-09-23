// src/land-use-attentions/land-use-attentions.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LandUseAttentionsService } from '../Services/land-use-attentions.service';
import { CreateLandUseAttentionDto } from '../DTO/create-land-use-attention.dto';
import { UpdateLandUseAttentionDto } from '../DTO/update-land-use-attention.dto';


@Controller('land-use-attentions')
export class LandUseAttentionsController {
  constructor(private readonly service: LandUseAttentionsService) {}

  @Post()
  create(@Body() dto: CreateLandUseAttentionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id:number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateLandUseAttentionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
