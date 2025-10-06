import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeneralInspectionService } from './general-inspection.service';
import { GeneralInspection } from '../Entities/generalInspection.entity';
import { NotFoundException } from '@nestjs/common';

describe('GeneralInspectionService', () => {
  let service: GeneralInspectionService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    address: 'Test Address',
    observations: 'Test observation',
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
        GeneralInspectionService,
        {
          provide: getRepositoryToken(GeneralInspection),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<GeneralInspectionService>(GeneralInspectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a general inspection', async () => {
      const dto = { address: 'Test', observations: 'Test' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of inspections', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single inspection', async () => {
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
    it('should update an inspection', async () => {
      const dto = { observations: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.preload).toHaveBeenCalledWith({ id: 1, ...dto });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove an inspection', async () => {
      const result = await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepo.remove).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
