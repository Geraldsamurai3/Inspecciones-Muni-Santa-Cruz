# 🧪 Guía de Pruebas Unitarias - Inspecciones Backend

## 📋 Índice
1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Estructura de Pruebas](#estructura-de-pruebas)
4. [Ejecutar Pruebas](#ejecutar-pruebas)
5. [Cobertura de Pruebas](#cobertura-de-pruebas)
6. [Módulos Probados](#módulos-probados)
7. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

Este proyecto utiliza **Jest** como framework de pruebas unitarias junto con las utilidades de testing de NestJS (`@nestjs/testing`).

### Tecnologías de Testing
- **Jest**: Framework de pruebas
- **@nestjs/testing**: Módulo de testing de NestJS
- **ts-jest**: Transformador TypeScript para Jest
- **supertest**: Para pruebas E2E (end-to-end)

---

## Configuración

La configuración de Jest está en `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## Estructura de Pruebas

Cada módulo tiene su archivo de pruebas con la extensión `.spec.ts`:

```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts       ✅ Creado
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts    ✅ Creado
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts      ✅ Creado
│   └── users.controller.ts
├── stats/
│   ├── stats.service.ts
│   ├── stats.service.spec.ts      ✅ Creado
│   ├── stats.controller.ts
│   └── stats.controller.spec.ts   ✅ Creado
└── inspections/
    ├── inspections.service.ts
    └── inspections.controller.ts
```

---

## Ejecutar Pruebas

### Comandos Disponibles

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (re-ejecuta al guardar cambios)
npm run test:watch

# Ejecutar pruebas con reporte de cobertura
npm run test:cov

# Ejecutar pruebas en modo debug
npm run test:debug

# Ejecutar pruebas E2E
npm run test:e2e
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas del módulo Stats
npm test -- stats

# Solo pruebas del servicio de Auth
npm test -- auth.service

# Solo pruebas de un archivo específico
npm test -- stats.controller.spec.ts
```

### Ejemplo de Salida

```
 PASS  src/stats/stats.service.spec.ts
 PASS  src/stats/stats.controller.spec.ts
 PASS  src/auth/auth.service.spec.ts
 PASS  src/auth/auth.controller.spec.ts
 PASS  src/users/users.service.spec.ts

Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        5.123 s
```

---

## Cobertura de Pruebas

### Ver Reporte de Cobertura

```bash
npm run test:cov
```

Esto generará:
1. Un reporte en consola
2. Una carpeta `coverage/` con reportes HTML

### Ver Reporte HTML

```bash
# Windows
start coverage/lcov-report/index.html

# Mac/Linux
open coverage/lcov-report/index.html
```

### Objetivo de Cobertura

| Categoría | Objetivo |
|-----------|----------|
| Statements | > 80% |
| Branches | > 75% |
| Functions | > 80% |
| Lines | > 80% |

---

## Módulos Probados

### ✅ Stats Module

**stats.service.spec.ts** - 9 pruebas
- ✓ getInspectionStats()
- ✓ getInspectorStats()
- ✓ getDetailedStats()
- ✓ getDashboardStats()
- ✓ getStatusCounts()
- ✓ getDependencyStats() con diferentes períodos
- ✓ getInspectorPerformance()

**stats.controller.spec.ts** - 9 pruebas
- ✓ Todos los endpoints del controlador
- ✓ Validación de parámetros
- ✓ Integración con el servicio

### ✅ Auth Module

**auth.service.spec.ts** - 7 pruebas
- ✓ register() - Registro de usuarios
- ✓ validateUser() - Validación de credenciales
- ✓ login() - Generación de token JWT
- ✓ Manejo de errores (usuario no encontrado, contraseña incorrecta, cuenta bloqueada)

**auth.controller.spec.ts** - 2 pruebas
- ✓ Endpoint /register
- ✓ Endpoint /login

### ✅ Users Module

**users.service.spec.ts** - 11 pruebas
- ✓ create() - Creación de usuarios
- ✓ findAll() - Listar usuarios
- ✓ findOne() - Buscar por ID
- ✓ findByEmail() - Buscar por email
- ✓ update() - Actualizar usuario
- ✓ remove() - Eliminar usuario
- ✓ generateResetToken() - Generar token de recuperación
- ✓ setResetToken() - Establecer token
- ✓ resetPassword() - Restablecer contraseña

---

## Mejores Prácticas

### 1. Estructura de Prueba (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange (Preparar)
  const mockData = { id: 1, name: 'Test' };
  mockService.method.mockResolvedValue(mockData);

  // Act (Actuar)
  const result = await controller.endpoint();

  // Assert (Afirmar)
  expect(result).toEqual(mockData);
  expect(mockService.method).toHaveBeenCalledWith(expectedParams);
});
```

### 2. Usar Mocks para Dependencias

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};
```

### 3. Limpiar después de cada prueba

```typescript
afterEach(() => {
  jest.clearAllMocks();
});
```

### 4. Probar Casos Exitosos y de Error

```typescript
describe('findOne', () => {
  it('should return a user', async () => {
    // Caso exitoso
  });

  it('should throw NotFoundException', async () => {
    // Caso de error
  });
});
```

### 5. Nombres Descriptivos

```typescript
// ✅ Bueno
it('should throw UnauthorizedException when password is incorrect')

// ❌ Malo
it('should throw error')
```

---

## Crear Nuevas Pruebas

### Template para Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { YourService } from './your.service';
import { YourEntity } from './entities/your.entity';

describe('YourService', () => {
  let service: YourService;
  let repository;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(YourEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = module.get(getRepositoryToken(YourEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Agregar más pruebas aquí
});
```

### Template para Controller

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from './your.controller';
import { YourService } from './your.service';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  const mockService = {
    method1: jest.fn(),
    method2: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Agregar más pruebas aquí
});
```

---

## Próximos Pasos

### Módulos Pendientes de Pruebas

- [ ] **Inspections Module**
  - [ ] inspections.service.spec.ts
  - [ ] inspections.controller.spec.ts
  
- [ ] **Email Module**
  - [ ] email.service.spec.ts
  
- [ ] **Cloudinary Module**
  - [ ] cloudinary.service.spec.ts
  
- [ ] **Dashboard Module**
  - [ ] dashboard.service.spec.ts
  - [ ] dashboard.controller.spec.ts

### Comandos para Generar Pruebas

NestJS CLI puede generar pruebas automáticamente:

```bash
# Generar pruebas para un servicio
nest generate service inspections --spec

# Generar pruebas para un controlador
nest generate controller inspections --spec
```

---

## Debugging de Pruebas

### Visual Studio Code

Agregar configuración en `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "windows": {
    "program": "${workspaceFolder}/node_modules/jest/bin/jest"
  }
}
```

### Ejecutar con Breakpoints

1. Agregar breakpoints en el código
2. Ejecutar: `npm run test:debug`
3. Abrir Chrome: `chrome://inspect`
4. Click en "inspect" del proceso Node

---

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Ejemplo Completo de Ejecución

```bash
# 1. Instalar dependencias (si es necesario)
npm install

# 2. Ejecutar todas las pruebas
npm test

# 3. Ver cobertura
npm run test:cov

# 4. Ejecutar en modo watch durante desarrollo
npm run test:watch
```

---

## Troubleshooting

### Error: Cannot find module

```bash
# Limpiar caché de Jest
npm test -- --clearCache

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Pruebas muy lentas

```bash
# Ejecutar con un solo worker
npm test -- --maxWorkers=1

# Ejecutar solo pruebas modificadas
npm test -- --onlyChanged
```

### Mock no funciona

```typescript
// Asegurarse de limpiar mocks
afterEach(() => {
  jest.clearAllMocks();
  // o
  jest.resetAllMocks();
});
```

---

## Contacto y Soporte

Si tienes preguntas sobre las pruebas:
1. Revisa esta documentación
2. Consulta la documentación oficial de Jest y NestJS
3. Revisa los ejemplos en los archivos `.spec.ts` existentes

---

**¡Felices Pruebas! 🧪✨**
