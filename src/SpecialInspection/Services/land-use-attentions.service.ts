// src/land-use-attentions/land-use-attentions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandUseAttention } from '../Entities/land-use-attention.entity';
import { CreateLandUseAttentionDto } from '../DTO/create-land-use-attention.dto';
import { UpdateLandUseAttentionDto } from '../DTO/update-land-use-attention.dto';


@Injectable()
export class LandUseAttentionsService {
  constructor(
    @InjectRepository(LandUseAttention)
    private readonly repo: Repository<LandUseAttention>,
  ) {}

  async create(dto: CreateLandUseAttentionDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Minimal list — ordered by visitDate DESC (most recent first)
  async findAll() {
    return this.repo.find({
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`LandUseAttention ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateLandUseAttentionDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`LandUseAttention ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
