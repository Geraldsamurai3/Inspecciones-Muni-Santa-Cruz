import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkReceiptService } from './work-receipt.service';
import { WorkReceipt } from '../Entities/workReceipt.entity';
import { NotFoundException } from '@nestjs/common';

describe('WorkReceiptService', () => {
  let service: WorkReceiptService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    propertyOwner: 'John Doe',
    observations: 'Test',
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
      findOneBy: jest.fn().mockResolvedValue(mockEntity),
      merge: jest.fn().mockReturnValue(mockEntity),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkReceiptService,
        {
          provide: getRepositoryToken(WorkReceipt),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<WorkReceiptService>(WorkReceiptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a work receipt', async () => {
      const dto = { propertyOwner: 'John Doe' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of receipts', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single receipt', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a receipt', async () => {
      const dto = { observations: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a receipt', async () => {
      await service.remove(1);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
