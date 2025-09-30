import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { Inspection } from '../inspections/Entities/inspections.entity';
import { InspectionStatus } from '../inspections/Enums/inspection-status.enum';
import { User } from '../users/entities/user.entity';

export interface InspectionStats {
  total: number;
  byStatus: {
    nuevo: number;
    enProceso: number;
    revisado: number;
    archivado: number;
  };
  byMonth: Array<{
    month: string;
    count: number;
  }>;
  recent: number;
}

export interface InspectorStats {
  inspectorId: number;
  inspectorName: string;
  totalInspections: number;
  byStatus: {
    nuevo: number;
    enProceso: number;
    revisado: number;
    archivado: number;
  };
  thisMonth: number;
  avgPerMonth: number;
}

export interface DetailedStats {
  overview: {
    totalInspections: number;
    activeInspectors: number;
    completionRate: number;
  };
  byInspector: InspectorStats[];
  trends: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export interface DashboardStats {
  inspections: InspectionStats;
  trends: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
}

export interface DependencyStats {
  dependency: string;
  total: number;
  byStatus: {
    nuevo: number;
    enProceso: number;
    revisado: number;
    archivado: number;
  };
  percentage: number;
}

export interface DependencyStatsResponse {
  period: string;
  startDate: string;
  endDate: string;
  total: number;
  byDependency: DependencyStats[];
}

export type TimePeriod = '7days' | '1week' | '15days' | '1month' | 'custom';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getInspectionStats(): Promise<InspectionStats> {
    const total = await this.inspectionRepo.count();

    const nuevo = await this.inspectionRepo.count({ where: { status: InspectionStatus.NEW } });
    const enProceso = await this.inspectionRepo.count({ where: { status: InspectionStatus.IN_PROGRESS } });
    const revisado = await this.inspectionRepo.count({ where: { status: InspectionStatus.REVIEWED } });
    const archivado = await this.inspectionRepo.count({ where: { status: InspectionStatus.ARCHIVED } });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = await this.inspectionRepo.count({
      where: {
        createdAt: MoreThanOrEqual(sevenDaysAgo)
      }
    });

    const byMonth = await this.getMonthlyStats();

    return {
      total,
      byStatus: {
        nuevo,
        enProceso,
        revisado,
        archivado,
      },
      byMonth,
      recent,
    };
  }

  async getInspectorStats(): Promise<InspectorStats[]> {
    const inspectorData = await this.inspectionRepo.query(`
      SELECT 
        u.id,
        CONCAT(u.firstName, ' ', u.lastName) as inspectorName,
        COUNT(i.id) as totalInspections,
        SUM(CASE WHEN i.status = 'Nuevo' THEN 1 ELSE 0 END) as newCount,
        SUM(CASE WHEN i.status = 'En proceso' THEN 1 ELSE 0 END) as inProgressCount,
        SUM(CASE WHEN i.status = 'Revisado' THEN 1 ELSE 0 END) as reviewedCount,
        SUM(CASE WHEN i.status = 'Archivado' THEN 1 ELSE 0 END) as archivedCount,
        SUM(CASE WHEN i.createdAt >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as thisMonthCount
      FROM user u
      LEFT JOIN inspection_users iu ON u.id = iu.user_id
      LEFT JOIN inspections i ON iu.inspection_id = i.id
      GROUP BY u.id, u.firstName, u.lastName
      HAVING totalInspections > 0
      ORDER BY totalInspections DESC
    `);

    return inspectorData.map((row: any) => ({
      inspectorId: row.id,
      inspectorName: row.inspectorName,
      totalInspections: parseInt(row.totalInspections),
      byStatus: {
        nuevo: parseInt(row.newCount),
        enProceso: parseInt(row.inProgressCount),
        revisado: parseInt(row.reviewedCount),
        archivado: parseInt(row.archivedCount),
      },
      thisMonth: parseInt(row.thisMonthCount),
      avgPerMonth: Math.round((parseInt(row.totalInspections) / 6) * 100) / 100,
    }));
  }

  async getDetailedStats(): Promise<DetailedStats> {
    const [regularStats, inspectorStats] = await Promise.all([
      this.getInspectionStats(),
      this.getInspectorStats(),
    ]);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMonth, lastMonth] = await Promise.all([
      this.inspectionRepo.count({ where: { createdAt: MoreThanOrEqual(thisMonthStart) } }),
      this.inspectionRepo.count({ where: { createdAt: Between(lastMonthStart, lastMonthEnd) } }),
    ]);

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    const completedInspections = regularStats.byStatus.revisado + regularStats.byStatus.archivado;
    const completionRate = regularStats.total > 0 ? (completedInspections / regularStats.total) * 100 : 0;

    return {
      overview: {
        totalInspections: regularStats.total,
        activeInspectors: inspectorStats.length,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      byInspector: inspectorStats,
      trends: {
        thisMonth,
        lastMonth,
        growth: Math.round(growth * 100) / 100,
      },
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const inspections = await this.getInspectionStats();
    
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonth = await this.inspectionRepo.count({
      where: { createdAt: MoreThanOrEqual(thisMonthStart) }
    });

    const lastMonth = await this.inspectionRepo.count({
      where: { createdAt: Between(lastMonthStart, lastMonthEnd) }
    });

    const percentageChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return {
      inspections,
      trends: {
        thisMonth,
        lastMonth,
        percentageChange: Math.round(percentageChange * 100) / 100,
      },
    };
  }

  private async getMonthlyStats(): Promise<Array<{ month: string; count: number }>> {
    const results = await this.inspectionRepo.query(`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM inspections 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `);

    return results.map((row: any) => ({
      month: row.month,
      count: parseInt(row.count)
    }));
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    const counts = await Promise.all([
      this.inspectionRepo.count({ where: { status: InspectionStatus.NEW } }),
      this.inspectionRepo.count({ where: { status: InspectionStatus.IN_PROGRESS } }),
      this.inspectionRepo.count({ where: { status: InspectionStatus.REVIEWED } }),
      this.inspectionRepo.count({ where: { status: InspectionStatus.ARCHIVED } }),
    ]);

    return {
      nuevo: counts[0],
      enProceso: counts[1], 
      revisado: counts[2],
      archivado: counts[3],
    };
  }

  async getDependencyStats(
    period: TimePeriod = '7days',
    startDate?: string,
    endDate?: string
  ): Promise<DependencyStatsResponse> {
    const { start, end, periodLabel } = this.getDateRange(period, startDate, endDate);

    // Query que cuenta inspecciones por tipo de dependencia
    const results = await this.inspectionRepo.query(`
      SELECT 
        CASE
          WHEN mayorOfficeId IS NOT NULL THEN 'Alcaldía'
          WHEN constructionId IS NOT NULL THEN 'Construcción'
          WHEN pcCancellationId IS NOT NULL THEN 'Cancelación PC'
          WHEN workReceiptId IS NOT NULL THEN 'Recepción de Obras'
          WHEN generalInspectionId IS NOT NULL THEN 'Inspección General'
          WHEN taxProcedureId IS NOT NULL THEN 'Cobros/Procedimientos Tributarios'
          WHEN antiquityId IS NOT NULL THEN 'Bienes Inmuebles/Antigüedad'
          WHEN locationId IS NOT NULL THEN 'Ubicación'
          WHEN landUseId IS NOT NULL THEN 'Uso de Suelo'
          WHEN concessionId IS NOT NULL THEN 'Concesión ZMT'
          ELSE 'Sin Clasificar'
        END as dependency,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Nuevo' THEN 1 ELSE 0 END) as nuevo,
        SUM(CASE WHEN status = 'En proceso' THEN 1 ELSE 0 END) as enProceso,
        SUM(CASE WHEN status = 'Revisado' THEN 1 ELSE 0 END) as revisado,
        SUM(CASE WHEN status = 'Archivado' THEN 1 ELSE 0 END) as archivado
      FROM inspections
      WHERE createdAt >= ? AND createdAt <= ?
      GROUP BY dependency
      ORDER BY total DESC
    `, [start, end]);

    const totalInspections = results.reduce((sum: number, row: any) => sum + parseInt(row.total), 0);

    const byDependency: DependencyStats[] = results.map((row: any) => ({
      dependency: row.dependency,
      total: parseInt(row.total),
      byStatus: {
        nuevo: parseInt(row.nuevo),
        enProceso: parseInt(row.enProceso),
        revisado: parseInt(row.revisado),
        archivado: parseInt(row.archivado),
      },
      percentage: totalInspections > 0 
        ? Math.round((parseInt(row.total) / totalInspections) * 10000) / 100 
        : 0
    }));

    return {
      period: periodLabel,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      total: totalInspections,
      byDependency,
    };
  }

  private getDateRange(
    period: TimePeriod,
    customStart?: string,
    customEnd?: string
  ): { start: Date; end: Date; periodLabel: string } {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;
    let periodLabel: string;

    switch (period) {
      case '7days':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        periodLabel = 'Últimos 7 días';
        break;

      case '1week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        periodLabel = 'Última semana';
        break;

      case '15days':
        start = new Date(now);
        start.setDate(start.getDate() - 15);
        start.setHours(0, 0, 0, 0);
        periodLabel = 'Últimos 15 días';
        break;

      case '1month':
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        periodLabel = 'Último mes';
        break;

      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Se requieren startDate y endDate para el período personalizado');
        }
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const customEndDate = new Date(customEnd);
        customEndDate.setHours(23, 59, 59, 999);
        periodLabel = 'Período personalizado';
        return { start, end: customEndDate, periodLabel };

      default:
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        periodLabel = 'Últimos 7 días';
    }

    return { start, end, periodLabel };
  }
}