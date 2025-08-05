import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PcCancellation } from '../Entities/pcCancellation.entity';
import { CreatePcCancellationDto } from '../DTO/create-pc-cancellation.dto';
import { UpdatePcCancellationDto } from '../DTO/update-pc-cancellation.dto';

@Injectable()
export class PcCancellationService {
  constructor(
    @InjectRepository(PcCancellation)
    private readonly repo: Repository<PcCancellation>,
  ) {}

  async create(dto: CreatePcCancellationDto): Promise<PcCancellation> {
    const created = this.repo.create(dto);
    return await this.repo.save(created);
  }

  async findAll(): Promise<PcCancellation[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<PcCancellation> {
    const found = await this.repo.findOneBy({ id });
    if (!found) throw new NotFoundException(`PcCancellation #${id} not found`);
    return found;
  }

  async update(id: number, dto: UpdatePcCancellationDto): Promise<PcCancellation> {
    const pc = await this.findOne(id);
    const updated = Object.assign(pc, dto);
    return await this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`PcCancellation #${id} not found`);
  }
}
