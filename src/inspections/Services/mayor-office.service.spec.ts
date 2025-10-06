import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MayorOfficeService } from './mayor-office.service';
import { MayorOffice } from '../Entities/mayor-office.entity';
import { NotFoundException } from '@nestjs/common';

describe('MayorOfficeService', () => {
  let service: MayorOfficeService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    nameOfApplicant: 'John Doe',
    observations: 'Test observation',
    photos: [],
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
      findOneBy: jest.fn().mockResolvedValue(mockEntity),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MayorOfficeService,
        {
          provide: getRepositoryToken(MayorOffice),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MayorOfficeService>(MayorOfficeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a mayor office record', async () => {
      const dto = { nameOfApplicant: 'John Doe', observations: 'Test' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of records', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single record', async () => {
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
    it('should update a record', async () => {
      const dto = { observations: 'Updated' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a record', async () => {
      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
