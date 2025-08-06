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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    // req.user ya es el user “safe” que devolvió JwtStrategy.validate()
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

@Public()
@Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  if (!email) throw new BadRequestException('Email es requerido');

  const user = await this.usersService.findByEmail(email);
  if (!user) {
    return { message: 'Email de restablecimiento enviado' };
  }

  const rawToken = await this.usersService.generateResetToken(email);
  await this.emailService.sendResetPasswordEmail(
    email,
    rawToken,
    user.firstName,
    user.lastName,
  );
  return { message: 'Email de restablecimiento enviado' };
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
    await this.usersService.resetPassword(token, newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  @UseGuards(JwtAuthGuard)
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
