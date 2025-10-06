import { Test, TestingModule } from '@nestjs/testing';
import { GeneralInspectionController } from './general-inspection.controller';
import { GeneralInspectionService } from '../Services/general-inspection.service';

describe('GeneralInspectionController', () => {
  let controller: GeneralInspectionController;
  let service: GeneralInspectionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    address: 'Test Address',
    observations: 'Test observation',
    photos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralInspectionController],
      providers: [
        {
          provide: GeneralInspectionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GeneralInspectionController>(GeneralInspectionController);
    service = module.get<GeneralInspectionService>(GeneralInspectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a general inspection', async () => {
      const dto = { address: 'Test', observations: 'Test' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of inspections', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single inspection', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update an inspection', async () => {
      const dto = { observations: 'Updated' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.observations).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove an inspection', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
