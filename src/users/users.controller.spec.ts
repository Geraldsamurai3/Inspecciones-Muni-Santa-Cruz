import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'USER',
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            generateResetToken: jest.fn(),
            resetPassword: jest.fn(),
            block: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendResetPasswordEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      usersService.findAll.mockResolvedValue([mockUser] as any);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const req = { user: mockUser };

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      usersService.findOne.mockResolvedValue(mockUser as any);

      const result = await controller.findOne(1);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        cedula: '123456789',
      };
      usersService.create.mockResolvedValue({ ...mockUser, ...createDto } as any);

      const result = await controller.create(createDto as any);

      expect(usersService.create).toHaveBeenCalledWith(createDto);
      expect(result.email).toBe(createDto.email);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto = { firstName: 'Johnny' };
      usersService.update.mockResolvedValue({ ...mockUser, firstName: 'Johnny' } as any);

      const result = await controller.update(1, updateDto as any);

      expect(usersService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.firstName).toBe('Johnny');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(usersService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('forgotPassword', () => {
    it('should send reset password email', async () => {
      const email = 'john@example.com';
      const token = 'reset-token-123';

      usersService.findByEmail.mockResolvedValue(mockUser as any);
      usersService.generateResetToken.mockResolvedValue(token);
      emailService.sendResetPasswordEmail.mockResolvedValue({ messageId: 'msg-123' } as any);

      const result = await controller.forgotPassword(email);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.generateResetToken).toHaveBeenCalledWith(email);
      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        email,
        token,
        mockUser.firstName,
        mockUser.lastName
      );
      expect(result).toEqual({ message: 'Email de restablecimiento enviado' });
    });

    it('should throw BadRequestException if email is missing', async () => {
      await expect(controller.forgotPassword('')).rejects.toThrow(BadRequestException);
      await expect(controller.forgotPassword('')).rejects.toThrow('Email es requerido');
    });

    it('should throw BadRequestException if email format is invalid', async () => {
      await expect(controller.forgotPassword('invalid-email')).rejects.toThrow(BadRequestException);
      await expect(controller.forgotPassword('invalid-email')).rejects.toThrow('Formato de email inválido');
    });

    it('should throw BadRequestException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(controller.forgotPassword('notfound@example.com')).rejects.toThrow(BadRequestException);
      await expect(controller.forgotPassword('notfound@example.com')).rejects.toThrow(
        'El email no está registrado en el sistema'
      );
    });

    it('should throw BadRequestException if user is blocked', async () => {
      const blockedUser = { ...mockUser, isBlocked: true };
      usersService.findByEmail.mockResolvedValue(blockedUser as any);

      await expect(controller.forgotPassword('john@example.com')).rejects.toThrow(BadRequestException);
      await expect(controller.forgotPassword('john@example.com')).rejects.toThrow(
        'La cuenta está bloqueada. Contacta al administrador.'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword123';

      usersService.resetPassword.mockResolvedValue(undefined);

      const result = await controller.resetPassword(token, newPassword);

      expect(usersService.resetPassword).toHaveBeenCalledWith(token, newPassword);
      expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
    });

    it('should throw BadRequestException if token or password is missing', async () => {
      await expect(controller.resetPassword('', 'password')).rejects.toThrow(BadRequestException);
      await expect(controller.resetPassword('token', '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('blockUser', () => {
    it('should block a user', async () => {
      const blockedUser = { ...mockUser, isBlocked: true };
      usersService.block.mockResolvedValue(blockedUser as any);

      const result = await controller.blockUser(1);

      expect(usersService.block).toHaveBeenCalledWith(1);
      expect(result.isBlocked).toBe(true);
      expect(result.message).toBe('Usuario bloqueado');
    });

    it('should unblock a user', async () => {
      const unblockedUser = { ...mockUser, isBlocked: false };
      usersService.block.mockResolvedValue(unblockedUser as any);

      const result = await controller.blockUser(1);

      expect(result.isBlocked).toBe(false);
      expect(result.message).toBe('Usuario desbloqueado');
    });
  });
});
