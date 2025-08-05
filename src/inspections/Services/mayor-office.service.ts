import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MayorOffice } from '../Entities/mayor-office.entity';
import { CreateMayorOfficeDto } from '../DTO/create-mayor-office.dto';
import { UpdateMayorOfficeDto } from '../DTO/update-mayor-office.dto';

@Injectable()
export class MayorOfficeService {
  constructor(
    @InjectRepository(MayorOffice)
    private readonly repo: Repository<MayorOffice>,
  ) {}

  async create(dto: CreateMayorOfficeDto): Promise<MayorOffice> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(): Promise<MayorOffice[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<MayorOffice> {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`MayorOffice with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateMayorOfficeDto): Promise<MayorOffice> {
    const entity = await this.findOne(id);
    const updated = Object.assign(entity, dto);
    return this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`MayorOffice with ID ${id} not found`);
    }
  }
}
