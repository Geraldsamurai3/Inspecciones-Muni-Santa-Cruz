jest.mock('nodemailer-express-handlebars', () => {
  return jest.fn(() => jest.fn());
});

import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

describe('EmailController', () => {
  let controller: EmailController;
  let service: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
            sendResetPasswordEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    service = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /email/welcome', () => {
    it('should send welcome email', async () => {
      const dto = { to: 'user@example.com', firstName: 'John' };
      service.sendWelcomeEmail.mockResolvedValue({ messageId: 'msg-123' } as any);

      const result = await controller.sendWelcome(dto);

      expect(service.sendWelcomeEmail).toHaveBeenCalledWith('user@example.com', 'John');
      expect(result).toEqual({ success: true, messageId: 'msg-123' });
    });
  });

  describe('POST /email/reset-password', () => {
    it('should send reset password email', async () => {
      const dto = { to: 'user@example.com', token: 'reset-token-123' };
      service.sendResetPasswordEmail.mockResolvedValue({ messageId: 'msg-456' } as any);

      const result = await controller.sendReset(dto);

      expect(service.sendResetPasswordEmail).toHaveBeenCalledWith('user@example.com', 'reset-token-123');
      expect(result).toEqual({ success: true, messageId: 'msg-456' });
    });
  });
});
