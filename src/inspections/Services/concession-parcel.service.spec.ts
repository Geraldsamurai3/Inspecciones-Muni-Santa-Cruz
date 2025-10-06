import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConcessionParcelService } from './concession-parcel.service';
import { ConcessionParcel } from '../Entities/zmt.consession.parcels.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConcessionParcelService', () => {
  let service: ConcessionParcelService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    parcelNumber: 'P001',
    area: 100.5,
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
        ConcessionParcelService,
        {
          provide: getRepositoryToken(ConcessionParcel),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ConcessionParcelService>(ConcessionParcelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a parcel', async () => {
      const dto = { parcelNumber: 'P001', area: 100.5 };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of parcels', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single parcel', async () => {
      const result = await service.findOne(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['concession'] });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a parcel', async () => {
      const dto = { area: 150.5 };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOne).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('remove', () => {
    it('should remove a parcel', async () => {
      await service.remove(1);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['concession'] });
      expect(mockRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
