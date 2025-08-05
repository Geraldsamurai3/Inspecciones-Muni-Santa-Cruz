import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Antiquity } from '../Entities/antiquity.entity';
import { CreateAntiquityDto } from '../DTO/create-antiquity.dto';
import { UpdateAniquityDto } from '../DTO/update-antiquity.dto';

@Injectable()
export class AntiquityService {
  constructor(
    @InjectRepository(Antiquity)
    private readonly antiquityRepo: Repository<Antiquity>,
  ) {}

  async create(dto: CreateAntiquityDto): Promise<Antiquity> {
    const newAntiquity = this.antiquityRepo.create(dto);
    return await this.antiquityRepo.save(newAntiquity);
  }

  async findAll(): Promise<Antiquity[]> {
    return this.antiquityRepo.find();
  }

  async findOne(id: number): Promise<Antiquity> {
    const antiquity = await this.antiquityRepo.findOneBy({ id });
    if (!antiquity) throw new NotFoundException('Antigüedad no encontrada');
    return antiquity;
  }

  async update(id: number, dto: UpdateAniquityDto): Promise<Antiquity> {
    const antiquity = await this.findOne(id);
    const updated = Object.assign(antiquity, dto);
    return this.antiquityRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const antiquity = await this.findOne(id);
    await this.antiquityRepo.remove(antiquity);
  }
}
