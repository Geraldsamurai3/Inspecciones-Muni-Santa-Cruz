import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, LessThan, Repository } from 'typeorm';
import { Inspection } from './Entities/inspections.entity';
import { In } from 'typeorm';
import { UpdateInspectionDto } from './DTO/update-inspection.dto';
import { CreateInspectionDto } from './DTO/create-inspection.dto';
import { User } from 'src/users/entities/user.entity';
import { InspectionStatus } from './Enums/inspection-status.enum';
import { Cron, CronExpression } from '@nestjs/schedule';


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


async create(dto: CreateInspectionDto): Promise<Inspection> {
  // Fuerza el overload correcto (entidad, no array)
  const inspection = this.inspectionRepo.create(
    dto as unknown as DeepPartial<Inspection>
  );

  // Estado inicial SIEMPRE "Nuevo" + sin marca de revisión
  inspection.status = InspectionStatus.NEW;
  inspection.reviewedAt = null;

  return this.inspectionRepo.save(inspection);
}
  async findAll(): Promise<Inspection[]> {
    return this.inspectionRepo.find({
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
      ],
    });
  }

  async findOne(id: number): Promise<Inspection> {
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
      ],
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
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

@Cron(CronExpression.EVERY_DAY_AT_3AM, { timeZone: 'America/Costa_Rica' })
async archiveReviewedOlderThan7Days() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  await this.inspectionRepo.update(
    { status: InspectionStatus.REVIEWED, reviewedAt: LessThan(cutoff) },
    { status: InspectionStatus.ARCHIVED },
  );
}



  async remove(id: number): Promise<void> {
    const inspection = await this.findOne(id);
    await this.inspectionRepo.remove(inspection);
  }
}
