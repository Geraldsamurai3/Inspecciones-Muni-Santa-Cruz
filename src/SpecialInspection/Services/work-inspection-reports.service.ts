// src/work-inspection-reports/work-inspection-reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkInspectionReport } from '../Entities/work-inspection-report.entity';
import { CreateWorkInspectionReportDto } from '../DTO/create-work-inspection-report.dto';
import { UpdateWorkInspectionReportDto } from '../DTO/update-work-inspection-report.dto';


@Injectable()
export class WorkInspectionReportsService {
  constructor(
    @InjectRepository(WorkInspectionReport)
    private readonly repo: Repository<WorkInspectionReport>,
  ) {}

  async create(dto: CreateWorkInspectionReportDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Minimal list ordered by visitDate DESC
  async findAll() {
    return this.repo.find({
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`WorkInspectionReport ${id} not found`);
    return found;
  }

  async update(id: string, dto: UpdateWorkInspectionReportDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`WorkInspectionReport ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: string) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
