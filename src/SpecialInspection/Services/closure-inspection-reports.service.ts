// src/closure-inspections/closure-inspection-reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClosureInspectionReport } from '../Entities/closure-inspection-report.entity';
import { CreateClosureInspectionReportDto } from '../DTO/create-closure-inspection-report.dto';
import { UpdateClosureInspectionReportDto } from '../DTO/update-closure-inspection-report.dto';


@Injectable()
export class ClosureInspectionReportsService {
  constructor(
    @InjectRepository(ClosureInspectionReport)
    private readonly repo: Repository<ClosureInspectionReport>,
  ) {}

  async create(dto: CreateClosureInspectionReportDto) {
    const entity = this.repo.create(dto as any);
    return this.repo.save(entity);
  }

  async findAll() {
    const items = await this.repo.find({
      relations: ['visits'],
      order: { visitDate: 'DESC' },
    });
    items.forEach(i => i.visits && i.visits.sort((a, b) => a.sequence - b.sequence));
    return items;
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id }, relations: ['visits'] });
    if (!found) throw new NotFoundException(`ClosureInspectionReport ${id} not found`);
    if (found.visits) found.visits.sort((a, b) => a.sequence - b.sequence);
    return found;
  }

  async update(id: number, dto: UpdateClosureInspectionReportDto) {
    const report = await this.repo.findOne({ where: { id }, relations: ['visits'] });
    if (!report) throw new NotFoundException(`ClosureInspectionReport ${id} not found`);

    const { visits, ...rest } = dto as any;
    Object.assign(report, rest);

    if (Array.isArray(visits)) {
      report.visits = visits as any; // replace list; orphans deleted by config
    }

    const saved = await this.repo.save(report);
    if (saved.visits) saved.visits.sort((a, b) => a.sequence - b.sequence);
    return saved;
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity); // CASCADE removes visits
    return { deleted: true, id };
  }
}
