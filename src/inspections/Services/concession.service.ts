import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concession } from '../Entities/zmt.consession.enity';
import { CreateConcessionDto } from '../DTO/create-concession.dto';
import { UpdateConcessionDto } from '../DTO/update-concession.dto';

@Injectable()
export class ConcessionService {
  constructor(
    @InjectRepository(Concession)
    private readonly repo: Repository<Concession>,
  ) {}

  create(dto: CreateConcessionDto): Promise<Concession> {
    const ent = this.repo.create(dto);
    return this.repo.save(ent);
  }

  findAll(): Promise<Concession[]> {
    return this.repo.find({ relations: ['parcels', 'inspection'] });
  }

  async findOne(id: number): Promise<Concession> {
    const ent = await this.repo.findOne({ where: { id }, relations: ['parcels', 'inspection'] });
    if (!ent) throw new NotFoundException(`Concession ${id} not found`);
    return ent;
  }

  async update(id: number, dto: UpdateConcessionDto): Promise<Concession> {
    const ent = await this.findOne(id);
    Object.assign(ent, dto);
    return this.repo.save(ent);
  }

  async remove(id: number): Promise<void> {
    const ent = await this.findOne(id);
    await this.repo.remove(ent);
  }
}
