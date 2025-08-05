import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ConstructionService } from '../Services/construction.service';
import { CreateConstructionDto } from '../DTO/create-construction.dto';
import { UpdateConstructionDto } from '../DTO/update-construction.dto';
import { Construction } from '../Entities/construction.entity';

@Controller('constructions')
export class ConstructionController {
  constructor(private readonly service: ConstructionService) {}

  @Post()
  create(@Body() dto: CreateConstructionDto): Promise<Construction> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Construction[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Construction> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateConstructionDto,
  ): Promise<Construction> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(+id);
  }
}
