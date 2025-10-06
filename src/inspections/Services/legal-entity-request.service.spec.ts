import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LegalEntityRequestService } from './legal-entity-request.service';
import { LegalEntityRequest } from '../Entities/legalEntityRequest';
import { NotFoundException } from '@nestjs/common';

describe('LegalEntityRequestService', () => {
  let service: LegalEntityRequestService;
  let mockRepo: any;

  const mockEntity = {
    id: 1,
    businessName: 'Test Corp',
    legalRepresentative: 'John Doe',
    ruc: '1234567890',
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
        LegalEntityRequestService,
        {
          provide: getRepositoryToken(LegalEntityRequest),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<LegalEntityRequestService>(LegalEntityRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a legal entity request', async () => {
      const dto = { businessName: 'Test Corp', legalRepresentative: 'John' };
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
      const dto = { businessName: 'Updated Corp' };
      const result = await service.update(1, dto as any);

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      await service.remove(1);

      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
