// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Request,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)           // todas las rutas requieren JWT
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  async findAll(@Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
    return this.svc.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
    return this.svc.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
    return this.svc.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException();
    return this.svc.remove(id);
  }
}
