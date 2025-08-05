import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { MayorOfficeService } from '../Services/mayor-office.service';
import { CreateMayorOfficeDto } from '../DTO/create-mayor-office.dto';
import { UpdateMayorOfficeDto } from '../DTO/update-mayor-office.dto';
import { MayorOffice } from '../Entities/mayor-office.entity';

@Controller('mayor-offices')
export class MayorOfficeController {
  constructor(private readonly service: MayorOfficeService) {}

  @Post()
  create(@Body() dto: CreateMayorOfficeDto): Promise<MayorOffice> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<MayorOffice[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<MayorOffice> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateMayorOfficeDto,
  ): Promise<MayorOffice> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(+id);
  }
}
