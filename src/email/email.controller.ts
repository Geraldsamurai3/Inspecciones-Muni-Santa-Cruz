// src/email/email.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

class WelcomeEmailDto {
  to: string;
  firstName: string;
}

class ResetPasswordEmailDto {
  to: string;
  token: string;
}

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * POST /email/welcome
   * Body: { to: string; firstName: string; }
   */
  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  async sendWelcome(@Body() dto: WelcomeEmailDto) {
    const result = await this.emailService.sendWelcomeEmail(dto.to, dto.firstName);
    return { success: true, ...result };
  }

  /**
   * POST /email/reset-password
   * Body: { to: string; token: string; }
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async sendReset(@Body() dto: ResetPasswordEmailDto) {
    const result = await this.emailService.sendResetPasswordEmail(dto.to, dto.token);
    return { success: true, ...result };
  }
}
