// src/special-inspections/liquor-license-complaints.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { LiquorLicenseComplaint } from '../Entities/liquor-license-complaint.entity';
import { CreateLiquorLicenseComplaintDto } from '../DTO/create-liquor-license-complaint.dto';
import { UpdateLiquorLicenseComplaintDto } from '../DTO/update-liquor-license-complaint.dto';

@Injectable()
export class LiquorLicenseComplaintsService {
  constructor(
    @InjectRepository(LiquorLicenseComplaint)
    private readonly repo: Repository<LiquorLicenseComplaint>,
  ) {}

  async create(dto: CreateLiquorLicenseComplaintDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  /**
   * Optional lightweight filtering via query params:
   * q -> search by applicantName or tradeName (case-insensitive)
   * canton, district -> exact match filters
   */
  async findAll(query?: {
    q?: string;
    canton?: string;
    district?: string;
  }) {
    const where: FindOptionsWhere<LiquorLicenseComplaint>[] = [];

    if (query?.q) {
      where.push(
        { applicantName: ILike(`%${query.q}%`) },
        { tradeName: ILike(`%${query.q}%`) },
      );
    }

    const extraFilters: FindOptionsWhere<LiquorLicenseComplaint> = {};
    if (query?.canton) extraFilters.canton = query.canton;
    if (query?.district) extraFilters.district = query.district;

    if (where.length === 0) {
      return this.repo.find({ where: extraFilters, order: { visitDate: 'DESC' } });
    }
    // OR-search on q plus AND the extraFilters for canton/district if provided
    return this.repo.find({
      where: where.map((w) => ({ ...w, ...extraFilters })),
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Complaint ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateLiquorLicenseComplaintDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`Complaint ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
