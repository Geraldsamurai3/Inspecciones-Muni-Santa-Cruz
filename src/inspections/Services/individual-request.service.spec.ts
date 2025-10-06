import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IndividualRequestService } from './individual-request.service';
import { IndividualRequest } from '../Entities/individual-request.entity';
import { NotFoundException } from '@nestjs/common';

describe('IndividualRequestService', () => {
  let service: IndividualRequestService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    cedula: '123456789',
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
        IndividualRequestService,
        {
          provide: getRepositoryToken(IndividualRequest),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<IndividualRequestService>(IndividualRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an individual request', async () => {
      const dto = { firstName: 'John', lastName: 'Doe', cedula: '123456789' };
      const result = await service.create(dto as any);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of requests', async () => {
      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single request', async () => {
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
    it('should update a request', async () => {
      const dto = { firstName: 'Jane' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a request', async () => {
      await service.delete(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
