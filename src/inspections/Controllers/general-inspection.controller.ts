import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { GeneralInspectionService } from '../Services/general-inspection.service';
import { CreateGeneralInspectionDto } from '../DTO/create-general-inspection.dto';
import { UpdateGeneralInspectionDto } from '../DTO/update-general-inspection.dto';

@Controller('general-inspections')
export class GeneralInspectionController {
  constructor(private readonly service: GeneralInspectionService) {}

  @Post()
  create(@Body() dto: CreateGeneralInspectionDto) {
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeneralInspectionDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
