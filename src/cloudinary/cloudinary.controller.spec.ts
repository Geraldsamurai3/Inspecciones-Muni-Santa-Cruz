import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryController', () => {
  let controller: CloudinaryController;
  let service: jest.Mocked<CloudinaryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinaryController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CloudinaryController>(CloudinaryController);
    service = module.get(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload', () => {
    it('should upload a file', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      } as Express.Multer.File;

      const mockResult = {
        public_id: 'folder/test',
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      service.uploadImage.mockResolvedValue(mockResult as any);

      const result = await controller.upload(mockFile, 'test-folder');

      expect(service.uploadImage).toHaveBeenCalledWith(mockFile, 'test-folder');
      expect(result).toEqual(mockResult);
    });
  });

  describe('destroy', () => {
    it('should delete an image', async () => {
      const mockResult = { result: 'ok' };
      service.deleteImage.mockResolvedValue(mockResult);

      const result = await controller.destroy('folder/test-image');

      expect(service.deleteImage).toHaveBeenCalledWith('folder/test-image');
      expect(result).toEqual(mockResult);
    });
  });
});
