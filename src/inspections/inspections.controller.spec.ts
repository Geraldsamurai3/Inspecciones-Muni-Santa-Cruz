import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InspectionController } from './inspections.controller';
import { InspectionService } from './inspections.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Inspection } from './Entities/inspections.entity';
import { MayorOffice } from './Entities/mayor-office.entity';
import { InspectionStatus } from './Enums/inspection-status.enum';
import { ApplicantType } from './Enums/applicant.enum';

describe('InspectionController', () => {
  let controller: InspectionController;
  let service: jest.Mocked<InspectionService>;

  const mockInspection = {
    id: 1,
    inspectionDate: '2024-01-15',
    procedureNumber: 'PROC-001',
    applicantType: ApplicantType.INDIVIDUAL,
    status: InspectionStatus.NEW,
    inspectors: [],
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InspectionController],
      providers: [
        {
          provide: InspectionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Inspection),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            manager: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(MayorOffice),
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InspectionController>(InspectionController);
    service = module.get(InspectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an inspection', async () => {
      const createDto = { 
        inspectionDate: '2024-01-15',
        procedureNumber: 'PROC-001' 
      };
      service.create.mockResolvedValue(mockInspection as any);

      const result = await controller.create(createDto as any);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockInspection);
    });
  });

  describe('findAll', () => {
    it('should return an array of inspections', async () => {
      service.findAll.mockResolvedValue([mockInspection] as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockInspection]);
    });
  });

  describe('findOne', () => {
    it('should return a single inspection', async () => {
      service.findOne.mockResolvedValue(mockInspection as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInspection);
    });
  });

  describe('update', () => {
    it('should update an inspection', async () => {
      const updateDto = { procedureNumber: 'PROC-001-UPDATED' };
      const updatedInspection = { ...mockInspection, procedureNumber: 'PROC-001-UPDATED' };
      service.update.mockResolvedValue(updatedInspection as any);

      const result = await controller.update(1, updateDto as any);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.procedureNumber).toBe('PROC-001-UPDATED');
    });
  });

  describe('remove', () => {
    it('should remove an inspection', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('patch', () => {
    it('should partially update an inspection', async () => {
      const patchDto = { procedureNumber: 'PROC-002' };
      const patchedInspection = { ...mockInspection, procedureNumber: 'PROC-002' };
      service.update.mockResolvedValue(patchedInspection as any);

      const result = await controller.patch(1, patchDto as any);

      expect(service.update).toHaveBeenCalledWith(1, patchDto);
      expect(result.procedureNumber).toBe('PROC-002');
    });
  });

  describe('patchStatus', () => {
    it('should update only the status of an inspection', async () => {
      const statusDto = { status: InspectionStatus.IN_PROGRESS };
      const updatedInspection = { ...mockInspection, status: InspectionStatus.IN_PROGRESS };
      service.update.mockResolvedValue(updatedInspection as any);

      const result = await controller.patchStatus(1, statusDto);

      expect(service.update).toHaveBeenCalledWith(1, { status: InspectionStatus.IN_PROGRESS });
      expect(result).toEqual(updatedInspection);
    });
  });

  describe('uploadPhotos', () => {
    let cloudinaryService: any;
    let inspectionRepo: any;
    let mayorOfficeRepo: any;

    beforeEach(() => {
      cloudinaryService = controller['cloudinaryService'];
      inspectionRepo = controller['inspectionRepo'];
      mayorOfficeRepo = controller['mayorOfficeRepo'];
    });

    it('should return message when no files provided', async () => {
      const result = await controller.uploadPhotos(1, [], 'antiguedadPhotos');

      expect(result).toEqual({ message: 'No files provided' });
    });

    it('should return message when files is undefined', async () => {
      const result = await controller.uploadPhotos(1, undefined as any, 'antiguedadPhotos');

      expect(result).toEqual({ message: 'No files provided' });
    });

    it('should upload photos successfully to antiguedadPhotos section', async () => {
      const mockFiles = [
        { originalname: 'photo1.jpg', buffer: Buffer.from('test') },
        { originalname: 'photo2.jpg', buffer: Buffer.from('test2') },
      ] as Express.Multer.File[];

      const mockInspectionWithAntiquity = {
        ...mockInspection,
        antiquity: { id: 1, photos: ['old-photo.jpg'] },
      };

      cloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/new-photo.jpg',
      });

      service.findOne.mockResolvedValue(mockInspectionWithAntiquity as any);
      inspectionRepo.manager.update = jest.fn().mockResolvedValue({});

      const result = await controller.uploadPhotos(1, mockFiles, 'antiguedadPhotos');

      expect(cloudinaryService.uploadImage).toHaveBeenCalledTimes(2);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFiles[0],
        'inspections/1/antiguedadPhotos',
      );
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.created).toBe(true);
      expect(result.message).toContain('Uploaded 2 photos');
    });

    it('should upload photos to mayorOfficePhotos section', async () => {
      const mockFiles = [
        { originalname: 'photo1.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      const mockInspectionWithMayorOffice = {
        ...mockInspection,
        mayorOffice: { id: 1, photos: [] },
      };

      cloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/mayor-photo.jpg',
      });

      service.findOne.mockResolvedValue(mockInspectionWithMayorOffice as any);
      mayorOfficeRepo.update.mockResolvedValue({});

      const result = await controller.uploadPhotos(1, mockFiles, 'mayorOfficePhotos');

      expect(cloudinaryService.uploadImage).toHaveBeenCalledTimes(1);
      expect(mayorOfficeRepo.update).toHaveBeenCalledWith(1, {
        photos: ['https://cloudinary.com/mayor-photo.jpg'],
      });
      expect(result.created).toBe(true);
    });

    it('should handle all section types', async () => {
      const sections = [
        'pcCancellationPhotos',
        'generalInspectionPhotos',
        'workReceiptPhotos',
        'constructionPhotos',
        'concessionPhotos',
      ];

      for (const section of sections) {
        const mockFiles = [
          { originalname: 'photo.jpg', buffer: Buffer.from('test') },
        ] as Express.Multer.File[];

        const entityName = section.replace('Photos', '');
        const mockInspectionWithEntity = {
          ...mockInspection,
          [entityName]: { id: 1, photos: [] },
        };

        cloudinaryService.uploadImage.mockResolvedValue({
          secure_url: `https://cloudinary.com/${section}.jpg`,
        });

        service.findOne.mockResolvedValue(mockInspectionWithEntity as any);
        inspectionRepo.manager.update = jest.fn().mockResolvedValue({});

        const result = await controller.uploadPhotos(1, mockFiles, section);

        expect(result.created).toBe(true);
        jest.clearAllMocks();
      }
    });

    it('should return error for unknown section', async () => {
      const mockFiles = [
        { originalname: 'photo.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      cloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/photo.jpg',
      });

      service.findOne.mockResolvedValue(mockInspection as any);

      const result = await controller.uploadPhotos(1, mockFiles, 'unknownSection');

      expect(result).toEqual({ message: 'Unknown section: unknownSection' });
    });

    it('should return error when section not found in inspection', async () => {
      const mockFiles = [
        { originalname: 'photo.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      cloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/photo.jpg',
      });

      const mockInspectionWithoutAntiquity = {
        ...mockInspection,
        antiquity: null,
      };

      service.findOne.mockResolvedValue(mockInspectionWithoutAntiquity as any);

      const result = await controller.uploadPhotos(1, mockFiles, 'antiguedadPhotos');

      expect(result).toEqual({
        message: 'Section antiguedadPhotos not found in inspection',
      });
    });

    it('should handle partial upload failures', async () => {
      const mockFiles = [
        { originalname: 'photo1.jpg', buffer: Buffer.from('test1') },
        { originalname: 'photo2.jpg', buffer: Buffer.from('test2') },
        { originalname: 'photo3.jpg', buffer: Buffer.from('test3') },
      ] as Express.Multer.File[];

      cloudinaryService.uploadImage
        .mockResolvedValueOnce({ secure_url: 'https://cloudinary.com/photo1.jpg' })
        .mockRejectedValueOnce(new Error('Upload failed'))
        .mockResolvedValueOnce({ secure_url: 'https://cloudinary.com/photo3.jpg' });

      const mockInspectionWithAntiquity = {
        ...mockInspection,
        antiquity: { id: 1, photos: [] },
      };

      service.findOne.mockResolvedValue(mockInspectionWithAntiquity as any);
      inspectionRepo.manager.update = jest.fn().mockResolvedValue({});

      const result = await controller.uploadPhotos(1, mockFiles, 'antiguedadPhotos');

      expect(result.message).toContain('Uploaded 2 photos, 1 failed');
      expect(result.created).toBe(true);
    });

    it('should handle all uploads failing', async () => {
      const mockFiles = [
        { originalname: 'photo1.jpg', buffer: Buffer.from('test1') },
        { originalname: 'photo2.jpg', buffer: Buffer.from('test2') },
      ] as Express.Multer.File[];

      cloudinaryService.uploadImage.mockRejectedValue(new Error('Upload failed'));

      const result = await controller.uploadPhotos(1, mockFiles, 'antiguedadPhotos');

      expect(result.message).toBe('Failed to upload any photos');
      expect(result.created).toBe(false);
    });

    it('should handle database save errors', async () => {
      const mockFiles = [
        { originalname: 'photo.jpg', buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      cloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/photo.jpg',
      });

      const mockInspectionWithAntiquity = {
        ...mockInspection,
        antiquity: { id: 1, photos: [] },
      };

      service.findOne.mockResolvedValue(mockInspectionWithAntiquity as any);
      inspectionRepo.manager.update = jest.fn().mockRejectedValue(new Error('DB Error'));

      const result = await controller.uploadPhotos(1, mockFiles, 'antiguedadPhotos');

      expect(result.message).toBe('Photos uploaded to Cloudinary but failed to save to database');
      expect(result.created).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });
});
