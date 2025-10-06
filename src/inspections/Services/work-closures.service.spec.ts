import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkClosuresService } from './work-closures.service';
import { WorkClosure } from '../Entities/work-closure.entity';
import { NotFoundException } from '@nestjs/common';

describe('WorkClosuresService', () => {
  let service: WorkClosuresService;
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
      preload: jest.fn().mockResolvedValue(mockEntity),
      remove: jest.fn().mockResolvedValue(mockEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkClosuresService,
        {
          provide: getRepositoryToken(WorkClosure),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<WorkClosuresService>(WorkClosuresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a work closure', async () => {
      const dto = { applicantName: 'John Doe', businessName: 'Test Business' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of work closures', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single work closure', async () => {
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
    it('should update a work closure', async () => {
      const dto = { applicantName: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.preload).toHaveBeenCalledWith({ id: 1, ...dto });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove a work closure', async () => {
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
