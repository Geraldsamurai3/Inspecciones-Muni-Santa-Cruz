import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { IndividualRequestService } from '../Services/individual-request.service';
import { IndividualRequest } from '../Entities/individual-request.entity';
import { CreateIndividualRequestDto } from '../DTO/create-individual-request.dto';
import { UpdateIndividualRequestDto } from '../DTO/update-individual-request.dt';

@Controller('individual-requests')
export class IndividualRequestController {
  constructor(private readonly service: IndividualRequestService) {}

  @Post()
  async create(@Body() dto: CreateIndividualRequestDto): Promise<IndividualRequest> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(): Promise<IndividualRequest[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IndividualRequest> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateIndividualRequestDto,
  ): Promise<IndividualRequest> {
    return this.service.update(+id, dto);
  }


  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.delete(id);
  }
}
