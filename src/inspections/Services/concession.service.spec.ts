import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConcessionService } from './concession.service';
import { Concession } from '../Entities/zmt.consession.enity';
import { NotFoundException } from '@nestjs/common';

describe('ConcessionService', () => {
  let service: ConcessionService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    applicantName: 'John Doe',
    concessionType: 'Type A',
    parcels: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
      findOne: jest.fn().mockResolvedValue(mockEntity),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcessionService,
        {
          provide: getRepositoryToken(Concession),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ConcessionService>(ConcessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a concession', async () => {
      const dto = { applicantName: 'John', concessionType: 'Type A' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of concessions', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single concession', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['parcels', 'inspection'] });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a concession', async () => {
      const dto = { applicantName: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['parcels', 'inspection'] });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove a concession', async () => {
      await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['parcels', 'inspection'] });
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
