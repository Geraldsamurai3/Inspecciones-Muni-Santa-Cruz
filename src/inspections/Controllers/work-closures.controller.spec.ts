import { Test, TestingModule } from '@nestjs/testing';
import { WorkClosuresController } from './work-closures.controller';
import { WorkClosuresService } from '../Services/work-closures.service';

describe('WorkClosuresController', () => {
  let controller: WorkClosuresController;
  let service: WorkClosuresService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockEntity = {
    id: 1,
    applicantName: 'John Doe',
    businessName: 'Test Business',
    photos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkClosuresController],
      providers: [
        {
          provide: WorkClosuresService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WorkClosuresController>(WorkClosuresController);
    service = module.get<WorkClosuresService>(WorkClosuresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a work closure', async () => {
      const dto = { applicantName: 'John', businessName: 'Test' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of work closures', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single work closure', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a work closure', async () => {
      const dto = { applicantName: 'Updated' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a work closure', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
