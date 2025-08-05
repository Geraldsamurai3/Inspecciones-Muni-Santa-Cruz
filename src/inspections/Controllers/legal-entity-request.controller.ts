import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { LegalEntityRequestService } from '../Services/legal-entity-request.service';
import { CreateLegalEntityRequestDto } from '../DTO/create-legal-entity-request.dto';
import { UpdateLegalEntityRequestDto } from '../DTO/update-legal-entity-request.dto';
import { LegalEntityRequest } from '../Entities/legalEntityRequest';

@Controller('legal-entity-requests')
export class LegalEntityRequestController {
  constructor(private readonly service: LegalEntityRequestService) {}

  @Post()
  create(@Body() dto: CreateLegalEntityRequestDto): Promise<LegalEntityRequest> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<LegalEntityRequest[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<LegalEntityRequest> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateLegalEntityRequestDto,
  ): Promise<LegalEntityRequest> {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(+id);
  }
}
