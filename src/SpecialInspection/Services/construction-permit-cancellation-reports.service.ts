// src/construction-permit-cancellations/construction-permit-cancellation-reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionPermitCancellationReport } from '../Entities/construction-permit-cancellation-report.entity';
import { CreateConstructionPermitCancellationReportDto } from '../DTO/create-construction-permit-cancellation-report.dto';
import { UpdateConstructionPermitCancellationReportDto } from '../DTO/update-construction-permit-cancellation-report.dto';


@Injectable()
export class ConstructionPermitCancellationReportsService {
  constructor(
    @InjectRepository(ConstructionPermitCancellationReport)
    private readonly repo: Repository<ConstructionPermitCancellationReport>,
  ) {}

  async create(dto: CreateConstructionPermitCancellationReportDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  // Minimal list ordered by visitDate DESC
  async findAll() {
    return this.repo.find({
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`ConstructionPermitCancellationReport ${id} not found`);
    }
    return found;
  }

  async update(id: number, dto: UpdateConstructionPermitCancellationReportDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) {
      throw new NotFoundException(`ConstructionPermitCancellationReport ${id} not found`);
    }
    return this.repo.save(entity);
  }

  async remove(id:number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
