import { Test, TestingModule } from '@nestjs/testing';
import { ConstructionController } from './construction.controller';
import { ConstructionService } from '../Services/construction.service';

describe('ConstructionController', () => {
  let controller: ConstructionController;
  let service: ConstructionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockConstruction = {
    id: 1,
    propertyOwner: 'John Doe',
    hasConstructionLicense: true,
    photos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstructionController],
      providers: [
        {
          provide: ConstructionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConstructionController>(ConstructionController);
    service = module.get<ConstructionService>(ConstructionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a construction', async () => {
      const dto = { propertyOwner: 'John Doe', hasConstructionLicense: true };
      mockService.create.mockResolvedValue(mockConstruction);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockConstruction);
    });
  });

  describe('findAll', () => {
    it('should return an array of constructions', async () => {
      mockService.findAll.mockResolvedValue([mockConstruction]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockConstruction]);
    });
  });

  describe('findOne', () => {
    it('should return a single construction', async () => {
      mockService.findOne.mockResolvedValue(mockConstruction);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockConstruction);
    });
  });

  describe('update', () => {
    it('should update a construction', async () => {
      const dto = { hasConstructionLicense: false };
      mockService.update.mockResolvedValue({ ...mockConstruction, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a construction', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
