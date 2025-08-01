// src/email/email.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService }                            from '@nestjs/config';
import * as nodemailer                               from 'nodemailer';
import hbs                                           from 'nodemailer-express-handlebars';
import { join }                                     from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
  host: this.config.get<string>('SMTP_HOST'),
  port: this.config.get<number>('SMTP_PORT'),           // e.g. 465 o 587
  secure: this.config.get<number>('SMTP_PORT') === 465,  // true solo en 465
  auth: {
    user: this.config.get<string>('SMTP_USER'),
    pass: this.config.get<string>('SMTP_PASS'),
  },
  // para STARTTLS en 587
  ...(this.config.get<number>('SMTP_PORT') === 587
    ? { requireTLS: true }
    : {}),
  // opcional, relaja verificación de certificado auto‑firmado
  tls: { rejectUnauthorized: false },
});

    // Configurar Handlebars como motor de plantillas
    const templatesRoot = join(process.cwd(), 'src', 'email', 'templates');

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extName: '.hbs',
          layoutsDir: join(templatesRoot, 'layouts'),
          partialsDir: join(templatesRoot, 'partials'),
          defaultLayout: false,
        },
        viewPath: templatesRoot,
        extName: '.hbs',
      }),
    );
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    try {
      const from = this.config.get<string>('EMAIL_FROM');
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: '¡Bienvenido a Inspecciones Santa Cruz!',
        template: 'welcome',
        context: { firstName },
      });
      return { messageId: info.messageId };
    } catch (err) {
      throw new InternalServerErrorException(
        'Error enviando email de bienvenida: ' + err.message,
      );
    }
  }

  async sendResetPasswordEmail(to: string, token: string) {
    try {
      const from = this.config.get<string>('EMAIL_FROM');
      const frontend = this.config.get<string>('FRONTEND_URL');
      const resetLink = `${frontend}/reset-password?token=${token}`;
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: 'Restablece tu contraseña',
        template: 'reset-password',
        context: { resetLink },
      });
      return { messageId: info.messageId };
    } catch (err) {
      throw new InternalServerErrorException(
        'Error enviando email de restablecimiento: ' + err.message,
      );
    }
  }
}
