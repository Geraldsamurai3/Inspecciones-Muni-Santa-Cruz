import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './Entities/inspections.entity';

import { UpdateInspectionDto } from './DTO/update-inspection.dto';
import { CreateInspectionDto } from './DTO/create-inspection.dto';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
  ) {}

  async create(dto: CreateInspectionDto): Promise<Inspection> {
    const inspection = this.inspectionRepo.create(dto);
    return this.inspectionRepo.save(inspection);
  }

  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepo.find({
      relations: [
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'taxProcedure',
        'mayorOffice',
        'antiquity',
        'location',
        'landUse',
      ],
    });
  }

  async findOne(id: number): Promise<Inspection> {
    const inspection = await this.inspectionRepo.findOne({
      where: { id },
      relations: [
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'taxProcedure',
        'mayorOffice',
        'antiquity',
        'location',
        'landUse',
      ],
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async update(id: number, dto: UpdateInspectionDto): Promise<Inspection> {
    const inspection = await this.findOne(id);
    Object.assign(inspection, dto);
    return this.inspectionRepo.save(inspection);
  }

  async remove(id: number): Promise<void> {
    const inspection = await this.findOne(id);
    await this.inspectionRepo.remove(inspection);
  }
}
