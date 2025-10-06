import { Test, TestingModule } from '@nestjs/testing';
import { ConcessionParcelController } from './concession-parcel.controller';
import { ConcessionParcelService } from '../Services/concession-parcel.service';

describe('ConcessionParcelController', () => {
  let controller: ConcessionParcelController;
  let service: ConcessionParcelService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    parcelNumber: '123',
    area: 100.5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcessionParcelController],
      providers: [
        {
          provide: ConcessionParcelService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConcessionParcelController>(ConcessionParcelController);
    service = module.get<ConcessionParcelService>(ConcessionParcelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a parcel', async () => {
      const dto = { parcelNumber: '123', area: 100.5 };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of parcels', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single parcel', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a parcel', async () => {
      const dto = { area: 150.5 };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a parcel', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
