import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from '../Services/collections.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  let service: CollectionsService;

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
      controllers: [CollectionsController],
      providers: [
        {
          provide: CollectionsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
    service = module.get<CollectionsService>(CollectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a collection', async () => {
      const dto = { applicantName: 'John', businessName: 'Test' };
      mockService.create.mockResolvedValue(mockEntity);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of collections', async () => {
      mockService.findAll.mockResolvedValue([mockEntity]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockEntity]);
    });
  });

  describe('findOne', () => {
    it('should return a single collection', async () => {
      mockService.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const dto = { applicantName: 'Updated' };
      mockService.update.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update(1, dto as any);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove a collection', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
