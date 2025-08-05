import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CreateWorkReceiptDto } from '../DTO/create-work-receipts.dto';
import { UpdateWorkReceiptDto } from '../DTO/uptade-work-receipts.dto';
import { WorkReceiptService } from '../Services/work-receipt.service';

@Controller('work-receipts')
export class WorkReceiptController {
  constructor(private readonly service: WorkReceiptService) {}

  @Post()
  create(@Body() dto: CreateWorkReceiptDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWorkReceiptDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
