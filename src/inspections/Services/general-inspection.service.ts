import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralInspection } from '../Entities/generalInspection.entity';
import { CreateGeneralInspectionDto } from '../DTO/create-general-inspection.dto';
import { UpdateGeneralInspectionDto } from '../DTO/update-general-inspection.dto';

@Injectable()
export class GeneralInspectionService {
  constructor(
    @InjectRepository(GeneralInspection)
    private readonly repo: Repository<GeneralInspection>,
  ) {}

  create(dto: CreateGeneralInspectionDto) {
    const inspection = this.repo.create(dto);
    return this.repo.save(inspection);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`GeneralInspection #${id} not found`);
    return record;
  }

  async update(id: number, dto: UpdateGeneralInspectionDto) {
    const record = await this.repo.preload({ id, ...dto });
    if (!record) throw new NotFoundException(`GeneralInspection #${id} not found`);
    return this.repo.save(record);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return this.repo.remove(record);
  }
}
