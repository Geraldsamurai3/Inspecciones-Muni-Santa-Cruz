import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

// Mock nodemailer-express-handlebars
jest.mock('nodemailer-express-handlebars', () => {
  return jest.fn(() => jest.fn());
});

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;

  const mockTransporter = {
    sendMail: jest.fn(),
    use: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: 587,
                SMTP_USER: 'test@example.com',
                SMTP_PASS: 'password',
                EMAIL_FROM: 'noreply@example.com',
                FRONTEND_URL: 'https://example.com',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);

    // Mock the transporter
    (service as any).transporter = mockTransporter;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendWelcomeEmail('user@example.com', 'John');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'user@example.com',
          subject: '¡Bienvenido a Inspecciones Santa Cruz!',
          template: 'welcome',
          context: { firstName: 'John' },
        })
      );
      expect(result).toEqual({ messageId: 'test-message-id' });
    });

    it('should throw InternalServerErrorException on failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(service.sendWelcomeEmail('user@example.com', 'John')).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.sendWelcomeEmail('user@example.com', 'John')).rejects.toThrow(
        'Error enviando email de bienvenida'
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send a reset password email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reset-message-id' });

      const result = await service.sendResetPasswordEmail(
        'user@example.com',
        'reset-token-123',
        'John',
        'Doe'
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'user@example.com',
          subject: 'Restablece tu contraseña',
          template: 'reset-password',
          context: expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            expiresIn: '20 minutos',
          }),
        })
      );
      expect(result).toEqual({ messageId: 'reset-message-id' });
    });

    it('should generate correct reset link with token', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reset-message-id' });

      await service.sendResetPasswordEmail('user@example.com', 'my-token', 'John');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.context.resetLink).toContain('token=my-token');
      expect(callArgs.context.resetLink).toContain('/admin/reset-password');
    });

    it('should throw InternalServerErrorException if EMAIL_FROM not configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'EMAIL_FROM') return undefined;
        if (key === 'FRONTEND_URL') return 'https://example.com';
        return 'value';
      });

      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow('EMAIL_FROM no está configurado');
    });

    it('should throw InternalServerErrorException if FRONTEND_URL not configured', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'EMAIL_FROM') return 'noreply@example.com';
        if (key === 'FRONTEND_URL') return undefined;
        return 'value';
      });

      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow('FRONTEND_URL no está configurado');
    });

    it('should throw InternalServerErrorException on SMTP failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.sendResetPasswordEmail('user@example.com', 'token', 'John')
      ).rejects.toThrow('Error enviando email de restablecimiento');
    });

    it('should handle optional firstName and lastName', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-id' });

      await service.sendResetPasswordEmail('user@example.com', 'token');

      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.context.firstName).toBe('');
      expect(callArgs.context.lastName).toBe('');
    });
  });
});
