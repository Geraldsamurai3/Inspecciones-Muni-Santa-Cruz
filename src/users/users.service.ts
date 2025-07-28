// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

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

 async findByEmail(email: string): Promise<User | undefined> {
  const user = await this.repo.findOne({ where: { email } });
  return user ?? undefined;
}

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, dto, { password: undefined });
    return this.repo.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
