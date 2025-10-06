import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Inspection } from '../inspections/Entities/inspections.entity';
import { User } from '../users/entities/user.entity';
import { InspectionStatus } from '../inspections/Enums/inspection-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Dashboard para Inspectores
   * Muestra sus propias inspecciones y estadísticas personales
   */
  async getInspectorDashboard(userId: number) {
    // Obtener el usuario
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['inspections']
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Obtener todas las inspecciones donde participa este inspector
    const myInspections = await this.inspectionRepository
      .createQueryBuilder('inspection')
      .innerJoin('inspection.inspectors', 'inspector')
      .where('inspector.id = :userId', { userId })
      .leftJoinAndSelect('inspection.inspectors', 'inspectors')
      .getMany();

    // Estadísticas por estado
    const statsByStatus = {
      nueva: myInspections.filter(i => i.status === InspectionStatus.NEW).length,
      enProgreso: myInspections.filter(i => i.status === InspectionStatus.IN_PROGRESS).length,
      revisada: myInspections.filter(i => i.status === InspectionStatus.REVIEWED).length,
      archivada: myInspections.filter(i => i.status === InspectionStatus.ARCHIVED).length,
    };

    // Inspecciones del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthInspections = myInspections.filter(inspection => {
      const createdAt = new Date(inspection.createdAt);
      return createdAt >= firstDayOfMonth && createdAt <= lastDayOfMonth;
    });

    // Inspecciones de la semana actual
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekInspections = myInspections.filter(inspection => {
      const createdAt = new Date(inspection.createdAt);
      return createdAt >= startOfWeek;
    });

    // Tareas pendientes (nuevas o en progreso)
    const pendingTasks = myInspections.filter(
      i => i.status === InspectionStatus.NEW || i.status === InspectionStatus.IN_PROGRESS
    );

    // Productividad (revisadas este mes)
    const productivityThisMonth = thisMonthInspections.filter(
      i => i.status === InspectionStatus.REVIEWED
    ).length;

    return {
      inspector: {
        id: user.id,
        nombre: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
      resumen: {
        totalInspecciones: myInspections.length,
        tareasPendientes: pendingTasks.length,
        completadasEsteMes: productivityThisMonth,
        inspeccionesEsteMes: thisMonthInspections.length,
        inspeccionesEstaSemana: thisWeekInspections.length,
      },
      estadisticasPorEstado: statsByStatus,
      tareasPendientes: pendingTasks.map(inspection => ({
        id: inspection.id,
        procedureNumber: inspection.procedureNumber,
        inspectionDate: inspection.inspectionDate,
        status: inspection.status,
        applicantType: inspection.applicantType,
        createdAt: inspection.createdAt,
      })),
      ultimasInspecciones: myInspections
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(inspection => ({
          id: inspection.id,
          procedureNumber: inspection.procedureNumber,
          inspectionDate: inspection.inspectionDate,
          status: inspection.status,
          applicantType: inspection.applicantType,
          createdAt: inspection.createdAt,
        })),
    };
  }

  /**
   * Dashboard para Administradores
   * Vista completa del sistema + rendimiento del equipo
   */
  async getAdminDashboard(userId: number) {
    // Primero obtenemos el dashboard del inspector (ya que admin también es inspector)
    const inspectorDashboard = await this.getInspectorDashboard(userId);

    // Ahora agregamos estadísticas administrativas
    const allInspections = await this.inspectionRepository.find({
      relations: ['inspectors'],
    });

    // Estadísticas generales del sistema
    const generalStats = {
      nueva: allInspections.filter(i => i.status === InspectionStatus.NEW).length,
      enProgreso: allInspections.filter(i => i.status === InspectionStatus.IN_PROGRESS).length,
      revisada: allInspections.filter(i => i.status === InspectionStatus.REVIEWED).length,
      archivada: allInspections.filter(i => i.status === InspectionStatus.ARCHIVED).length,
    };

    // Obtener todos los inspectores
    const allInspectors = await this.userRepository.find({
      where: { isBlocked: false },
      relations: ['inspections'],
    });

    // Rendimiento por inspector
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const inspectorPerformance = await Promise.all(
      allInspectors.map(async inspector => {
        const inspectorInspections = await this.inspectionRepository
          .createQueryBuilder('inspection')
          .innerJoin('inspection.inspectors', 'user')
          .where('user.id = :inspectorId', { inspectorId: inspector.id })
          .getMany();

        const thisMonthInspections = inspectorInspections.filter(inspection => {
          const createdAt = new Date(inspection.createdAt);
          return createdAt >= firstDayOfMonth;
        });

        const completed = inspectorInspections.filter(
          i => i.status === InspectionStatus.REVIEWED
        ).length;

        const pending = inspectorInspections.filter(
          i => i.status === InspectionStatus.NEW || i.status === InspectionStatus.IN_PROGRESS
        ).length;

        return {
          inspector: {
            id: inspector.id,
            nombre: `${inspector.firstName} ${inspector.lastName}`,
            email: inspector.email,
            role: inspector.role,
          },
          totalInspecciones: inspectorInspections.length,
          completadas: completed,
          pendientes: pending,
          esteMes: thisMonthInspections.length,
        };
      })
    );

    // Inspecciones del mes actual (todas)
    const thisMonthInspections = allInspections.filter(inspection => {
      const createdAt = new Date(inspection.createdAt);
      return createdAt >= firstDayOfMonth;
    });

    // Estadísticas por tipo de aplicante
    const statsByApplicantType = {
      anonimo: allInspections.filter(i => i.applicantType === 'Anonimo').length,
      personaFisica: allInspections.filter(i => i.applicantType === 'Persona Física').length,
      personaJuridica: allInspections.filter(i => i.applicantType === 'Persona Jurídica').length,
    };

    // KPIs clave
    const kpis = {
      totalInspeccionesActivas: generalStats.nueva + generalStats.enProgreso,
      totalInspeccionesRevisadas: generalStats.revisada,
      totalInspeccionesArchivadas: generalStats.archivada,
      promedioInspeccionesPorInspector: allInspectors.length > 0 
        ? Math.round(allInspections.length / allInspectors.length) 
        : 0,
      inspeccionesEsteMes: thisMonthInspections.length,
      tasaCompletitud: allInspections.length > 0
        ? Math.round((generalStats.revisada / allInspections.length) * 100)
        : 0,
    };

    return {
      // Dashboard personal del admin (como inspector)
      miDashboard: inspectorDashboard,
      
      // Vista administrativa
      vistaAdministrativa: {
        estadisticasGenerales: {
          totalInspecciones: allInspections.length,
          totalInspectores: allInspectors.length,
          ...generalStats,
        },
        kpis,
        estadisticasPorTipo: statsByApplicantType,
        rendimientoPorInspector: inspectorPerformance.sort(
          (a, b) => b.completadas - a.completadas
        ),
        inspeccionesRecientes: allInspections
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
          .map(inspection => ({
            id: inspection.id,
            procedureNumber: inspection.procedureNumber,
            inspectionDate: inspection.inspectionDate,
            status: inspection.status,
            applicantType: inspection.applicantType,
            inspectores: inspection.inspectors.map(i => `${i.firstName} ${i.lastName}`),
            createdAt: inspection.createdAt,
          })),
      },
    };
  }

  /**
   * Obtener estadísticas de un período específico
   */
  async getStatsByPeriod(startDate: Date, endDate: Date) {
    const inspections = await this.inspectionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['inspectors'],
    });

    return {
      periodo: {
        inicio: startDate,
        fin: endDate,
      },
      total: inspections.length,
      porEstado: {
        nueva: inspections.filter(i => i.status === InspectionStatus.NEW).length,
        enProgreso: inspections.filter(i => i.status === InspectionStatus.IN_PROGRESS).length,
        revisada: inspections.filter(i => i.status === InspectionStatus.REVIEWED).length,
        archivada: inspections.filter(i => i.status === InspectionStatus.ARCHIVED).length,
      },
      porTipo: {
        anonimo: inspections.filter(i => i.applicantType === 'Anonimo').length,
        personaFisica: inspections.filter(i => i.applicantType === 'Persona Física').length,
        personaJuridica: inspections.filter(i => i.applicantType === 'Persona Jurídica').length,
      },
    };
  }
}
