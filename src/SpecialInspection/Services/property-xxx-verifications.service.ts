// src/property-xxx-verifications/property-xxx-verifications.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { PropertyXxxVerification } from '../Entities/property-xxx-verification.entity';
import { CreatePropertyXxxVerificationDto } from '../DTO/create-property-xxx-verification.dto';
import { UpdatePropertyXxxVerificationDto } from '../DTO/update-property-xxx-verification.dto';

@Injectable()
export class PropertyXxxVerificationsService {
  constructor(
    @InjectRepository(PropertyXxxVerification)
    private readonly repo: Repository<PropertyXxxVerification>,
  ) {}

  async create(dto: CreatePropertyXxxVerificationDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  /**
   * Filtros opcionales:
   * - q: búsqueda "contiene" por personName OR propertyNumber OR typology (LIKE '%term%')
   * - canton, district: coincidencia exacta
   * Ordenado por visitDate DESC (más recientes primero)
   */
  async findAll(query?: { q?: string; canton?: string; district?: string }) {
    const whereOR: FindOptionsWhere<PropertyXxxVerification>[] = [];
    const andFilters: FindOptionsWhere<PropertyXxxVerification> = {};

    if (query?.q && query.q.trim() !== '') {
      const term = `%${query.q.trim()}%`;
      whereOR.push(
        { personName: Like(term) },
        { propertyNumber: Like(term) },
        { typology: Like(term) },
      );
    }
    if (query?.canton)   andFilters.canton   = query.canton;
    if (query?.district) andFilters.district = query.district;

    if (whereOR.length === 0) {
      return this.repo.find({
        where: andFilters,
        order: { visitDate: 'DESC' },
      });
    }

    return this.repo.find({
      where: whereOR.map(w => ({ ...w, ...andFilters })),
      order: { visitDate: 'DESC' },
    });
  }


  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`PropertyXxxVerification ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdatePropertyXxxVerificationDto) {
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) throw new NotFoundException(`PropertyXxxVerification ${id} not found`);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
