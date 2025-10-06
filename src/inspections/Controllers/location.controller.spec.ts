import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from '../Services/location.service';

describe('LocationController', () => {
  let controller: LocationController;
  let service: LocationService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    address: 'Test Address',
    district: 'Test District',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      const dto = { address: 'Test', district: 'District' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of locations', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });
});
