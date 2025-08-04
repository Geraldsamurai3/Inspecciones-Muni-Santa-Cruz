// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create({
      email: dto.email,
      passwordHash: await bcrypt.hash(dto.password, 10),
      firstName: dto.firstName,
      lastName: dto.lastName,
      secondLastName: dto.secondLastName,
      cedula: (dto as any).cedula,
      phone: dto.phone,
      role: dto.role || 'inspector',
    });
    return this.repo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { email } });
    return user ?? null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await this.repo.findOne({ where: { resetToken: token } });
    return user ?? null;
  }


  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if ((dto as any).password) {
      user.passwordHash = await bcrypt.hash((dto as any).password, 10);
    }
    Object.assign(user, dto, { password: undefined });
    return this.repo.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

   private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async generateResetToken(email: string): Promise<string> {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const rawToken = randomBytes(32).toString('hex');
    user.resetToken = this.hashToken(rawToken);
    user.resetTokenExpires = Date.now() + 20 * 60 * 1000; 
    await this.repo.save(user);
    return rawToken;
  }


  async setResetToken(email: string, token: string, expiresMs: number): Promise<void> {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.resetToken = this.hashToken(token);
    user.resetTokenExpires = Date.now() + expiresMs;
    await this.repo.save(user);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashed = this.hashToken(token);
    const user = await this.repo.findOne({ where: { resetToken: hashed } });

    if (
      !user ||
      !user.resetTokenExpires ||
      Date.now() > user.resetTokenExpires
    ) {
      throw new BadRequestException('Token inválido o expirado');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await this.repo.save(user);
  }

   async block(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.isBlocked = !user.isBlocked;  
    return this.repo.save(user);
  }


}