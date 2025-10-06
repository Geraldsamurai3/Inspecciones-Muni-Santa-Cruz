import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AntiquityService } from './antiquity.service';
import { Antiquity } from '../Entities/antiquity.entity';
import { NotFoundException } from '@nestjs/common';

describe('AntiquityService', () => {
  let service: AntiquityService;
  let mockRepo: any;

  const mockAntiquity = {
    id: 1,
    nameOfApplicant: 'John Doe',
    businessName: 'Test Business',
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockAntiquity),
      save: jest.fn().mockResolvedValue(mockAntiquity),
      find: jest.fn().mockResolvedValue([mockAntiquity]),
      findOneBy: jest.fn().mockResolvedValue(mockAntiquity),
      remove: jest.fn().mockResolvedValue(mockAntiquity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AntiquityService,
        {
          provide: getRepositoryToken(Antiquity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<AntiquityService>(AntiquityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an antiquity record', async () => {
      const dto = { nameOfApplicant: 'John Doe', businessName: 'Test' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockAntiquity);
    });
  });

  describe('findAll', () => {
    it('should return an array of antiquities', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockAntiquity]);
    });
  });

  describe('findOne', () => {
    it('should return a single antiquity', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockAntiquity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Antigüedad no encontrada');
    });
  });

  describe('update', () => {
    it('should update an antiquity record', async () => {
      const dto = { businessName: 'Updated Business' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove an antiquity record', async () => {
      await service.remove(1);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockAntiquity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
