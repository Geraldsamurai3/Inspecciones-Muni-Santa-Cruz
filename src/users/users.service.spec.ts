import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mockedRandomToken'),
  }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mockedHashedToken'),
  }),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        cedula: '123456789',
        role: 'inspector',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        cedula: '123456789',
        role: 'inspector',
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
        },
        {
          id: 2,
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
        },
      ];

      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'UpdatedName',
      };

      const existingUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'oldHash',
      };

      const updatedUser = {
        ...existingUser,
        firstName: 'UpdatedName',
      };

      mockRepository.findOneBy.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('UpdatedName');
    });

    it('should update password if provided', async () => {
      const updateDto = {
        password: 'newPassword123',
      };

      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'oldHash',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockRepository.findOneBy.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({
        ...existingUser,
        passwordHash: 'newHashedPassword',
      });

      await service.update(1, updateDto as any);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('generateResetToken', () => {
    it('should generate and save a reset token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        resetToken: null,
        resetTokenExpires: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        resetToken: 'mockedHashedToken',
        resetTokenExpires: expect.any(Number),
      });

      const token = await service.generateResetToken('test@example.com');

      expect(token).toBe('mockedRandomToken');
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateResetToken('nonexistent@example.com')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setResetToken', () => {
    it('should set reset token for a user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        resetToken: null,
        resetTokenExpires: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      await service.setResetToken('test@example.com', 'token123', 1200000);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setResetToken('nonexistent@example.com', 'token', 1200000)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        resetToken: 'mockedHashedToken',
        resetTokenExpires: Date.now() + 1000000,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue({
        ...mockUser,
        passwordHash: 'newHashedPassword',
        resetToken: null,
        resetTokenExpires: null,
      });

      await service.resetPassword('validToken', 'newPassword123');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
