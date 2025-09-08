import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { InspectionService } from './inspections.service';
import { CreateInspectionDto } from './DTO/create-inspection.dto';
import { UpdateInspectionDto } from './DTO/update-inspection.dto';
import { UpdateStatusDto } from './DTO/update-status.dto';

@Controller('inspections')
export class InspectionController {
  constructor(private readonly service: InspectionService) {}

  @Post()
  create(@Body() dto: CreateInspectionDto) {
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

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspectionDto,
  ) {
    return this.service.update(id, dto);
  }


// NUEVO: PATCH genérico (parcial). Reusa la misma lógica de service.update
  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspectionDto,
  ) {
    return this.service.update(id, dto);
  }

  // NUEVO: PATCH específico SOLO para estado
  @Patch(':id/status')
  patchStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() { status }: UpdateStatusDto,
  ) {
    // Reutilizamos el mismo update del service para mantener una sola lógica
    return this.service.update(id, { status } as UpdateInspectionDto);
  }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
