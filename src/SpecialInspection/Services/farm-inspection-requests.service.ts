// src/farm-inspection-requests/farm-inspection-requests.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { FarmInspectionRequest } from '../Entities/farm-inspection-request.entity';
import { CreateFarmInspectionRequestDto } from '../DTO/create-farm-inspection-request.dto';
import { UpdateFarmInspectionRequestDto } from '../DTO/update-farm-inspection-request.dto';


@Injectable()
export class FarmInspectionRequestsService {
  constructor(
    @InjectRepository(FarmInspectionRequest)
    private readonly repo: Repository<FarmInspectionRequest>,
  ) {}

  async create(dto: CreateFarmInspectionRequestDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  /**
   * Optional filters:
   * - q: searches by personName OR propertyNumber (case-insensitive contains)
   * - canton, district: exact match filters
   * Ordered by visitDate DESC to see most recent first.
   */
  async findAll(query?: { q?: string; canton?: string; district?: string }) {
    const whereOR: FindOptionsWhere<FarmInspectionRequest>[] = [];
    const andFilters: FindOptionsWhere<FarmInspectionRequest> = {};

    if (query?.q) {
      whereOR.push(
        { personName: ILike(`%${query.q}%`) },
        { propertyNumber: ILike(`%${query.q}%`) },
      );
    }
    if (query?.canton) andFilters.canton = query.canton;
    if (query?.district) andFilters.district = query.district;

    if (whereOR.length === 0) {
      return this.repo.find({
        where: andFilters,
        order: { visitDate: 'DESC' },
      });
    }

    return this.repo.find({
      where: whereOR.map((w) => ({ ...w, ...andFilters })),
      order: { visitDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`FarmInspectionRequest ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateFarmInspectionRequestDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`FarmInspectionRequest ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
