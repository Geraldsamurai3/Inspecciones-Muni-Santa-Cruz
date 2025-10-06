import { Test, TestingModule } from '@nestjs/testing';
import { AntiquityController } from './aniquity.controller';
import { AntiquityService } from '../Services/antiquity.service';

describe('AntiquityController', () => {
  let controller: AntiquityController;
  let service: AntiquityService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    nameOfApplicant: 'John Doe',
    businessName: 'Test Business',
    photos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AntiquityController],
      providers: [
        {
          provide: AntiquityService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AntiquityController>(AntiquityController);
    service = module.get<AntiquityService>(AntiquityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an antiquity record', async () => {
      const dto = { nameOfApplicant: 'John Doe', businessName: 'Test' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of records', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single record', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      const dto = { nameOfApplicant: 'Updated Name' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a record', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
