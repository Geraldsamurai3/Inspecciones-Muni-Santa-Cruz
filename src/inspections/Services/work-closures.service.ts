// src/work-closures/work-closures.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkClosure } from '../Entities/work-closure.entity';
import { CreateWorkClosureDto } from '../DTO/create-work-closure.dto';
import { UpdateWorkClosureDto } from '../DTO/update-work-closure.dto';


@Injectable()
export class WorkClosuresService {
  constructor(
    @InjectRepository(WorkClosure)
    private readonly repo: Repository<WorkClosure>,
  ) {}

  async create(dto: CreateWorkClosureDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`WorkClosure ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateWorkClosureDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`WorkClosure ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
