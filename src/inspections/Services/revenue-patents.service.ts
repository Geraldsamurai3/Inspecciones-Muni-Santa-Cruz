// src/revenue-patents/revenue-patents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenuePatent } from '../Entities/revenue-patent.entity';
import { CreateRevenuePatentDto } from '../DTO/create-revenue-patent.dto';
import { UpdateRevenuePatentDto } from '../DTO/update-revenue-patent.dto';


@Injectable()
export class RevenuePatentsService {
  constructor(
    @InjectRepository(RevenuePatent)
    private readonly repo: Repository<RevenuePatent>,
  ) {}

  async create(dto: CreateRevenuePatentDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`RevenuePatent ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateRevenuePatentDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`RevenuePatent ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
