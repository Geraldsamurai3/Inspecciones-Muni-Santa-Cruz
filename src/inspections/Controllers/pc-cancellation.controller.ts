import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { PcCancellationService } from '../Services/pc-cancellation.service';
import { CreatePcCancellationDto } from '../DTO/create-pc-cancellation.dto';
import { UpdatePcCancellationDto } from '../DTO/update-pc-cancellation.dto';
import { PcCancellation } from '../Entities/pcCancellation.entity';

@Controller('pc-cancellations')
export class PcCancellationController {
  constructor(private readonly service: PcCancellationService) {}

  @Post()
  create(@Body() dto: CreatePcCancellationDto): Promise<PcCancellation> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<PcCancellation[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PcCancellation> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePcCancellationDto,
  ): Promise<PcCancellation> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
