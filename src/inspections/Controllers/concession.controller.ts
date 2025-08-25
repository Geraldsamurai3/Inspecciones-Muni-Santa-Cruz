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
import { ConcessionService } from '../Services/concession.service';
import { CreateConcessionDto } from '../DTO/create-concession.dto';
import { UpdateConcessionDto } from '../DTO/update-concession.dto';

@Controller('concessions')
export class ConcessionController {
  constructor(private readonly svc: ConcessionService) {}

  @Post() create(@Body() dto: CreateConcessionDto) {
    return this.svc.create(dto);
  }

  @Get() findAll() {
    return this.svc.findAll();
  }

  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConcessionDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
