import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConstructionService } from './construction.service';
import { Construction } from '../Entities/construction.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConstructionService', () => {
  let service: ConstructionService;
  let mockRepo: any;

  const mockConstruction = {
    id: 1,
    propertyOwner: 'John Doe',
    hasConstructionLicense: true,
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockConstruction),
      save: jest.fn().mockResolvedValue(mockConstruction),
      find: jest.fn().mockResolvedValue([mockConstruction]),
      findOneBy: jest.fn().mockResolvedValue(mockConstruction),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConstructionService,
        {
          provide: getRepositoryToken(Construction),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ConstructionService>(ConstructionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a construction', async () => {
      const dto = { propertyOwner: 'John Doe', hasConstructionLicense: true };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockConstruction);
    });
  });

  describe('findAll', () => {
    it('should return an array of constructions', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockConstruction]);
    });
  });

  describe('findOne', () => {
    it('should return a single construction', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockConstruction);
    });

    it('should throw NotFoundException when construction not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a construction', async () => {
      const dto = { propertyOwner: 'Jane Doe' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a construction', async () => {
      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when construction not found', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
