import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionsService } from './collections.service';
import { Collection } from '../Entities/collection.entity';
import { NotFoundException } from '@nestjs/common';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    applicantName: 'John Doe',
    businessName: 'Test Business',
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
      findOne: jest.fn().mockResolvedValue(mockEntity),
      merge: jest.fn().mockReturnValue(mockEntity),
      remove: jest.fn().mockResolvedValue(mockEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: getRepositoryToken(Collection),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a collection', async () => {
      const dto = { applicantName: 'John Doe', businessName: 'Test Business' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of collections', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single collection', async () => {
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
    it('should update a collection', async () => {
      const updateDto = { applicantName: 'Updated' };
      const result = await service.update(1, updateDto as any);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepo.merge).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove a collection', async () => {
      const result = await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual({ deleted: true, id: 1 });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
