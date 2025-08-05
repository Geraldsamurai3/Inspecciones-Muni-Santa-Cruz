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
import { AntiquityService } from '../Services/antiquity.service';
import { CreateAntiquityDto } from '../DTO/create-antiquity.dto';
import { UpdateAniquityDto } from '../DTO/update-antiquity.dto';

@Controller('antiquities')
export class AntiquityController {
  constructor(private readonly antiquityService: AntiquityService) {}

  @Post()
  create(@Body() dto: CreateAntiquityDto) {
    return this.antiquityService.create(dto);
  }

  @Get()
  findAll() {
    return this.antiquityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.antiquityService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAniquityDto,
  ) {
    return this.antiquityService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.antiquityService.remove(id);
  }
}
