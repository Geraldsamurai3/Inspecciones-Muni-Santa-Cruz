// src/collections/collections.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../Entities/collection.entity';
import { CreateCollectionDto } from '../DTO/create-collection.dto';
import { UpdateCollectionDto } from '../DTO/update-collection.dto';
@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly repo: Repository<Collection>,
  ) {}

  private static readonly MARK_FIELDS: Array<keyof Collection> = [
    'nobodyPresent',
    'wrongAddress',
    'movedAddress',
    'refusedToSign',
    'notLocated',
  ];

  private normalizeMarks<T extends Partial<Collection>>(payload: T): T {
    CollectionsService.MARK_FIELDS.forEach((f) => {
      const v = payload[f] as unknown as string | undefined | null;
      if (typeof v === 'string') {
        // Accept 'X' or 'x' → store as 'X'
        (payload as any)[f] = v.toUpperCase() === 'X' ? 'X' : null;
      }
      // if undefined, leave as-is (won't overwrite on update)
    });
    return payload;
  }

  async create(dto: CreateCollectionDto) {
    const normalized = this.normalizeMarks({ ...(dto as any) });
    const entity = this.repo.create(normalized);
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Collection ${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdateCollectionDto) {
    // Load existing to ensure 404 if not found
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Collection ${id} not found`);

    // Only normalize fields present in dto; keep others unchanged
    const normalized = this.normalizeMarks({ ...(dto as any) });

    const merged = this.repo.merge(existing, normalized);
    return this.repo.save(merged);
  }

  async remove(id: number) {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
    return { deleted: true, id };
  }
}
