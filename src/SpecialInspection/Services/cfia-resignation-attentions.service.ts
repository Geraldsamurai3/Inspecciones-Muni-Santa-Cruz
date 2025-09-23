// src/cfia-resignations/cfia-resignation-attentions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CfiaResignationAttention } from '../Entities/cfia-resignation-attention.entity';
import { CreateCfiaResignationAttentionDto } from '../DTO/create-cfia-resignation-attention.dto';
import { UpdateCfiaResignationAttentionDto } from '../DTO/update-cfia-resignation-attention.dto';


@Injectable()
export class CfiaResignationAttentionsService {
  constructor(
    @InjectRepository(CfiaResignationAttention)
    private readonly repo: Repository<CfiaResignationAttention>,
  ) {}

  async create(dto: CreateCfiaResignationAttentionDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Minimal list ordered by visitDate DESC
  async findAll() {
    return this.repo.find({ order: { visitDate: 'DESC' } });
  }

  async findOne(id:number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`CfiaResignationAttention ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateCfiaResignationAttentionDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`CfiaResignationAttention ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
