import { Test, TestingModule } from '@nestjs/testing';
import { LegalEntityRequestController } from './legal-entity-request.controller';
import { LegalEntityRequestService } from '../Services/legal-entity-request.service';

describe('LegalEntityRequestController', () => {
  let controller: LegalEntityRequestController;
  let service: LegalEntityRequestService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    businessName: 'Test Business',
    legalRepresentative: 'John Doe',
    ruc: '1234567890',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalEntityRequestController],
      providers: [
        {
          provide: LegalEntityRequestService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LegalEntityRequestController>(LegalEntityRequestController);
    service = module.get<LegalEntityRequestService>(LegalEntityRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a legal entity request', async () => {
      const dto = { businessName: 'Test', legalRepresentative: 'John', ruc: '1234567890' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of requests', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single request', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a request', async () => {
      const dto = { businessName: 'Updated Business' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
