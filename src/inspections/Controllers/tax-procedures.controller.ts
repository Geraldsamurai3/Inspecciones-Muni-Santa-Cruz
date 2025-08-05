import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TaxProceduresService } from '../Services/tax-procedures.service';
import { CreateTaxProcedureDto } from '../DTO/create-tax-procedure.dto';
import { UpdateTaxProcedureDto } from '../DTO/update-tax-procedure.dto';

@Controller('tax-procedures')
export class TaxProceduresController {
  constructor(private readonly service: TaxProceduresService) {}

  @Post()
  create(@Body() dto: CreateTaxProcedureDto) {
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
    @Body() dto: UpdateTaxProcedureDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
