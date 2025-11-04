// src/email/email.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService }                            from '@nestjs/config';
import * as nodemailer                               from 'nodemailer';
import { join }                                     from 'path';
import * as hbs from 'nodemailer-express-handlebars';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
  host: this.config.get<string>('SMTP_HOST'),
  port: this.config.get<number>('SMTP_PORT'),           
  secure: this.config.get<number>('SMTP_PORT') === 465,  
  auth: {
    user: this.config.get<string>('SMTP_USER'),
    pass: this.config.get<string>('SMTP_PASS'),
  },
  // para STARTTLS en 587
  ...(this.config.get<number>('SMTP_PORT') === 587
    ? { requireTLS: true }
    : {}),
  tls: { rejectUnauthorized: false },
  // Timeouts para evitar esperas largas
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,   // 10 segundos
  socketTimeout: 15000,     // 15 segundos
});

    const templatesRoot = join(process.cwd(), 'src', 'email', 'templates');

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
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
        context: { firstName },
      }as any, );
      return { messageId: (info as any).messageId };
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
    console.log('📧 Intentando enviar email a:', to);
    
    const from = this.config.get<string>('EMAIL_FROM');
    if (!from) throw new InternalServerErrorException('EMAIL_FROM no está configurado');

    const frontendRaw = this.config.get<string>('FRONTEND_URL');
    if (!frontendRaw) throw new InternalServerErrorException('FRONTEND_URL no está configurado');

    const frontend = frontendRaw.replace(/\/$/, '');
    const url = new URL('/admin/reset-password', frontend);
    url.searchParams.set('token', token);
    const resetLink = url.toString();

    console.log('📧 Configuración SMTP:', {
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      user: this.config.get<string>('SMTP_USER'),
      from,
    });

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
    
    console.log('✅ Email enviado exitosamente. MessageId:', (info as any).messageId);
    return { messageId: (info as any).messageId };
  } catch (err: any) {
    console.error('❌ Error completo al enviar email:', {
      name: err.name,
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });
    throw new InternalServerErrorException(
      'Error enviando email de restablecimiento: ' + err.message,
    );
  }
}


}
