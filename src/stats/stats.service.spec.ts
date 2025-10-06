import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsService } from './stats.service';
import { Inspection } from '../inspections/Entities/inspections.entity';
import { User } from '../users/entities/user.entity';
import { InspectionStatus } from '../inspections/Enums/inspection-status.enum';

describe('StatsService', () => {
  let service: StatsService;
  let inspectionRepo: Repository<Inspection>;
  let userRepo: Repository<User>;

  const mockInspectionRepository = {
    count: jest.fn(),
    query: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: getRepositoryToken(Inspection),
          useValue: mockInspectionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    inspectionRepo = module.get<Repository<Inspection>>(getRepositoryToken(Inspection));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInspectionStats', () => {
    it('should return inspection statistics', async () => {
      const mockTotal = 100;
      const mockByStatus = {
        nuevo: 25,
        enProceso: 30,
        revisado: 35,
        archivado: 10,
      };
      const mockRecent = 15;
      const mockMonthlyData = [
        { month: '2025-10', count: 30 },
        { month: '2025-09', count: 25 },
      ];

      mockInspectionRepository.count
        .mockResolvedValueOnce(mockTotal) // total
        .mockResolvedValueOnce(mockByStatus.nuevo) // nuevo
        .mockResolvedValueOnce(mockByStatus.enProceso) // enProceso
        .mockResolvedValueOnce(mockByStatus.revisado) // revisado
        .mockResolvedValueOnce(mockByStatus.archivado) // archivado
        .mockResolvedValueOnce(mockRecent); // recent

      mockInspectionRepository.query.mockResolvedValueOnce(
        mockMonthlyData.map(m => ({ month: m.month, count: m.count.toString() }))
      );

      const result = await service.getInspectionStats();

      expect(result).toEqual({
        total: mockTotal,
        byStatus: mockByStatus,
        byMonth: mockMonthlyData,
        recent: mockRecent,
      });
      expect(mockInspectionRepository.count).toHaveBeenCalledTimes(6);
    });
  });

  describe('getInspectorStats', () => {
    it('should return statistics grouped by inspector', async () => {
      const mockInspectorData = [
        {
          id: 1,
          inspectorName: 'Juan Pérez',
          totalInspections: '45',
          newCount: '5',
          inProgressCount: '12',
          reviewedCount: '20',
          archivedCount: '8',
          thisMonthCount: '10',
        },
        {
          id: 2,
          inspectorName: 'María González',
          totalInspections: '38',
          newCount: '3',
          inProgressCount: '10',
          reviewedCount: '18',
          archivedCount: '7',
          thisMonthCount: '8',
        },
      ];

      mockInspectionRepository.query.mockResolvedValue(mockInspectorData);

      const result = await service.getInspectorStats();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        inspectorId: 1,
        inspectorName: 'Juan Pérez',
        totalInspections: 45,
        byStatus: {
          nuevo: 5,
          enProceso: 12,
          revisado: 20,
          archivado: 8,
        },
        thisMonth: 10,
        avgPerMonth: 7.5,
      });
      expect(mockInspectionRepository.query).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no inspectors have inspections', async () => {
      mockInspectionRepository.query.mockResolvedValue([]);

      const result = await service.getInspectorStats();

      expect(result).toEqual([]);
    });
  });

  describe('getDetailedStats', () => {
    it('should return detailed statistics with trends', async () => {
      const mockInspectionStats = {
        total: 100,
        byStatus: { nuevo: 20, enProceso: 30, revisado: 40, archivado: 10 },
        byMonth: [],
        recent: 15,
      };

      const mockInspectorStats = [
        {
          inspectorId: 1,
          inspectorName: 'Test Inspector',
          totalInspections: 50,
          byStatus: { nuevo: 10, enProceso: 15, revisado: 20, archivado: 5 },
          thisMonth: 10,
          avgPerMonth: 8.33,
        },
      ];

      jest.spyOn(service, 'getInspectionStats').mockResolvedValue(mockInspectionStats);
      jest.spyOn(service, 'getInspectorStats').mockResolvedValue(mockInspectorStats);

      mockInspectionRepository.count
        .mockResolvedValueOnce(30) // thisMonth
        .mockResolvedValueOnce(25); // lastMonth

      const result = await service.getDetailedStats();

      expect(result.overview.totalInspections).toBe(100);
      expect(result.overview.activeInspectors).toBe(1);
      expect(result.overview.completionRate).toBe(50);
      expect(result.byInspector).toEqual(mockInspectorStats);
      expect(result.trends.growth).toBe(20);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics with trends', async () => {
      const mockInspectionStats = {
        total: 150,
        byStatus: { nuevo: 25, enProceso: 40, revisado: 60, archivado: 25 },
        byMonth: [{ month: '2025-10', count: 30 }],
        recent: 12,
      };

      jest.spyOn(service, 'getInspectionStats').mockResolvedValue(mockInspectionStats);

      mockInspectionRepository.count
        .mockResolvedValueOnce(30) // thisMonth
        .mockResolvedValueOnce(25); // lastMonth

      const result = await service.getDashboardStats();

      expect(result.inspections).toEqual(mockInspectionStats);
      expect(result.trends.thisMonth).toBe(30);
      expect(result.trends.lastMonth).toBe(25);
      expect(result.trends.percentageChange).toBe(20);
    });
  });

  describe('getStatusCounts', () => {
    it('should return count by status', async () => {
      mockInspectionRepository.count
        .mockResolvedValueOnce(25) // nuevo
        .mockResolvedValueOnce(40) // enProceso
        .mockResolvedValueOnce(60) // revisado
        .mockResolvedValueOnce(25); // archivado

      const result = await service.getStatusCounts();

      expect(result).toEqual({
        nuevo: 25,
        enProceso: 40,
        revisado: 60,
        archivado: 25,
      });
    });
  });

  describe('getDependencyStats', () => {
    it('should return statistics grouped by dependency', async () => {
      const mockDependencyData = [
        {
          dependency: 'Alcaldía',
          total: '45',
          nuevo: '10',
          enProceso: '15',
          revisado: '15',
          archivado: '5',
        },
        {
          dependency: 'Construcción',
          total: '30',
          nuevo: '5',
          enProceso: '10',
          revisado: '12',
          archivado: '3',
        },
      ];

      mockInspectionRepository.query.mockResolvedValue(mockDependencyData);

      const result = await service.getDependencyStats('7days');

      expect(result.total).toBe(75);
      expect(result.byDependency).toHaveLength(2);
      expect(result.byDependency[0].dependency).toBe('Alcaldía');
      expect(result.byDependency[0].total).toBe(45);
      expect(result.byDependency[0].percentage).toBe(60);
    });

    it('should handle custom period', async () => {
      mockInspectionRepository.query.mockResolvedValue([]);

      const result = await service.getDependencyStats(
        'custom',
        '2025-09-01',
        '2025-09-30'
      );

      expect(result.period).toBe('Período personalizado');
      // Verificar que las fechas están en el formato correcto (pueden variar por zona horaria)
      expect(result.startDate).toMatch(/2025-0[89]-[0-9]{2}/);
      expect(result.endDate).toMatch(/2025-09-[23][0-9]/);
    });

    it('should throw error when custom period without dates', async () => {
      await expect(
        service.getDependencyStats('custom')
      ).rejects.toThrow('Se requieren startDate y endDate para el período personalizado');
    });
  });

  describe('getInspectorPerformance', () => {
    it('should return inspector performance with dependencies', async () => {
      const mockInspectorData = [
        {
          inspectorId: 1,
          inspectorName: 'Juan Pérez',
          totalInspections: '28',
          nuevo: '3',
          enProceso: '8',
          revisado: '12',
          archivado: '5',
          thisMonth: '15',
        },
      ];

      const mockDependencyData = [
        { dependency: 'Alcaldía', count: '10' },
        { dependency: 'Construcción', count: '7' },
        { dependency: 'Cobros/Procedimientos Tributarios', count: '5' },
      ];

      mockInspectionRepository.query
        .mockResolvedValueOnce(mockInspectorData)
        .mockResolvedValueOnce(mockDependencyData);

      const result = await service.getInspectorPerformance('15days');

      expect(result.inspectors).toHaveLength(1);
      expect(result.inspectors[0].inspectorName).toBe('Juan Pérez');
      expect(result.inspectors[0].totalInspections).toBe(28);
      expect(result.inspectors[0].byDependency).toHaveLength(3);
      expect(result.inspectors[0].completionRate).toBe(60.71);
    });
  });
});
