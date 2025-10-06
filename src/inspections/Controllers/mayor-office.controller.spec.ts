import { Test, TestingModule } from '@nestjs/testing';
import { MayorOfficeController } from './mayor-office.controller';
import { MayorOfficeService } from '../Services/mayor-office.service';

describe('MayorOfficeController', () => {
  let controller: MayorOfficeController;
  let service: MayorOfficeService;

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
    observations: 'Test observation',
    photos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MayorOfficeController],
      providers: [
        {
          provide: MayorOfficeService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MayorOfficeController>(MayorOfficeController);
    service = module.get<MayorOfficeService>(MayorOfficeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a mayor office record', async () => {
      const dto = { nameOfApplicant: 'John Doe', observations: 'Test' };
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
      const dto = { observations: 'Updated' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result.observations).toBe('Updated');
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
