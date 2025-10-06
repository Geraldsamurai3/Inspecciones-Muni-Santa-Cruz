import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/inspector
   * Dashboard para inspectores - muestra sus propias inspecciones y estadísticas
   */
  @Get('inspector')
  async getInspectorDashboard(@Req() req: any) {
    const userId = req.user.id;
    return this.dashboardService.getInspectorDashboard(userId);
  }

  /**
   * GET /dashboard/admin
   * Dashboard para administradores - vista completa del sistema + rendimiento del equipo
   * Solo accesible para usuarios con role 'admin'
   */
  @Get('admin')
  async getAdminDashboard(@Req() req: any) {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el usuario sea admin
    if (userRole !== 'admin') {
      return {
        statusCode: 403,
        message: 'Acceso denegado. Solo administradores pueden acceder a esta vista.',
      };
    }

    return this.dashboardService.getAdminDashboard(userId);
  }

  /**
   * GET /dashboard/stats/period
   * Obtener estadísticas de un período específico
   * Query params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
   */
  @Get('stats/period')
  async getStatsByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        message: 'Se requieren las fechas startDate y endDate en formato YYYY-MM-DD',
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        statusCode: 400,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD',
      };
    }

    return this.dashboardService.getStatsByPeriod(start, end);
  }
}
