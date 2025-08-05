import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxProcedure } from '../Entities/taxProcedure.entity';
import { CreateTaxProcedureDto } from '../DTO/create-tax-procedure.dto';
import { UpdateTaxProcedureDto } from '../DTO/update-tax-procedure.dto';

@Injectable()
export class TaxProceduresService {
  constructor(
    @InjectRepository(TaxProcedure)
    private readonly repository: Repository<TaxProcedure>,
  ) {}

  async create(dto: CreateTaxProcedureDto): Promise<TaxProcedure> {
    const newProcedure = this.repository.create(dto);
    return this.repository.save(newProcedure);
  }

  async findAll(): Promise<TaxProcedure[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<TaxProcedure> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`TaxProcedure with ID ${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateTaxProcedureDto): Promise<TaxProcedure> {
    const item = await this.findOne(id);
    const updated = this.repository.merge(item, dto);
    return this.repository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
  }
}
