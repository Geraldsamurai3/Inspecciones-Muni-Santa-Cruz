import { Test, TestingModule } from '@nestjs/testing';
import { InspectionService } from './inspections.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inspection } from './Entities/inspections.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InspectionStatus } from './Enums/inspection-status.enum';
import { ApplicantType } from './Enums/applicant.enum';

describe('InspectionService', () => {
  let service: InspectionService;
  let inspectionRepo: jest.Mocked<Repository<Inspection>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mockInspector = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    toSafeObject: jest.fn().mockReturnValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }),
  } as any;

  const mockInspection = {
    id: 1,
    inspectionDate: '2024-01-15',
    procedureNumber: 'PROC-001',
    applicantType: ApplicantType.INDIVIDUAL,
    status: InspectionStatus.NEW,
    reviewedAt: null,
    inspectors: [mockInspector],
    construction: {} as any,
    pcCancellation: {} as any,
    workReceipt: {} as any,
    generalInspection: {} as any,
    taxProcedure: {} as any,
    mayorOffice: {} as any,
    antiquity: {} as any,
    location: {} as any,
    landUse: {} as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Inspection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionService,
        {
          provide: getRepositoryToken(Inspection),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findBy: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InspectionService>(InspectionService);
    inspectionRepo = module.get(getRepositoryToken(Inspection));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new inspection with status NEW', async () => {
      const createDto = {
        inspectionDate: '2024-01-15',
        procedureNumber: 'PROC-001',
        inspectorIds: [1],
      };

      userRepo.findBy.mockResolvedValue([mockInspector]);
      inspectionRepo.create.mockReturnValue(mockInspection as any);
      inspectionRepo.save.mockResolvedValue(mockInspection);
      inspectionRepo.findOne.mockResolvedValue(mockInspection);

      const result = await service.create(createDto as any);

      expect(userRepo.findBy).toHaveBeenCalledWith({ id: expect.anything() });
      expect(inspectionRepo.create).toHaveBeenCalled();
      expect(inspectionRepo.save).toHaveBeenCalled();
      expect(result.status).toBe(InspectionStatus.NEW);
      expect(result.reviewedAt).toBeNull();
    });

    it('should create inspection without inspectors if none provided', async () => {
      const createDto = {
        inspectionDate: '2024-01-15',
        procedureNumber: 'PROC-002',
      };

      const inspectionWithoutInspectors = { ...mockInspection, inspectors: [] };

      inspectionRepo.create.mockReturnValue(inspectionWithoutInspectors as any);
      inspectionRepo.save.mockResolvedValue(inspectionWithoutInspectors);
      inspectionRepo.findOne.mockResolvedValue(inspectionWithoutInspectors);

      const result = await service.create(createDto as any);

      expect(userRepo.findBy).not.toHaveBeenCalled();
      expect(result.inspectors).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return an array of inspections with sanitized inspectors', async () => {
      inspectionRepo.find.mockResolvedValue([mockInspection]);

      const result = await service.findAll();

      expect(inspectionRepo.find).toHaveBeenCalledWith({
        relations: expect.arrayContaining(['inspectors', 'construction', 'generalInspection']),
      });
      expect(result).toHaveLength(1);
      expect(result[0].inspectors[0]).toEqual(mockInspector.toSafeObject());
    });

    it('should return empty array when no inspections exist', async () => {
      inspectionRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single inspection with sanitized data', async () => {
      inspectionRepo.findOne.mockResolvedValue(mockInspection);

      const result = await service.findOne(1);

      expect(inspectionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.arrayContaining(['inspectors', 'construction']),
      });
      expect(result.id).toBe(1);
      expect(result.inspectors[0]).toEqual(mockInspector.toSafeObject());
    });

    it('should throw NotFoundException when inspection not found', async () => {
      inspectionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Inspection with ID 999 not found');
    });
  });

  describe('update', () => {
    it('should update inspection fields', async () => {
      const updateDto = { procedureNumber: 'PROC-001-UPDATED' };
      const updatedInspection = { ...mockInspection, procedureNumber: 'PROC-001-UPDATED' };

      inspectionRepo.findOne.mockResolvedValue(mockInspection);
      inspectionRepo.save.mockResolvedValue(updatedInspection);

      const result = await service.update(1, updateDto as any);

      expect(inspectionRepo.save).toHaveBeenCalled();
      expect(result.procedureNumber).toBe('PROC-001-UPDATED');
    });

    it('should set reviewedAt when status changes to REVIEWED', async () => {
      const updateDto = { status: InspectionStatus.REVIEWED };
      const inspectionNotReviewed = { ...mockInspection, reviewedAt: null };

      inspectionRepo.findOne.mockResolvedValue(inspectionNotReviewed);
      inspectionRepo.save.mockResolvedValue({
        ...inspectionNotReviewed,
        status: InspectionStatus.REVIEWED,
        reviewedAt: expect.any(Date),
      } as any);

      const result = await service.update(1, updateDto);

      expect(result.status).toBe(InspectionStatus.REVIEWED);
      expect(result.reviewedAt).toBeDefined();
    });

    it('should clear reviewedAt when status changes from REVIEWED', async () => {
      const reviewedInspection = {
        ...mockInspection,
        status: InspectionStatus.REVIEWED,
        reviewedAt: new Date(),
      };
      const updateDto = { status: InspectionStatus.IN_PROGRESS };

      inspectionRepo.findOne.mockResolvedValue(reviewedInspection);
      inspectionRepo.save.mockResolvedValue({
        ...reviewedInspection,
        status: InspectionStatus.IN_PROGRESS,
        reviewedAt: null,
      } as any);

      const result = await service.update(1, updateDto);

      expect(result.status).toBe(InspectionStatus.IN_PROGRESS);
      expect(result.reviewedAt).toBeNull();
    });

    it('should throw BadRequestException when trying to manually archive', async () => {
      const updateDto = { status: InspectionStatus.ARCHIVED };

      inspectionRepo.findOne.mockResolvedValue(mockInspection);

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
      await expect(service.update(1, updateDto)).rejects.toThrow(
        'El estado "Archivado" lo asigna automáticamente el sistema.'
      );
    });
  });

  describe('archiveReviewedOlderThan7Days', () => {
    it('should archive old reviewed inspections', async () => {
      inspectionRepo.update.mockResolvedValue({ affected: 5 } as any);

      await service.archiveReviewedOlderThan7Days();

      expect(inspectionRepo.update).toHaveBeenCalledWith(
        {
          status: InspectionStatus.REVIEWED,
          reviewedAt: expect.anything(),
        },
        { status: InspectionStatus.ARCHIVED }
      );
    });

    it('should handle when no inspections need archiving', async () => {
      inspectionRepo.update.mockResolvedValue({ affected: 0 } as any);

      await service.archiveReviewedOlderThan7Days();

      expect(inspectionRepo.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an inspection', async () => {
      inspectionRepo.findOne.mockResolvedValue(mockInspection);
      inspectionRepo.remove.mockResolvedValue(mockInspection);

      await service.remove(1);

      expect(inspectionRepo.findOne).toHaveBeenCalled();
      expect(inspectionRepo.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockInspection.id,
          procedureNumber: mockInspection.procedureNumber,
        })
      );
    });

    it('should throw NotFoundException when trying to remove non-existent inspection', async () => {
      inspectionRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
