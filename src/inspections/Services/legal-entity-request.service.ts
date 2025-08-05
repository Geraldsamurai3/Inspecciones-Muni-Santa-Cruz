import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalEntityRequest } from '../Entities/legalEntityRequest';
import { CreateLegalEntityRequestDto } from '../DTO/create-legal-entity-request.dto';
import { UpdateLegalEntityRequestDto } from '../DTO/update-legal-entity-request.dto';

@Injectable()
export class LegalEntityRequestService {
  constructor(
    @InjectRepository(LegalEntityRequest)
    private readonly repo: Repository<LegalEntityRequest>,
  ) {}

  async create(dto: CreateLegalEntityRequestDto): Promise<LegalEntityRequest> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<LegalEntityRequest[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<LegalEntityRequest> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`LegalEntityRequest with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateLegalEntityRequestDto): Promise<LegalEntityRequest> {
    const entity = await this.findOne(id);
    const updated = Object.assign(entity, dto);
    return this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`LegalEntityRequest with ID ${id} not found`);
    }
  }
}
