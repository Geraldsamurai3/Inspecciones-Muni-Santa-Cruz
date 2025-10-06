import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { Inspection } from '../inspections/Entities/inspections.entity';
import { User } from '../users/entities/user.entity';
import { InspectionStatus } from '../inspections/Enums/inspection-status.enum';

describe('DashboardService', () => {
  let service: DashboardService;
  let inspectionRepository: jest.Mocked<Repository<Inspection>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    cedula: '1234567',
    role: 'inspector',
    isBlocked: false,
    createdAt: new Date(),
    inspections: [],
    toSafeObject: jest.fn(),
  } as unknown as User;

  const mockInspection = {
    id: 1,
    procedureNumber: 'INS-2025-001',
    inspectionDate: '2025-10-06',
    status: InspectionStatus.NEW,
    applicantType: 'Persona Física',
    inspectors: [mockUser],
    createdAt: new Date('2025-10-06'),
    updatedAt: new Date('2025-10-06'),
  } as Inspection;

  beforeEach(async () => {
    const mockInspectionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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

    service = module.get<DashboardService>(DashboardService);
    inspectionRepository = module.get(getRepositoryToken(Inspection));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInspectorDashboard', () => {
    it('debería retornar el dashboard de un inspector', async () => {
      const mockUserWithRelations = {
        ...mockUser,
        inspections: [mockInspection],
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUserWithRelations);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInspection]),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getInspectorDashboard(1);

      expect(result).toHaveProperty('inspector');
      expect(result).toHaveProperty('resumen');
      expect(result).toHaveProperty('estadisticasPorEstado');
      expect(result).toHaveProperty('tareasPendientes');
      expect(result).toHaveProperty('ultimasInspecciones');
      expect(result.inspector.id).toBe(1);
      expect(result.inspector.nombre).toBe('John Doe');
    });

    it('debería lanzar error si el usuario no existe', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getInspectorDashboard(999)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('debería contar correctamente las inspecciones por estado', async () => {
      const inspections = [
        { ...mockInspection, status: InspectionStatus.NEW },
        { ...mockInspection, id: 2, status: InspectionStatus.IN_PROGRESS },
        { ...mockInspection, id: 3, status: InspectionStatus.REVIEWED },
        { ...mockInspection, id: 4, status: InspectionStatus.ARCHIVED },
      ];

      const mockUserWithRelations = {
        ...mockUser,
        inspections,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUserWithRelations);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(inspections),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getInspectorDashboard(1);

      expect(result.estadisticasPorEstado.nueva).toBe(1);
      expect(result.estadisticasPorEstado.enProgreso).toBe(1);
      expect(result.estadisticasPorEstado.revisada).toBe(1);
      expect(result.estadisticasPorEstado.archivada).toBe(1);
    });

    it('debería incluir solo tareas pendientes (NEW o IN_PROGRESS)', async () => {
      const inspections = [
        { ...mockInspection, status: InspectionStatus.NEW },
        { ...mockInspection, id: 2, status: InspectionStatus.IN_PROGRESS },
        { ...mockInspection, id: 3, status: InspectionStatus.REVIEWED },
      ];

      const mockUserWithRelations = {
        ...mockUser,
        inspections,
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUserWithRelations);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(inspections),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getInspectorDashboard(1);

      expect(result.tareasPendientes.length).toBe(2);
      expect(result.resumen.tareasPendientes).toBe(2);
    });
  });

  describe('getAdminDashboard', () => {
    it('debería retornar el dashboard completo para admin', async () => {
      const mockUserWithRelations = {
        ...mockUser,
        role: 'admin',
        inspections: [mockInspection],
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUserWithRelations);
      userRepository.find = jest.fn().mockResolvedValue([mockUser]);
      inspectionRepository.find = jest.fn().mockResolvedValue([mockInspection]);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockInspection]),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getAdminDashboard(1);

      expect(result).toHaveProperty('miDashboard');
      expect(result).toHaveProperty('vistaAdministrativa');
      expect(result.vistaAdministrativa).toHaveProperty('estadisticasGenerales');
      expect(result.vistaAdministrativa).toHaveProperty('kpis');
      expect(result.vistaAdministrativa).toHaveProperty('rendimientoPorInspector');
    });

    it('debería calcular KPIs correctamente', async () => {
      const inspections = [
        { ...mockInspection, status: InspectionStatus.NEW },
        { ...mockInspection, id: 2, status: InspectionStatus.IN_PROGRESS },
        { ...mockInspection, id: 3, status: InspectionStatus.REVIEWED },
        { ...mockInspection, id: 4, status: InspectionStatus.REVIEWED },
        { ...mockInspection, id: 5, status: InspectionStatus.ARCHIVED },
      ];

      const mockUserWithRelations = {
        ...mockUser,
        role: 'admin',
        inspections: [inspections[0]],
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUserWithRelations);
      userRepository.find = jest.fn().mockResolvedValue([mockUser]);
      inspectionRepository.find = jest.fn().mockResolvedValue(inspections);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([inspections[0]]),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getAdminDashboard(1);

      const { kpis } = result.vistaAdministrativa;

      expect(kpis.totalInspeccionesActivas).toBe(2); // NEW + IN_PROGRESS
      expect(kpis.totalInspeccionesRevisadas).toBe(2); // REVIEWED
      expect(kpis.totalInspeccionesArchivadas).toBe(1); // ARCHIVED
      expect(kpis.tasaCompletitud).toBe(40); // 2/5 * 100 = 40%
    });

    it('debería incluir rendimiento por inspector ordenado por completadas', async () => {
      const inspector1 = { ...mockUser, id: 1, firstName: 'Inspector', lastName: 'One' };
      const inspector2 = { ...mockUser, id: 2, firstName: 'Inspector', lastName: 'Two' };

      const inspections = [
        { ...mockInspection, id: 1, status: InspectionStatus.REVIEWED },
        { ...mockInspection, id: 2, status: InspectionStatus.REVIEWED },
        { ...mockInspection, id: 3, status: InspectionStatus.NEW },
      ];

      userRepository.findOne = jest.fn().mockResolvedValue({
        ...inspector1,
        inspections: [inspections[0], inspections[1]],
      });

      userRepository.find = jest.fn().mockResolvedValue([inspector1, inspector2]);
      inspectionRepository.find = jest.fn().mockResolvedValue(inspections);

      const queryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValueOnce([inspections[0], inspections[1]])
          .mockResolvedValueOnce([inspections[0], inspections[1]])
          .mockResolvedValueOnce([inspections[2]])
          .mockResolvedValueOnce([inspections[2]]),
      };

      inspectionRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

      const result = await service.getAdminDashboard(1);

      const { rendimientoPorInspector } = result.vistaAdministrativa;

      expect(rendimientoPorInspector.length).toBe(2);
      expect(rendimientoPorInspector[0].completadas).toBeGreaterThanOrEqual(
        rendimientoPorInspector[1].completadas,
      );
    });
  });

  describe('getStatsByPeriod', () => {
    it('debería retornar estadísticas para un período específico', async () => {
      const startDate = new Date('2025-10-01');
      const endDate = new Date('2025-10-31');

      const inspections = [
        { ...mockInspection, createdAt: new Date('2025-10-05') },
        { ...mockInspection, id: 2, createdAt: new Date('2025-10-15') },
      ];

      inspectionRepository.find = jest.fn().mockResolvedValue(inspections);

      const result = await service.getStatsByPeriod(startDate, endDate);

      expect(result).toHaveProperty('periodo');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('porEstado');
      expect(result).toHaveProperty('porTipo');
      expect(result.periodo.inicio).toEqual(startDate);
      expect(result.periodo.fin).toEqual(endDate);
      expect(result.total).toBe(2);
    });

    it('debería retornar 0 inspecciones si no hay en el período', async () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');

      inspectionRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.getStatsByPeriod(startDate, endDate);

      expect(result.total).toBe(0);
      expect(result.porEstado.nueva).toBe(0);
    });
  });
});
