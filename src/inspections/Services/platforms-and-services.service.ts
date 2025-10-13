// src/platforms-and-services/platforms-and-services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformAndService } from '../Entities/platforms-and-ervices.entity';
import { CreatePlatformAndServiceDto } from '../DTO/create-platform-and-service.dto';
import { UpdatePlatformAndServiceDto } from '../DTO/update-platform-and-service.dto';


@Injectable()
export class PlatformsAndServicesService {
  constructor(
    @InjectRepository(PlatformAndService)
    private readonly repo: Repository<PlatformAndService>,
  ) {}

  async create(dto: CreatePlatformAndServiceDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`PlatformAndService ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdatePlatformAndServiceDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`PlatformAndService ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
