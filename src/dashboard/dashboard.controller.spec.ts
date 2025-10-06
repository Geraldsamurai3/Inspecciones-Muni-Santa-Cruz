import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  const mockInspectorDashboard = {
    inspector: {
      id: 1,
      nombre: 'John Doe',
      email: 'john@example.com',
      role: 'inspector',
    },
    resumen: {
      totalInspecciones: 10,
      tareasPendientes: 3,
      completadasEsteMes: 5,
      inspeccionesEsteMes: 7,
      inspeccionesEstaSemana: 2,
    },
    estadisticasPorEstado: {
      nueva: 2,
      enProgreso: 1,
      revisada: 5,
      archivada: 2,
    },
    tareasPendientes: [],
    ultimasInspecciones: [],
  };

  const mockAdminDashboard = {
    miDashboard: mockInspectorDashboard,
    vistaAdministrativa: {
      estadisticasGenerales: {
        totalInspecciones: 100,
        totalInspectores: 5,
        nueva: 20,
        enProgreso: 15,
        revisada: 50,
        archivada: 15,
      },
      kpis: {
        totalInspeccionesActivas: 35,
        totalInspeccionesRevisadas: 50,
        totalInspeccionesArchivadas: 15,
        promedioInspeccionesPorInspector: 20,
        inspeccionesEsteMes: 25,
        tasaCompletitud: 50,
      },
      estadisticasPorTipo: {
        anonimo: 10,
        personaFisica: 60,
        personaJuridica: 30,
      },
      rendimientoPorInspector: [],
      inspeccionesRecientes: [],
    },
  };

  beforeEach(async () => {
    const mockDashboardService = {
      getInspectorDashboard: jest.fn(),
      getAdminDashboard: jest.fn(),
      getStatsByPeriod: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInspectorDashboard', () => {
    it('debería retornar el dashboard del inspector autenticado', async () => {
      const mockRequest = {
        user: { id: 1, role: 'inspector' },
      };

      service.getInspectorDashboard.mockResolvedValue(mockInspectorDashboard);

      const result = await controller.getInspectorDashboard(mockRequest);

      expect(service.getInspectorDashboard).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInspectorDashboard);
    });

    it('debería llamar al servicio con el ID correcto del usuario', async () => {
      const mockRequest = {
        user: { id: 5, role: 'inspector' },
      };

      service.getInspectorDashboard.mockResolvedValue(mockInspectorDashboard);

      await controller.getInspectorDashboard(mockRequest);

      expect(service.getInspectorDashboard).toHaveBeenCalledWith(5);
    });
  });

  describe('getAdminDashboard', () => {
    it('debería retornar el dashboard completo para admin', async () => {
      const mockRequest = {
        user: { id: 1, role: 'admin' },
      };

      service.getAdminDashboard.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard(mockRequest);

      expect(service.getAdminDashboard).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAdminDashboard);
    });

    it('debería denegar acceso si el usuario no es admin', async () => {
      const mockRequest = {
        user: { id: 1, role: 'inspector' },
      };

      const result = await controller.getAdminDashboard(mockRequest);

      expect(service.getAdminDashboard).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 403,
        message: 'Acceso denegado. Solo administradores pueden acceder a esta vista.',
      });
    });

    it('debería permitir acceso a usuarios con role admin', async () => {
      const mockRequest = {
        user: { id: 2, role: 'admin' },
      };

      service.getAdminDashboard.mockResolvedValue(mockAdminDashboard);

      const result = await controller.getAdminDashboard(mockRequest);

      expect(service.getAdminDashboard).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockAdminDashboard);
    });
  });

  describe('getStatsByPeriod', () => {
    const mockStatsByPeriod = {
      periodo: {
        inicio: new Date('2025-10-01'),
        fin: new Date('2025-10-31'),
      },
      total: 45,
      porEstado: {
        nueva: 8,
        enProgreso: 5,
        revisada: 28,
        archivada: 4,
      },
      porTipo: {
        anonimo: 5,
        personaFisica: 25,
        personaJuridica: 15,
      },
    };

    it('debería retornar estadísticas para un período válido', async () => {
      service.getStatsByPeriod.mockResolvedValue(mockStatsByPeriod);

      const result = await controller.getStatsByPeriod('2025-10-01', '2025-10-31');

      expect(service.getStatsByPeriod).toHaveBeenCalledWith(
        new Date('2025-10-01'),
        new Date('2025-10-31'),
      );
      expect(result).toEqual(mockStatsByPeriod);
    });

    it('debería retornar error si falta startDate', async () => {
      const result = await controller.getStatsByPeriod('' as any, '2025-10-31');

      expect(service.getStatsByPeriod).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 400,
        message: 'Se requieren las fechas startDate y endDate en formato YYYY-MM-DD',
      });
    });

    it('debería retornar error si falta endDate', async () => {
      const result = await controller.getStatsByPeriod('2025-10-01', '' as any);

      expect(service.getStatsByPeriod).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 400,
        message: 'Se requieren las fechas startDate y endDate en formato YYYY-MM-DD',
      });
    });

    it('debería retornar error si el formato de fecha es inválido', async () => {
      const result = await controller.getStatsByPeriod('invalid-date', '2025-10-31');

      expect(service.getStatsByPeriod).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 400,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD',
      });
    });

    it('debería retornar error si ambas fechas son inválidas', async () => {
      const result = await controller.getStatsByPeriod('not-a-date', 'also-not-a-date');

      expect(service.getStatsByPeriod).not.toHaveBeenCalled();
      expect(result).toEqual({
        statusCode: 400,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD',
      });
    });

    it('debería aceptar fechas en formato ISO completo', async () => {
      service.getStatsByPeriod.mockResolvedValue(mockStatsByPeriod);

      await controller.getStatsByPeriod('2025-10-01T00:00:00.000Z', '2025-10-31T23:59:59.999Z');

      expect(service.getStatsByPeriod).toHaveBeenCalled();
      expect(service.getStatsByPeriod).toHaveBeenCalledWith(
        new Date('2025-10-01T00:00:00.000Z'),
        new Date('2025-10-31T23:59:59.999Z'),
      );
    });
  });
});
