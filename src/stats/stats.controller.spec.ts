import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  const mockStatsService = {
    getInspectionStats: jest.fn(),
    getInspectorStats: jest.fn(),
    getDetailedStats: jest.fn(),
    getDashboardStats: jest.fn(),
    getStatusCounts: jest.fn(),
    getDependencyStats: jest.fn(),
    getInspectorPerformance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: mockStatsService,
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInspectionStats', () => {
    it('should return inspection statistics', async () => {
      const mockStats = {
        total: 100,
        byStatus: { nuevo: 25, enProceso: 30, revisado: 35, archivado: 10 },
        byMonth: [],
        recent: 15,
      };

      mockStatsService.getInspectionStats.mockResolvedValue(mockStats);

      const result = await controller.getInspectionStats();

      expect(result).toEqual(mockStats);
      expect(service.getInspectionStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getInspectorStats', () => {
    it('should return inspector statistics', async () => {
      const mockStats = [
        {
          inspectorId: 1,
          inspectorName: 'Juan Pérez',
          totalInspections: 45,
          byStatus: { nuevo: 5, enProceso: 12, revisado: 20, archivado: 8 },
          thisMonth: 10,
          avgPerMonth: 7.5,
        },
      ];

      mockStatsService.getInspectorStats.mockResolvedValue(mockStats);

      const result = await controller.getInspectorStats();

      expect(result).toEqual(mockStats);
      expect(service.getInspectorStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDetailedStats', () => {
    it('should return detailed statistics', async () => {
      const mockStats = {
        overview: {
          totalInspections: 100,
          activeInspectors: 5,
          completionRate: 50,
        },
        byInspector: [],
        trends: { thisMonth: 30, lastMonth: 25, growth: 20 },
      };

      mockStatsService.getDetailedStats.mockResolvedValue(mockStats);

      const result = await controller.getDetailedStats();

      expect(result).toEqual(mockStats);
      expect(service.getDetailedStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        inspections: {
          total: 150,
          byStatus: { nuevo: 25, enProceso: 40, revisado: 60, archivado: 25 },
          byMonth: [],
          recent: 12,
        },
        trends: { thisMonth: 30, lastMonth: 25, percentageChange: 20 },
      };

      mockStatsService.getDashboardStats.mockResolvedValue(mockStats);

      const result = await controller.getDashboardStats();

      expect(result).toEqual(mockStats);
      expect(service.getDashboardStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStatusCounts', () => {
    it('should return status counts', async () => {
      const mockCounts = {
        nuevo: 25,
        enProceso: 40,
        revisado: 60,
        archivado: 25,
      };

      mockStatsService.getStatusCounts.mockResolvedValue(mockCounts);

      const result = await controller.getStatusCounts();

      expect(result).toEqual(mockCounts);
      expect(service.getStatusCounts).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSummary', () => {
    it('should return formatted summary', async () => {
      const mockStats = {
        total: 150,
        byStatus: { nuevo: 25, enProceso: 40, revisado: 60, archivado: 25 },
        byMonth: [],
        recent: 12,
      };

      mockStatsService.getInspectionStats.mockResolvedValue(mockStats);

      const result = await controller.getSummary();

      expect(result).toEqual({
        total: 150,
        nuevo: 25,
        enProceso: 40,
        revisado: 60,
        archivado: 25,
        recientes: 12,
      });
    });
  });

  describe('getCompleteOverview', () => {
    it('should return complete overview with top inspectors', async () => {
      const mockInspectionStats = {
        total: 150,
        byStatus: { nuevo: 25, enProceso: 40, revisado: 60, archivado: 25 },
        byMonth: [{ month: '2025-10', count: 30 }],
        recent: 12,
      };

      const mockDetailedStats = {
        overview: { totalInspections: 150, activeInspectors: 8, completionRate: 56.67 },
        byInspector: [
          { inspectorId: 1, inspectorName: 'Inspector 1', totalInspections: 50 },
          { inspectorId: 2, inspectorName: 'Inspector 2', totalInspections: 40 },
          { inspectorId: 3, inspectorName: 'Inspector 3', totalInspections: 30 },
          { inspectorId: 4, inspectorName: 'Inspector 4', totalInspections: 20 },
          { inspectorId: 5, inspectorName: 'Inspector 5', totalInspections: 10 },
          { inspectorId: 6, inspectorName: 'Inspector 6', totalInspections: 5 },
        ],
        trends: { thisMonth: 30, lastMonth: 25, growth: 20 },
      };

      mockStatsService.getInspectionStats.mockResolvedValue(mockInspectionStats);
      mockStatsService.getDetailedStats.mockResolvedValue(mockDetailedStats);

      const result = await controller.getCompleteOverview();

      expect(result.regular.total).toBe(150);
      expect(result.topInspectors).toHaveLength(5);
      expect(result.topInspectors[0].inspectorName).toBe('Inspector 1');
    });
  });

  describe('getDependencyStats', () => {
    it('should return dependency statistics with default period', async () => {
      const mockStats = {
        period: 'Últimos 7 días',
        startDate: '2025-09-24',
        endDate: '2025-10-01',
        total: 145,
        byDependency: [
          {
            dependency: 'Alcaldía',
            total: 45,
            byStatus: { nuevo: 10, enProceso: 15, revisado: 15, archivado: 5 },
            percentage: 31.03,
          },
        ],
      };

      mockStatsService.getDependencyStats.mockResolvedValue(mockStats);

      const result = await controller.getDependencyStats();

      expect(result).toEqual(mockStats);
      expect(service.getDependencyStats).toHaveBeenCalledWith('7days', undefined, undefined);
    });

    it('should return dependency statistics with custom period', async () => {
      const mockStats = {
        period: 'Período personalizado',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        total: 100,
        byDependency: [],
      };

      mockStatsService.getDependencyStats.mockResolvedValue(mockStats);

      const result = await controller.getDependencyStats(
        'custom',
        '2025-09-01',
        '2025-09-30'
      );

      expect(result).toEqual(mockStats);
      expect(service.getDependencyStats).toHaveBeenCalledWith(
        'custom',
        '2025-09-01',
        '2025-09-30'
      );
    });
  });

  describe('getInspectorPerformance', () => {
    it('should return inspector performance with default period', async () => {
      const mockPerformance = {
        period: 'Últimos 7 días',
        startDate: '2025-09-24',
        endDate: '2025-10-01',
        inspectors: [
          {
            inspectorId: 1,
            inspectorName: 'Juan Pérez',
            totalInspections: 28,
            byStatus: { nuevo: 3, enProceso: 8, revisado: 12, archivado: 5 },
            byDependency: [
              { dependency: 'Alcaldía', count: 10 },
              { dependency: 'Construcción', count: 7 },
            ],
            completionRate: 60.71,
            thisMonth: 15,
            avgPerMonth: 56.0,
          },
        ],
      };

      mockStatsService.getInspectorPerformance.mockResolvedValue(mockPerformance);

      const result = await controller.getInspectorPerformance();

      expect(result).toEqual(mockPerformance);
      expect(service.getInspectorPerformance).toHaveBeenCalledWith(
        '7days',
        undefined,
        undefined
      );
    });

    it('should return inspector performance with custom period', async () => {
      const mockPerformance = {
        period: 'Período personalizado',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        inspectors: [],
      };

      mockStatsService.getInspectorPerformance.mockResolvedValue(mockPerformance);

      const result = await controller.getInspectorPerformance(
        'custom',
        '2025-09-01',
        '2025-09-30'
      );

      expect(result).toEqual(mockPerformance);
      expect(service.getInspectorPerformance).toHaveBeenCalledWith(
        'custom',
        '2025-09-01',
        '2025-09-30'
      );
    });
  });
});
