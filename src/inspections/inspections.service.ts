import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, LessThan, Repository } from 'typeorm';
import { Inspection } from './Entities/inspections.entity';
import { In } from 'typeorm';
import { UpdateInspectionDto } from './DTO/update-inspection.dto';
import { CreateInspectionDto } from './DTO/create-inspection.dto';
import { User } from 'src/users/entities/user.entity';
import { InspectionStatus } from './Enums/inspection-status.enum';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class InspectionService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}


   private async resolveInspectors(ids?: number[]): Promise<User[]> {
    if (!ids || ids.length === 0) return [];
    const users = await this.userRepo.findBy({ id: In(ids) });

    // (Opcional) Si quieres ser estricto con IDs inválidos, descomenta:
    // if (users.length !== ids.length) {
    //   throw new BadRequestException('Algunos inspectorIds no existen');
    // }

    return users;
  }

  // Métodos privados para sanitizar datos sensibles de los inspectores
  private sanitizeInspection(inspection: Inspection): any {
    if (!inspection) return inspection;
    
    const sanitized = { ...inspection };
    if (sanitized.inspectors) {
      sanitized.inspectors = sanitized.inspectors.map((inspector: any) => inspector.toSafeObject());
    }
    
    return sanitized;
  }

  private sanitizeInspections(inspections: Inspection[]): any[] {
    return inspections.map(inspection => this.sanitizeInspection(inspection));
  }



async create(dto: CreateInspectionDto): Promise<any> {
  // Resolver inspectorIds a entidades User
  const inspectors = await this.resolveInspectors(dto.inspectorIds);

  // ✨ MANEJO ESPECIAL para ZMT: Si vienen concessionParcels separadas,
  // las anidamos dentro de concession.parcels para que cascade funcione
  const dtoToCreate = { ...dto } as any;
  
  if (dtoToCreate.concession && dtoToCreate.concessionParcels) {
    // Anidar parcelas dentro de concession para cascade
    dtoToCreate.concession = {
      ...dtoToCreate.concession,
      parcels: dtoToCreate.concessionParcels
    };
    // Eliminar concessionParcels del nivel raíz
    delete dtoToCreate.concessionParcels;
  }

  // Fuerza el overload correcto (entidad, no array)
  const inspection = this.inspectionRepo.create(
    dtoToCreate as unknown as DeepPartial<Inspection>
  );

  // Asignar inspectores resueltos
  inspection.inspectors = inspectors;

  // Estado inicial SIEMPRE "Nuevo" + sin marca de revisión
  inspection.status = InspectionStatus.NEW;
  inspection.reviewedAt = null;

  const saved = await this.inspectionRepo.save(inspection);
  
  // Cargar la inspección completa con relaciones para sanitizar
  const fullInspection = await this.findOne(saved.id);
  return fullInspection;
}
  async findAll(): Promise<any[]> {
    const inspections = await this.inspectionRepo.find({
      where: { deletedAt: IsNull() }, // Excluir inspecciones en papelera
      relations: [
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'taxProcedure',
        'mayorOffice',
        'antiquity',
        'location',
        'landUse',
        'concession',
        'concession.parcels',
        'inspectors',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
    });

    return this.sanitizeInspections(inspections);
  }

  // NUEVO: Obtener solo las inspecciones en papelera
  async findTrashed(): Promise<any[]> {
    const inspections = await this.inspectionRepo.find({
      where: { status: InspectionStatus.TRASHED },
      relations: [
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'taxProcedure',
        'mayorOffice',
        'antiquity',
        'location',
        'landUse',
        'concession',
        'concession.parcels',
        'inspectors',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
    });

    return this.sanitizeInspections(inspections);
  }

  async findOne(id: number): Promise<any> {
    const inspection = await this.inspectionRepo.findOne({
      where: { id },
      relations: [
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'taxProcedure',
        'mayorOffice',
        'antiquity',
        'location',
        'landUse',
        'concession',
        'concession.parcels',
        'inspectors',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return this.sanitizeInspection(inspection);
  }

 async update(id: number, dto: UpdateInspectionDto): Promise<Inspection> {
  const inspection = await this.findOne(id);

  // separamos status para tratarlo a mano; el resto se mantiene como hoy
  const { status, ...rest } = dto as any;

  if (status) {
    // si intentan archivar manualmente, lo bloqueamos (opcional)
    if (status === InspectionStatus.ARCHIVED) {
      throw new BadRequestException(
        'El estado "Archivado" lo asigna automáticamente el sistema.'
      );
    }

    // Prevenir cambio directo a TRASHED (debe usar endpoint específico)
    if (status === InspectionStatus.TRASHED) {
      throw new BadRequestException(
        'Usa el endpoint /inspections/:id/trash para mover a la papelera.'
      );
    }

    // si pasa a Revisado, sellamos la fecha
    if (status === InspectionStatus.REVIEWED && !inspection.reviewedAt) {
      inspection.reviewedAt = new Date();
    }

    // si sale de Revisado, limpiamos la marca
    if (inspection.status === InspectionStatus.REVIEWED && status !== InspectionStatus.REVIEWED) {
      inspection.reviewedAt = null;
    }

    inspection.status = status;
  }

  // todo lo demás sigue igual que antes
  Object.assign(inspection, rest);

  return this.inspectionRepo.save(inspection);
}

  // NUEVO: Mover a papelera (soft delete)
  async moveToTrash(id: number): Promise<any> {
    const inspection = await this.inspectionRepo.findOne({ where: { id } });
    
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    if (inspection.status === InspectionStatus.TRASHED) {
      throw new BadRequestException('La inspección ya está en la papelera');
    }

    inspection.status = InspectionStatus.TRASHED;
    inspection.deletedAt = new Date();

    await this.inspectionRepo.save(inspection);

    return {
      message: 'Inspección movida a la papelera',
      id: inspection.id,
      deletedAt: inspection.deletedAt
    };
  }

  // NUEVO: Restaurar de papelera
  async restoreFromTrash(id: number): Promise<any> {
    const inspection = await this.inspectionRepo.findOne({ where: { id } });
    
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    if (inspection.status !== InspectionStatus.TRASHED) {
      throw new BadRequestException('La inspección no está en la papelera');
    }

    inspection.status = InspectionStatus.NEW; // Restaurar como "Nuevo"
    inspection.deletedAt = null;

    await this.inspectionRepo.save(inspection);

    return {
      message: 'Inspección restaurada desde la papelera',
      id: inspection.id,
      status: inspection.status
    };
  }

  // NOTA: No se implementa eliminación permanente de datos
  // Los datos siempre se mantienen en la base de datos para auditoría e historial
  // El campo 'deletedAt' registra cuándo se movió a papelera
  // Si necesitas "eliminar" una inspección, usa moveToTrash() que hace soft delete

@Cron('0 0 */5 * * *', { timeZone: 'America/Costa_Rica' })
async archiveReviewedOlderThan7Days() {
  console.log('🕐 Ejecutando cron para archivar inspecciones revisadas hace más de 7 días...');
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const result = await this.inspectionRepo.update(
    { status: InspectionStatus.REVIEWED, reviewedAt: LessThan(cutoff) },
    { status: InspectionStatus.ARCHIVED },
  );

  console.log(`✅ Cron completado. ${result.affected || 0} inspecciones archivadas.`);
}



  async remove(id: number): Promise<void> {
    const inspection = await this.findOne(id);
    await this.inspectionRepo.remove(inspection);
  }
}
