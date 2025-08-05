import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Construction } from '../Entities/construction.entity';
import { CreateConstructionDto } from '../DTO/create-construction.dto';
import { UpdateConstructionDto } from '../DTO/update-construction.dto';

@Injectable()
export class ConstructionService {
  constructor(
    @InjectRepository(Construction)
    private readonly repo: Repository<Construction>,
  ) {}

  async create(dto: CreateConstructionDto): Promise<Construction> {
    const construction = this.repo.create(dto);
    return this.repo.save(construction);
  }

  async findAll(): Promise<Construction[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Construction> {
    const construction = await this.repo.findOneBy({ id });
    if (!construction) {
      throw new NotFoundException(`Construction with ID ${id} not found`);
    }
    return construction;
  }

  async update(id: number, dto: UpdateConstructionDto): Promise<Construction> {
    const construction = await this.findOne(id);
    const updated = Object.assign(construction, dto);
    return this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Construction with ID ${id} not found`);
    }
  }
}
