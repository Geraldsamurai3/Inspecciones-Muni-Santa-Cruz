import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcessionParcel } from '../Entities/zmt.consession.parcels.entity';
import { CreateConcessionParcelDto } from '../DTO/create-concession-parcel.dto';
import { UpdateConcessionParcelDto } from '../DTO/update-concession-parcel.dto';

@Injectable()
export class ConcessionParcelService {
  constructor(
    @InjectRepository(ConcessionParcel)
    private readonly repo: Repository<ConcessionParcel>,
  ) {}

  create(dto: CreateConcessionParcelDto): Promise<ConcessionParcel> {
    const ent = this.repo.create({ ...dto, area: parseFloat(dto.area as any) });
    return this.repo.save(ent);
  }

  findAll(): Promise<ConcessionParcel[]> {
    return this.repo.find({ relations: ['concession'] });
  }

  async findOne(id: number): Promise<ConcessionParcel> {
    const ent = await this.repo.findOne({ where: { id }, relations: ['concession'] });
    if (!ent) throw new NotFoundException(`Parcel ${id} not found`);
    return ent;
  }

  async update(id: number, dto: UpdateConcessionParcelDto): Promise<ConcessionParcel> {
    const ent = await this.findOne(id);
    Object.assign(ent, dto);
    if (dto.area !== undefined) ent.area = parseFloat(dto.area as any);
    return this.repo.save(ent);
  }

  async remove(id: number): Promise<void> {
    const ent = await this.findOne(id);
    await this.repo.remove(ent);
  }
}
