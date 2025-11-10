# Guía de Desarrollo

## Índice
1. [Configuración del Entorno](#configuración-del-entorno)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Estándares de Código](#estándares-de-código)
5. [Testing](#testing)
6. [Git y Versionado](#git-y-versionado)
7. [Debugging](#debugging)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Configuración del Entorno

### Requisitos

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **MariaDB:** 10.x
- **Git:** Última versión

### Instalación Inicial

```bash
# 1. Clonar repositorio
git clone https://github.com/Geraldsamurai3/Inspecciones-Muni-Santa-Cruz.git
cd Inspecciones-Muni-Santa-Cruz

# 2. Instalar dependencias
npm install

# 3. Copiar archivo de entorno
cp .env.example .env

# 4. Configurar variables de entorno
nano .env  # o tu editor preferido

# 5. Iniciar MariaDB
# Windows: Abrir XAMPP o MySQL Workbench
# Linux/Mac: sudo systemctl start mariadb

# 6. Crear base de datos (automático en primer inicio)
# O manualmente: mysql -u root -p -e "CREATE DATABASE inspect_muni;"

# 7. Iniciar servidor en modo desarrollo
npm run start:dev
```

### Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=inspect_muni

# TypeORM
TYPEORM_SYNC=true

# Server
PORT=3000
FRONTEND_URL=http://localhost:5174

# JWT
JWT_SECRET=tu_secreto_desarrollo
JWT_EXPIRATION=1h

# Cloudinary
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
EMAIL_FROM="Inspecciones <no-reply@midominio.com>"
```

### Verificar Instalación

```bash
# Compilar proyecto
npm run build

# Ejecutar tests
npm run test

# Iniciar en modo desarrollo
npm run start:dev

# Verificar en navegador
# http://localhost:3000 → Debe mostrar health check
```

---

## Estructura del Proyecto

### Convenciones de Nomenclatura

**Archivos:**
- **Entidades:** `user.entity.ts`, `inspection.entity.ts`
- **Controllers:** `users.controller.ts`, `auth.controller.ts`
- **Services:** `users.service.ts`, `email.service.ts`
- **DTOs:** `create-user.dto.ts`, `update-inspection.dto.ts`
- **Enums:** `inspection-status.enum.ts`, `district.enum.ts`
- **Modules:** `users.module.ts`, `auth.module.ts`

**Clases:**
- **PascalCase:** `User`, `InspectionService`, `JwtAuthGuard`

**Variables y Funciones:**
- **camelCase:** `findOne`, `userId`, `inspectionDate`

**Constantes:**
- **UPPER_SNAKE_CASE:** `IS_PUBLIC_KEY`, `JWT_SECRET`

### Organización por Módulos

```
src/
├── auth/                    # Autenticación
│   ├── guards/              # Guards (JWT, Roles)
│   ├── decorators/          # Decorators (@Public, @Roles)
│   ├── dto/                 # DTOs (login, register)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
│
├── users/                   # Gestión de usuarios
│   ├── entities/            # User entity
│   ├── dto/                 # Create/Update DTOs
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── inspections/             # Módulo principal
│   ├── Controllers/         # Controllers especializados
│   ├── Services/            # Services especializados
│   ├── Entities/            # Todas las entidades
│   ├── DTO/                 # DTOs de validación
│   ├── Enums/               # Enumeraciones
│   ├── moduls/              # Submódulos
│   ├── inspections.controller.ts
│   ├── inspections.service.ts
│   └── inspections.module.ts
│
├── dashboard/               # Dashboards
├── stats/                   # Estadísticas
├── reports/                 # Generación de reportes
├── cloudinary/              # Manejo de imágenes
├── email/                   # Envío de emails
│
├── main.ts                  # Punto de entrada
└── app.module.ts            # Módulo raíz
```

---

## Flujo de Trabajo

### Agregar Nuevo Endpoint

**Ejemplo: Agregar endpoint para obtener inspecciones archivadas**

```bash
# 1. Crear método en service
# src/inspections/inspections.service.ts
```

```typescript
async findArchived(): Promise<any[]> {
  const inspections = await this.inspectionRepo.find({
    where: { status: InspectionStatus.ARCHIVED },
    relations: ['inspectors', 'construction', 'location'],
  });

  return this.sanitizeInspections(inspections);
}
```

```bash
# 2. Crear endpoint en controller
# src/inspections/inspections.controller.ts
```

```typescript
@Get('archived')
findArchived() {
  return this.service.findArchived();
}
```

```bash
# 3. Probar en Postman/Thunder Client
# GET http://localhost:3000/inspections/archived
```

---

### Agregar Nueva Entidad

**Ejemplo: Agregar entidad "Comment" para inspecciones**

```bash
# 1. Crear archivo de entidad
# src/inspections/Entities/comment.entity.ts
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Inspection } from './inspections.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Inspection, inspection => inspection.comments)
  inspection: Inspection;

  @ManyToOne(() => User)
  author: User;
}
```

```bash
# 2. Actualizar Inspection entity
# src/inspections/Entities/inspections.entity.ts
```

```typescript
@OneToMany(() => Comment, comment => comment.inspection, { cascade: true })
comments: Comment[];
```

```bash
# 3. Crear DTOs
# src/inspections/DTO/create-comment.dto.ts
```

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
```

```bash
# 4. Registrar entidad en módulo
# src/inspections/inspections.module.ts
```

```typescript
TypeOrmModule.forFeature([Inspection, Comment])
```

```bash
# 5. Reiniciar servidor (sincronización automática crea tabla)
# npm run start:dev
```

---

### Agregar Validación Personalizada

**Ejemplo: Validar que cédula costarricense es válida**

```bash
# 1. Crear validator
# src/common/validators/cedula.validator.ts
```

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCedulaCostarricense(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCedulaCostarricense',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // Formato: 1-2345-6789 o 1-0123-0456
          const regex = /^\d{1,2}-\d{4}-\d{4}$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Cédula debe tener formato 1-2345-6789';
        },
      },
    });
  };
}
```

```bash
# 2. Usar en DTO
# src/users/dto/create-user.dto.ts
```

```typescript
import { IsCedulaCostarricense } from 'src/common/validators/cedula.validator';

export class CreateUserDto {
  @IsCedulaCostarricense()
  cedula: string;
}
```

---

### Agregar Relación Nueva

**Ejemplo: Agregar relación ManyToMany entre Inspection y Tag**

```bash
# 1. Crear entidad Tag
# src/inspections/Entities/tag.entity.ts
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Inspection } from './inspections.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Inspection, inspection => inspection.tags)
  inspections: Inspection[];
}
```

```bash
# 2. Actualizar Inspection
# src/inspections/Entities/inspections.entity.ts
```

```typescript
@ManyToMany(() => Tag, tag => tag.inspections)
@JoinTable({ name: 'inspection_tags' })
tags: Tag[];
```

```bash
# 3. Usar en service
# src/inspections/inspections.service.ts
```

```typescript
async create(dto: CreateInspectionDto): Promise<Inspection> {
  const tags = await this.tagRepo.findBy({ id: In(dto.tagIds || []) });
  
  const inspection = this.inspectionRepo.create({
    ...dto,
    tags,
  });
  
  return this.inspectionRepo.save(inspection);
}
```

---

## Estándares de Código

### ESLint y Prettier

**Configuración:**

```json
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
```

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

**Ejecutar:**

```bash
# Lint
npm run lint

# Format
npm run format

# Fix automático
npm run lint -- --fix
```

---

### Comentarios y Documentación

**JSDoc en funciones públicas:**

```typescript
/**
 * Busca todas las inspecciones por número de trámite
 * @param procedureNumber Número de trámite (ej: "2025-001")
 * @returns Array de inspecciones con relaciones completas
 * @throws NotFoundException si no se encuentra ninguna inspección
 */
async findAllByProcedureNumber(procedureNumber: string): Promise<Inspection[]> {
  const inspections = await this.inspectionRepo.find({
    where: { procedureNumber },
    relations: ['inspectors', 'construction', 'location'],
  });

  if (!inspections.length) {
    throw new NotFoundException(`No se encontraron inspecciones con número ${procedureNumber}`);
  }

  return inspections;
}
```

**Comentarios inline para lógica compleja:**

```typescript
// Anidar parcelas dentro de concession para que cascade funcione
if (dtoToCreate.concession && dtoToCreate.concessionParcels) {
  dtoToCreate.concession = {
    ...dtoToCreate.concession,
    parcels: dtoToCreate.concessionParcels
  };
  delete dtoToCreate.concessionParcels;
}
```

---

### Manejo de Errores

**Usar excepciones de NestJS:**

```typescript
import { 
  NotFoundException, 
  BadRequestException, 
  UnauthorizedException 
} from '@nestjs/common';

// 404: Recurso no encontrado
if (!inspection) {
  throw new NotFoundException(`Inspection with ID ${id} not found`);
}

// 400: Datos inválidos
if (dto.status === InspectionStatus.ARCHIVED) {
  throw new BadRequestException('No puedes archivar manualmente una inspección');
}

// 401: Sin autenticación
if (!user) {
  throw new UnauthorizedException('Credenciales inválidas');
}
```

**Try-Catch para errores inesperados:**

```typescript
async generatePDF(id: number): Promise<Buffer> {
  try {
    const inspection = await this.findOne(id);
    return PDFFormatterService.generateOfficialPDF(inspection);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new InternalServerErrorException('Error generando PDF');
  }
}
```

---

## Testing

### Tests Unitarios (Jest)

**Crear test para service:**

```bash
# Archivo: src/inspections/inspections.service.spec.ts
```

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { InspectionsService } from './inspections.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inspection } from './Entities/inspections.entity';

describe('InspectionsService', () => {
  let service: InspectionsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InspectionsService,
        {
          provide: getRepositoryToken(Inspection),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InspectionsService>(InspectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of inspections', async () => {
      const mockInspections = [
        { id: 1, procedureNumber: '2025-001' },
        { id: 2, procedureNumber: '2025-002' },
      ];
      mockRepository.find.mockResolvedValue(mockInspections);

      const result = await service.findAll();

      expect(result).toEqual(mockInspections);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { deletedAt: null },
        relations: expect.any(Array),
      });
    });
  });
});
```

**Ejecutar tests:**

```bash
# Todos los tests
npm run test

# Watch mode (auto-ejecuta al cambiar)
npm run test:watch

# Coverage
npm run test:cov
```

---

### Tests E2E

**Crear test E2E:**

```bash
# Archivo: test/inspections.e2e-spec.ts
```

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('InspectionsController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login para obtener token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);

    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/inspections (GET)', () => {
    it('should return all inspections', () => {
      return request(app.getHttpServer())
        .get('/inspections')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/inspections (POST)', () => {
    it('should create a new inspection', () => {
      return request(app.getHttpServer())
        .post('/inspections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          procedureNumber: '2025-TEST',
          inspectionDate: '2025-01-10',
          applicantType: 'Persona Física',
          inspectorIds: [1],
          construction: {
            landUseType: 'Residencial',
            matchesLocation: true,
            recommended: true,
          },
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.procedureNumber).toBe('2025-TEST');
        });
    });
  });
});
```

**Ejecutar tests E2E:**

```bash
npm run test:e2e
```

---

## Git y Versionado

### Convención de Commits

**Formato:** `<type>(<scope>): <subject>`

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato (sin cambios de código)
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
git commit -m "feat(inspections): agregar endpoint para inspecciones archivadas"
git commit -m "fix(auth): corregir validación de token expirado"
git commit -m "docs(api): actualizar documentación de endpoints"
git commit -m "refactor(services): extraer lógica de sanitización"
git commit -m "test(users): agregar tests para UsersService"
```

---

### Workflow de Git

```bash
# 1. Crear branch desde main
git checkout main
git pull origin main
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios
# ... editar código ...

# 3. Commit
git add .
git commit -m "feat(module): descripción del cambio"

# 4. Push
git push origin feature/nueva-funcionalidad

# 5. Pull Request en GitHub
# 6. Review y merge
# 7. Eliminar branch
git checkout main
git pull origin main
git branch -d feature/nueva-funcionalidad
```

---

### Branches

- **main:** Producción (protegida)
- **develop:** Desarrollo activo
- **feature/*:** Nuevas funcionalidades
- **fix/*:** Correcciones
- **hotfix/*:** Correcciones urgentes en producción

---

## Debugging

### Debug en VS Code

**Configuración (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Debug NestJS",
      "port": 9229,
      "restart": true,
      "stopOnEntry": false,
      "protocol": "inspector"
    }
  ]
}
```

**Iniciar en modo debug:**

```bash
npm run start:debug
```

**Usar breakpoints:**
1. Click en número de línea en VS Code
2. F5 para iniciar debugger
3. Ejecutar request que active el breakpoint
4. Inspeccionar variables

---

### Console.log Estratégico

```typescript
// Entrada de función
async create(dto: CreateInspectionDto) {
  console.log('📝 Creando inspección:', { procedureNumber: dto.procedureNumber });
  
  // Verificar datos
  console.log('👥 Inspectores:', dto.inspectorIds);
  
  const inspection = await this.repo.save(...);
  
  // Resultado
  console.log('✅ Inspección creada:', inspection.id);
  
  return inspection;
}
```

---

### Logs de Base de Datos

**Ver queries SQL:**

```typescript
// app.module.ts (desarrollo)
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    // ...
    logging: true,  // Activar logs SQL
    logger: 'advanced-console',
  }),
})
```

**Ver queries en consola:**
```sql
query: SELECT * FROM `inspections` WHERE `status` = ? -- PARAMETERS: ["Nuevo"]
query: INSERT INTO `inspections` ... -- PARAMETERS: [...]
```

---

## Mejores Prácticas

### 1. Servicios Reutilizables

**❌ NO:**
```typescript
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }
}
```

**✅ SÍ:**
```typescript
// Service
async findOne(id: number): Promise<User> {
  const user = await this.repo.findOneBy({ id });
  if (!user) throw new NotFoundException(`User ${id} not found`);
  return user;
}

// Controller
@Get(':id')
findOne(@Param('id') id: number) {
  return this.service.findOne(id);
}
```

---

### 2. DTOs para Validación

**❌ NO:**
```typescript
@Post()
create(@Body() body: any) {
  return this.service.create(body);
}
```

**✅ SÍ:**
```typescript
@Post()
create(@Body() dto: CreateInspectionDto) {
  return this.service.create(dto);
}
```

---

### 3. Sanitizar Datos Sensibles

**❌ NO:**
```typescript
return user;  // Devuelve passwordHash, resetToken, etc.
```

**✅ SÍ:**
```typescript
const { passwordHash, resetToken, ...safeUser } = user;
return safeUser;

// O usar método:
return user.toSafeObject();
```

---

### 4. Async/Await sobre Promises

**❌ NO:**
```typescript
findAll() {
  return this.repo.find().then(inspections => {
    return inspections;
  });
}
```

**✅ SÍ:**
```typescript
async findAll() {
  const inspections = await this.repo.find();
  return inspections;
}
```

---

### 5. Parámetros de Tipo Correctos

**❌ NO:**
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.service.findOne(parseInt(id));
}
```

**✅ SÍ:**
```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}
```

---

### 6. Transacciones para Operaciones Complejas

```typescript
async createInspectionWithHistory(dto: CreateInspectionDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const inspection = await queryRunner.manager.save(Inspection, dto);
    const history = await queryRunner.manager.save(History, {
      inspectionId: inspection.id,
      action: 'created',
    });

    await queryRunner.commitTransaction();
    return inspection;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

---

### 7. Cachear Queries Pesadas

**⏳ NO IMPLEMENTADO - Ejemplo con Redis:**

```typescript
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class StatsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getStats() {
    const cached = await this.cacheManager.get('stats');
    if (cached) return cached;

    const stats = await this.calculateStats();  // Query pesado
    
    await this.cacheManager.set('stats', stats, { ttl: 300 });  // 5 min
    return stats;
  }
}
```

---

## Recursos

### Documentación Oficial

- **NestJS:** https://docs.nestjs.com/
- **TypeORM:** https://typeorm.io/
- **MariaDB:** https://mariadb.com/kb/en/documentation/
- **Cloudinary:** https://cloudinary.com/documentation
- **SendGrid:** https://docs.sendgrid.com/

### Comunidad

- **Discord NestJS:** https://discord.gg/nestjs
- **Stack Overflow:** Tag `nestjs`
- **GitHub Issues:** https://github.com/nestjs/nest/issues

---

**Documento Completo. Ver:** [README.md](./README.md)
