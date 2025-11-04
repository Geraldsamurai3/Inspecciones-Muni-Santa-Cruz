// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@Req() req: any) {
    // req.user ya es el user "safe" que devolvió JwtStrategy.validate()
    return req.user
  }

  @Get(':id') 
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

@Public()
@Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  if (!email) {
    throw new BadRequestException('Email es requerido');
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestException('Formato de email inválido');
  }

  // Verificar si el usuario existe
  const user = await this.usersService.findByEmail(email);
  if (!user) {
    throw new BadRequestException('El email no está registrado en el sistema');
  }

  // Verificar que el usuario no esté bloqueado
  if (user.isBlocked) {
    throw new BadRequestException('La cuenta está bloqueada. Contacta al administrador.');
  }

  try {
    const rawToken = await this.usersService.generateResetToken(email);
    await this.emailService.sendResetPasswordEmail(
      email,
      rawToken,
      user.firstName,
      user.lastName,
    );
    return { message: 'Email de restablecimiento enviado' };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new BadRequestException('Error al enviar el email. Inténtalo más tarde.');
  }
}


  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!token || !newPassword) {
      throw new BadRequestException('Token y nueva contraseña son requeridos');
    }

    // Validar longitud mínima de la contraseña
    if (newPassword.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
    }

    await this.usersService.resetPassword(token, newPassword);
    
    // IMPORTANTE: Después de cambiar la contraseña, el usuario debe hacer login nuevamente
    return { 
      message: 'Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.',
      requiresLogin: true 
    };
  }

  @Patch(':id/block')
  async blockUser(
    @Param('id', ParseIntPipe) id: number,
  ) {
    const updated = await this.usersService.block(id);
    return {
      id: updated.id,
      isBlocked: updated.isBlocked,
      message: updated.isBlocked
        ? 'Usuario bloqueado'
        : 'Usuario desbloqueado',
    };
  }

}
