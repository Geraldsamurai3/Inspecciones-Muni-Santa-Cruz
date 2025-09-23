// src/work-antiquity-attentions/work-antiquity-attentions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkAntiquityAttention } from '../Entities/work-antiquity-attention.entity';
import { CreateWorkAntiquityAttentionDto } from '../DTO/create-work-antiquity-attention.dto';
import { UpdateWorkAntiquityAttentionDto } from '../DTO/update-work-antiquity-attention.dto';


@Injectable()
export class WorkAntiquityAttentionsService {
  constructor(
    @InjectRepository(WorkAntiquityAttention)
    private readonly repo: Repository<WorkAntiquityAttention>,
  ) {}

  async create(dto: CreateWorkAntiquityAttentionDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Minimal list ordered by visitDate DESC
  async findAll() {
    return this.repo.find({ order: { visitDate: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`WorkAntiquityAttention ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateWorkAntiquityAttentionDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`WorkAntiquityAttention ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
