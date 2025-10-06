import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { Location } from '../Entities/location.entity';
import { NotFoundException } from '@nestjs/common';

describe('LocationService', () => {
  let service: LocationService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    address: 'Test Address',
    district: 'Test District',
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn().mockReturnValue(mockEntity),
      save: jest.fn().mockResolvedValue(mockEntity),
      find: jest.fn().mockResolvedValue([mockEntity]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getRepositoryToken(Location),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      const dto = { address: 'Test', district: 'District' };
      const result = await service.create(dto as any);

      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

});
