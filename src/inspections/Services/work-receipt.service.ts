import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkReceipt } from '../Entities/workReceipt.entity';
import { CreateWorkReceiptDto } from '../DTO/create-work-receipts.dto';
import { UpdateWorkReceiptDto } from '../DTO/uptade-work-receipts.dto';

@Injectable()
export class WorkReceiptService {
  constructor(
    @InjectRepository(WorkReceipt)
    private readonly repo: Repository<WorkReceipt>,
  ) {}

  async create(dto: CreateWorkReceiptDto): Promise<WorkReceipt> {
    const workReceipt = this.repo.create(dto);
    return await this.repo.save(workReceipt);
  }

  async findAll(): Promise<WorkReceipt[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<WorkReceipt> {
    const receipt = await this.repo.findOneBy({ id });
    if (!receipt) {
      throw new NotFoundException(`WorkReceipt with ID ${id} not found`);
    }
    return receipt;
  }

  async update(id: number, dto: UpdateWorkReceiptDto): Promise<WorkReceipt> {
    const receipt = await this.findOne(id);
    const updated = this.repo.merge(receipt, dto);
    return await this.repo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const receipt = await this.findOne(id);
    await this.repo.remove(receipt);
  }
}
