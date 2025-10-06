import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { CLOUDINARY } from './cloudinary.provider';
import { InternalServerErrorException } from '@nestjs/common';

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let mockCloudinary: any;

  beforeEach(async () => {
    mockCloudinary = {
      uploader: {
        upload_stream: jest.fn(),
        destroy: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: CLOUDINARY,
          useValue: mockCloudinary,
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockResult = {
        public_id: 'folder/test-image',
        secure_url: 'https://cloudinary.com/image.jpg',
        width: 800,
        height: 600,
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, mockResult);
        return {
          end: jest.fn(),
        };
      });

      const result = await service.uploadImage(mockFile, 'test-folder');

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { folder: 'test-folder', resource_type: 'image' },
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw InternalServerErrorException on upload error', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(new Error('Upload failed'), null);
        return {
          end: jest.fn(),
        };
      });

      await expect(service.uploadImage(mockFile, 'test-folder')).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.uploadImage(mockFile, 'test-folder')).rejects.toThrow('Upload failed');
    });

    it('should throw InternalServerErrorException when no result returned', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
      } as Express.Multer.File;

      mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, null);
        return {
          end: jest.fn(),
        };
      });

      await expect(service.uploadImage(mockFile, 'test-folder')).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.uploadImage(mockFile, 'test-folder')).rejects.toThrow(
        'No response from Cloudinary'
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      const mockResult = {
        result: 'ok',
      };

      mockCloudinary.uploader.destroy.mockImplementation((publicId, callback) => {
        callback(null, mockResult);
      });

      const result = await service.deleteImage('folder/test-image');

      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
        'folder/test-image',
        expect.any(Function)
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw InternalServerErrorException on delete error', async () => {
      mockCloudinary.uploader.destroy.mockImplementation((publicId, callback) => {
        callback(new Error('Delete failed'), null);
      });

      await expect(service.deleteImage('folder/test-image')).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.deleteImage('folder/test-image')).rejects.toThrow('Delete failed');
    });

    it('should throw InternalServerErrorException when no result returned', async () => {
      mockCloudinary.uploader.destroy.mockImplementation((publicId, callback) => {
        callback(null, null);
      });

      await expect(service.deleteImage('folder/test-image')).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.deleteImage('folder/test-image')).rejects.toThrow(
        'No response from Cloudinary'
      );
    });
  });
});
