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
import { ConcessionParcelService } from '../Services/concession-parcel.service';
import { CreateConcessionParcelDto } from '../DTO/create-concession-parcel.dto';
import { UpdateConcessionParcelDto } from '../DTO/update-concession-parcel.dto';

@Controller('concession-parcels')
export class ConcessionParcelController {
  constructor(private readonly svc: ConcessionParcelService) {}

  @Post() create(@Body() dto: CreateConcessionParcelDto) {
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
    @Body() dto: UpdateConcessionParcelDto,
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
