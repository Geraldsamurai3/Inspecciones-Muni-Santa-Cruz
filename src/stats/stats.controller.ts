import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { 
  StatsService, 
  InspectionStats, 
  DashboardStats, 
  DetailedStats, 
  InspectorStats,
  DependencyStatsResponse,
  InspectorPerformanceResponse,
  TimePeriod
} from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('inspections')
  async getInspectionStats(): Promise<InspectionStats> {
    return this.statsService.getInspectionStats();
  }

  @Get('inspectors')
  async getInspectorStats(): Promise<InspectorStats[]> {
    return this.statsService.getInspectorStats();
  }

  @Get('detailed')
  async getDetailedStats(): Promise<DetailedStats> {
    return this.statsService.getDetailedStats();
  }

  @Get('dashboard')
  async getDashboardStats(): Promise<DashboardStats> {
    return this.statsService.getDashboardStats();
  }

  @Get('status-counts')
  async getStatusCounts(): Promise<Record<string, number>> {
    return this.statsService.getStatusCounts();
  }

  @Get('summary')
  async getSummary() {
    const stats = await this.statsService.getInspectionStats();
    
    return {
      total: stats.total,
      nuevo: stats.byStatus.nuevo,
      enProceso: stats.byStatus.enProceso, 
      revisado: stats.byStatus.revisado,
      archivado: stats.byStatus.archivado,
      recientes: stats.recent,
    };
  }

  @Get('complete-overview')
  async getCompleteOverview() {
    const [regular, detailed] = await Promise.all([
      this.statsService.getInspectionStats(),
      this.statsService.getDetailedStats(),
    ]);

    return {
      regular: {
        total: regular.total,
        byStatus: regular.byStatus,
        recent: regular.recent,
        monthly: regular.byMonth,
      },
      overview: detailed.overview,
      topInspectors: detailed.byInspector.slice(0, 5), // Top 5 inspectores
      trends: detailed.trends,
    };
  }

  @Get('dependencies')
  async getDependencyStats(
    @Query('period') period?: TimePeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<DependencyStatsResponse> {
    return this.statsService.getDependencyStats(
      period || '7days',
      startDate,
      endDate
    );
  }

  @Get('inspector-performance')
  async getInspectorPerformance(
    @Query('period') period?: TimePeriod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<InspectorPerformanceResponse> {
    return this.statsService.getInspectorPerformance(
      period || '7days',
      startDate,
      endDate
    );
  }
}