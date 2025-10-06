import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaxProceduresService } from './tax-procedures.service';
import { TaxProcedure } from '../Entities/taxProcedure.entity';
import { NotFoundException } from '@nestjs/common';

describe('TaxProceduresService', () => {
  let service: TaxProceduresService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    nameOfApplicant: 'John Doe',
    observations: 'Test',
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
      findOne: jest.fn().mockResolvedValue(mockEntity),
      merge: jest.fn().mockReturnValue(mockEntity),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxProceduresService,
        {
          provide: getRepositoryToken(TaxProcedure),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TaxProceduresService>(TaxProceduresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tax procedure', async () => {
      const dto = { nameOfApplicant: 'John Doe' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of procedures', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single procedure', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a procedure', async () => {
      const dto = { observations: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOne).toHaveBeenCalled();
      expect(mockRepo.merge).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove a procedure', async () => {
      await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
