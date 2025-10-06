import { Test, TestingModule } from '@nestjs/testing';
import { IndividualRequestController } from './individual-request.controller';
import { IndividualRequestService } from '../Services/individual-request.service';

describe('IndividualRequestController', () => {
  let controller: IndividualRequestController;
  let service: IndividualRequestService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    cedula: '123456789',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndividualRequestController],
      providers: [
        {
          provide: IndividualRequestService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<IndividualRequestController>(IndividualRequestController);
    service = module.get<IndividualRequestService>(IndividualRequestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an individual request', async () => {
      const dto = { firstName: 'John', lastName: 'Doe', cedula: '123456789' };
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
      const dto = { firstName: 'Jane' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      mockService.delete.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
