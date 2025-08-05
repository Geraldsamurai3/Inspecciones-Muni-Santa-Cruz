import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndividualRequest } from '../Entities/individual-request.entity';
import { CreateIndividualRequestDto } from '../DTO/create-individual-request.dto';
import { UpdateIndividualRequestDto } from '../DTO/update-individual-request.dt';

@Injectable()
export class IndividualRequestService {
  constructor(
    @InjectRepository(IndividualRequest)
    private readonly individualRequestRepository: Repository<IndividualRequest>,
  ) {}

  async create(dto: CreateIndividualRequestDto): Promise<IndividualRequest> {
    const entity = this.individualRequestRepository.create(dto);
    return this.individualRequestRepository.save(entity);
  }

  async findAll(): Promise<IndividualRequest[]> {
    return this.individualRequestRepository.find();
  }

  async findOne(id: number): Promise<IndividualRequest> {
    const entity = await this.individualRequestRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`IndividualRequest with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: number, dto: UpdateIndividualRequestDto): Promise<IndividualRequest> {
    const entity = await this.findOne(id);
    const updated = Object.assign(entity, dto);
    return await this.individualRequestRepository.save(updated);
  }


  async delete(id: number): Promise<void> {
    const result = await this.individualRequestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`IndividualRequest with ID ${id} not found`);
    }
  }
}
