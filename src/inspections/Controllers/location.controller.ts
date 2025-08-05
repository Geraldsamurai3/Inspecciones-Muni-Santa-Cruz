import { Controller, Post, Body, Get } from '@nestjs/common';
import { LocationService } from '../Services/location.service';
import { CreateLocationDto } from '../DTO/create-location.dto';
import { Location } from '../Entities/location.entity';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // Crear una nueva ubicación
  @Post()
  async create(@Body() createLocationDto: CreateLocationDto): Promise<Location> {
    return this.locationService.create(createLocationDto);
  }

  // Obtener todas las ubicaciones registradas
  @Get()
  async findAll(): Promise<Location[]> {
    return this.locationService.findAll();
  }
}
