import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  Patch,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { InspectionService } from './inspections.service';
import { CreateInspectionDto } from './DTO/create-inspection.dto';
import { UpdateInspectionDto } from './DTO/update-inspection.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Importa CloudinaryService
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './Entities/inspections.entity';
import { MayorOffice } from './Entities/mayor-office.entity';
import { Antiquity } from './Entities/antiquity.entity';
import { PcCancellation } from './Entities/pcCancellation.entity';
import { GeneralInspection } from './Entities/generalInspection.entity';
import { WorkReceipt } from './Entities/workReceipt.entity';
import { Construction } from './Entities/construction.entity';
import { Concession } from './Entities/zmt.consession.enity';
import { UpdateStatusDto } from './DTO/update-status.dto';

@Controller('inspections')
export class InspectionController {
  constructor(
    private readonly service: InspectionService,
    private readonly cloudinaryService: CloudinaryService, // Inyecta CloudinaryService
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(MayorOffice)
    private readonly mayorOfficeRepo: Repository<MayorOffice>,
  ) {}

  @Post()
  create(@Body() dto: CreateInspectionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // NUEVO: Obtener inspecciones en papelera
  @Get('trash/list')
  findTrashed() {
    return this.service.findTrashed();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspectionDto,
  ) {
    return this.service.update(id, dto);
  }


// NUEVO: PATCH genérico (parcial). Reusa la misma lógica de service.update
  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInspectionDto,
  ) {
    return this.service.update(id, dto);
  }

  // NUEVO: PATCH específico SOLO para estado
  @Patch(':id/status')
  patchStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() { status }: UpdateStatusDto,
  ) {
    // Reutilizamos el mismo update del service para mantener una sola lógica
    return this.service.update(id, { status } as UpdateInspectionDto);
  }

  // NUEVO: Mover a papelera
  @Patch(':id/trash')
  moveToTrash(@Param('id', ParseIntPipe) id: number) {
    return this.service.moveToTrash(id);
  }

  // NUEVO: Restaurar de papelera
  @Patch(':id/restore')
  restoreFromTrash(@Param('id', ParseIntPipe) id: number) {
    return this.service.restoreFromTrash(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  // NOTA: No se implementa endpoint de eliminación permanente
  // Los datos siempre se mantienen para auditoría e historial
  // Para "eliminar" inspecciones usa: PATCH /inspections/:id/trash

  // Nuevo endpoint para subir fotos
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('section') section: string,
  ) {
    if (!files || files.length === 0) {
      return { message: 'No files provided' };
    }

    const folder = `inspections/${id}/${section}`;
    const uploadPromises = files.map(file => 
      this.cloudinaryService.uploadImage(file, folder)
    );

    const results = await Promise.allSettled(uploadPromises);

    const successfulUploads = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);

    const failedUploads = results.filter(result => result.status === 'rejected');

    if (successfulUploads.length === 0) {
      return {
        message: 'Failed to upload any photos',
        errors: failedUploads.map(f => f.reason),
        created: false,
      };
    }

    const urls = successfulUploads.map(r => r.secure_url);

    try {
      const inspection = await this.service.findOne(id);

      let entity;
      let entityClass;
      switch (section) {
        case 'antiguedadPhotos':
          entity = inspection.antiquity;
          entityClass = Antiquity;
          break;
        case 'pcCancellationPhotos':
          entity = inspection.pcCancellation;
          entityClass = PcCancellation;
          break;
        case 'generalInspectionPhotos':
          entity = inspection.generalInspection;
          entityClass = GeneralInspection;
          break;
        case 'workReceiptPhotos':
          entity = inspection.workReceipt;
          entityClass = WorkReceipt;
          break;
        case 'mayorOfficePhotos':
          entity = inspection.mayorOffice;
          entityClass = MayorOffice;
          break;
        case 'constructionPhotos':
          entity = inspection.construction;
          entityClass = Construction;
          break;
        case 'concessionPhotos':
          entity = inspection.concession;
          entityClass = Concession;
          break;
        default:
          return { message: `Unknown section: ${section}` };
      }

      if (!entity) {
        return { message: `Section ${section} not found in inspection` };
      }

      const newPhotos = [...(entity.photos || []), ...urls];
      if (entityClass === MayorOffice) {
        await this.mayorOfficeRepo.update(entity.id, { photos: newPhotos });
      } else {
        await this.inspectionRepo.manager.update(entityClass, entity.id, { photos: newPhotos });
      }

      return {
        message: `Uploaded ${successfulUploads.length} photos, ${failedUploads.length} failed`,
        urls,
        created: true,
      };
    } catch (error) {
      console.log('Error saving:', error);
      return {
        message: 'Photos uploaded to Cloudinary but failed to save to database',
        urls,
        created: false,
        error: error.message,
      };
    }
  }
}