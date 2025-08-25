// src/email/email.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService }                            from '@nestjs/config';
import * as nodemailer                               from 'nodemailer';
 import * as hbs from 'nodemailer-handlebars'; // 
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

  async sendWelcomeEmail(
    to: string, 
    firstName: string,
    lastName?: string) {
    try {
      const from = this.config.get<string>('EMAIL_FROM');
      const info = await this.transporter.sendMail({
        from,
        to,
        subject: '¡Bienvenido a Inspecciones Santa Cruz!',
        template: 'welcome',
<<<<<<< HEAD
        context: {
       firstName: firstName ?? '',
        lastName: lastName ?? '',
        year: new Date().getFullYear(),
         },
      });
      return { messageId: info.messageId };
=======
        context: { firstName },
      }as any, );
      return { messageId: (info as any).messageId };
>>>>>>> Alejo
    } catch (err) {
      throw new InternalServerErrorException(
        'Error enviando email de bienvenida: ' + err.message,
      );
    }
  }

async sendResetPasswordEmail(
  to: string,
  token: string,
  firstName?: string,
  lastName?: string,
) {
  try {
    const from = this.config.get<string>('EMAIL_FROM');
    if (!from) throw new InternalServerErrorException('EMAIL_FROM no está configurado');

    const frontendRaw = this.config.get<string>('FRONTEND_URL');
    if (!frontendRaw) throw new InternalServerErrorException('FRONTEND_URL no está configurado');

    const frontend = frontendRaw.replace(/\/$/, '');
    const url = new URL('/admin/reset-password', frontend);
    url.searchParams.set('token', token);
    const resetLink = url.toString();

    console.log('[DEBUG] Enviando link de reset:', resetLink, 'firstName=', firstName, 'lastName=', lastName);

    const info = await this.transporter.sendMail({
      from,
      to,
      subject: 'Restablece tu contraseña',
      template: 'reset-password',
      context: {
        resetLink,
        expiresIn: '20 minutos',
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        year: new Date().getFullYear(),
      },
    }as any, );
    return { messageId: (info as any).messageId };
  } catch (err: any) {
    throw new InternalServerErrorException(
      'Error enviando email de restablecimiento: ' + err.message,
    );
  }
}


}
