// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService, 
    private readonly jwtService: JwtService,
  ) {}

async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new UnauthorizedException('Credenciales inválidas');

  const passwordMatches = await bcrypt.compare(pass, user.passwordHash);
  if (!passwordMatches)
    throw new UnauthorizedException('Credenciales inválidas');

  if (user.isBlocked)
    throw new ForbiddenException('Tu cuenta está bloqueada');

  const { passwordHash, resetToken, resetTokenExpires, ...payload } = user;
  return payload; 
}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
