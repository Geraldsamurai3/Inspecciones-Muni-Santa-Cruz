# Arquitectura del Sistema

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Flujo de Datos](#flujo-de-datos)
6. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)

---

## Visión General

El sistema sigue una arquitectura **monolítica modular** basada en NestJS, con separación clara de responsabilidades mediante módulos independientes. La comunicación con el frontend es mediante API REST.

### Características Arquitectónicas

- **Framework:** NestJS (Node.js con TypeScript)
- **Patrón:** MVC + Repository Pattern
- **Base de Datos:** MariaDB con TypeORM
- **Autenticación:** JWT + Passport Strategy
- **Validación:** Class-validator + Class-transformer
- **Almacenamiento:** Cloudinary (imágenes)
- **Email:** Nodemailer + Handlebars templates

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + Vite)                            │
│                 http://localhost:5174                        │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST
                       │ (JWT Token)
┌──────────────────────▼───────────────────────────────────────┐
│                     BACKEND - NestJS                         │
│                  http://localhost:3000                       │
│ ┌────────────────────────────────────────────────────────┐  │
│ │              API LAYER (Controllers)                   │  │
│ │  Auth │ Users │ Inspections │ Dashboard │ Reports...  │  │
│ └────────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│ ┌────────────────────▼───────────────────────────────────┐  │
│ │            BUSINESS LOGIC (Services)                   │  │
│ │  Validation │ Authorization │ Business Rules          │  │
│ └────────────────────┬───────────────────────────────────┘  │
│                      │                                       │
│ ┌────────────────────▼───────────────────────────────────┐  │
│ │          DATA ACCESS LAYER (Repositories)              │  │
│ │              TypeORM Repository Pattern                │  │
│ └────────────────────┬───────────────────────────────────┘  │
└──────────────────────┼───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐  ┌───▼────────┐  ┌─▼──────────┐
│   MariaDB    │  │ Cloudinary │  │   SMTP     │
│   Database   │  │  (Images)  │  │  (Email)   │
│  Port: 3306  │  │    CDN     │  │  Gmail/SG  │
└──────────────┘  └────────────┘  └────────────┘
```

### Flujo de Petición

```
1. Frontend → Controller (JWT Guard verifica token)
2. Controller → DTO Validation (class-validator)
3. Controller → Service (Business Logic)
4. Service → Repository (TypeORM)
5. Repository → Database (MariaDB)
6. Database → Repository (Resultados)
7. Repository → Service (Procesamiento)
8. Service → Controller (Sanitización)
9. Controller → Frontend (JSON Response)
```

---

## Estructura de Directorios

```
inspecciones/
├── src/
│   ├── main.ts                    # Punto de entrada
│   ├── app.module.ts              # Módulo raíz
│   ├── app.controller.ts          # Health check
│   ├── app.service.ts
│   │
│   ├── auth/                      # Módulo de autenticación
│   │   ├── auth.controller.ts     # POST /auth/login, /register
│   │   ├── auth.service.ts        # Lógica de login/registro
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts        # Estrategia Passport JWT
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts  # Guard JWT global
│   │   │   └── block.guard.ts     # Verifica si usuario está bloqueado
│   │   ├── decorators/
│   │   │   └── public.decorator.ts # @Public() para rutas sin auth
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/                     # Módulo de usuarios
│   │   ├── users.controller.ts    # CRUD usuarios
│   │   ├── users.service.ts       # Lógica de negocio
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts     # Entidad TypeORM
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── inspections/               # Módulo principal
│   │   ├── inspections.controller.ts
│   │   ├── inspections.service.ts
│   │   ├── inspections.module.ts
│   │   │
│   │   ├── Controllers/           # Controllers especializados
│   │   │   ├── construction.controller.ts
│   │   │   ├── location.controller.ts
│   │   │   ├── collections.controller.ts
│   │   │   ├── work-closures.controller.ts
│   │   │   ├── platforms-and-services.controller.ts
│   │   │   └── ... (otros 9 controllers)
│   │   │
│   │   ├── Services/              # Servicios especializados
│   │   │   ├── construction.service.ts
│   │   │   ├── location.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── Entities/              # 18 entidades TypeORM
│   │   │   ├── inspections.entity.ts      # Entidad principal
│   │   │   ├── construction.entity.ts
│   │   │   ├── individual-request.entity.ts
│   │   │   ├── legal-entity-request.entity.ts
│   │   │   ├── collection.entity.ts
│   │   │   ├── work-closure.entity.ts
│   │   │   ├── platforms-and-services.entity.ts
│   │   │   └── ... (otras 11 entidades)
│   │   │
│   │   ├── DTO/                   # DTOs de validación
│   │   │   ├── create-inspection.dto.ts
│   │   │   ├── update-inspection.dto.ts
│   │   │   ├── create-construction.dto.ts
│   │   │   └── ... (30+ DTOs)
│   │   │
│   │   ├── Enums/                 # Enumeraciones
│   │   │   ├── inspection-status.enum.ts
│   │   │   ├── applicant.enum.ts
│   │   │   ├── district.enum.ts
│   │   │   └── ... (otros 9 enums)
│   │   │
│   │   └── moduls/                # Submódulos
│   │       ├── construction.module.ts
│   │       ├── location.module.ts
│   │       └── ...
│   │
│   ├── dashboard/                 # Módulo de dashboards
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts   # Lógica de dashboards por rol
│   │   └── dashboard.module.ts
│   │
│   ├── stats/                     # Módulo de estadísticas
│   │   ├── stats.controller.ts
│   │   ├── stats.service.ts       # Métricas y análisis
│   │   └── stats.module.ts
│   │
│   ├── reports/                   # Módulo de reportes
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts     # Generación PDF/CSV
│   │   ├── pdf-formatter.service.ts # Formato oficial PDF
│   │   └── reports.module.ts
│   │
│   ├── cloudinary/                # Módulo de imágenes
│   │   ├── cloudinary.controller.ts # POST /upload, DELETE /destroy
│   │   ├── cloudinary.service.ts
│   │   ├── cloudinary.provider.ts # Configuración SDK
│   │   └── cloudinary.module.ts
│   │
│   ├── email/                     # Módulo de emails
│   │   ├── email.controller.ts
│   │   ├── email.service.ts       # Nodemailer + Handlebars
│   │   ├── email.module.ts
│   │   └── templates/             # Plantillas HBS
│   │       ├── welcome.hbs
│   │       └── reset-password.hbs
│   │
│   └── ...
│
├── test/                          # Tests E2E
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                           # Variables de entorno
├── package.json                   # Dependencias
├── tsconfig.json                  # Configuración TypeScript
├── nest-cli.json                  # Configuración NestJS
└── documentos/                    # Documentación técnica
    ├── 01-RESUMEN-EJECUTIVO.md
    └── 02-ARQUITECTURA.md
```

---

## Patrones de Diseño

### 1. **Module Pattern (NestJS)**

Cada funcionalidad está encapsulada en un módulo:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Inspection])],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService]
})
export class InspectionsModule {}
```

### 2. **Repository Pattern (TypeORM)**

Acceso a datos a través de repositorios:

```typescript
@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>
  ) {}
}
```

### 3. **Dependency Injection**

Inyección de dependencias automática:

```typescript
constructor(
  private readonly usersService: UsersService,
  private readonly emailService: EmailService,
  private readonly jwtService: JwtService
) {}
```

### 4. **DTO Pattern (Data Transfer Object)**

Validación y transformación de datos:

```typescript
export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty()
  procedureNumber: string;

  @IsDate()
  @Type(() => Date)
  inspectionDate: Date;
}
```

### 5. **Guard Pattern**

Protección de rutas:

```typescript
@UseGuards(JwtAuthGuard)
export class InspectionsController {
  // Requiere autenticación
}
```

### 6. **Decorator Pattern**

Metadatos personalizados:

```typescript
@Public() // Excluye de JwtAuthGuard
@Post('login')
async login() { }
```

### 7. **Strategy Pattern (Passport)**

Estrategia de autenticación JWT:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
```

### 8. **Factory Pattern**

Creación de instancias complejas:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    type: 'mariadb',
    host: config.get('DB_HOST'),
    // ...
  })
})
```

---

## Flujo de Datos

### Flujo de Autenticación

```
1. Usuario → POST /auth/login { email, password }
2. AuthController → AuthService.login()
3. AuthService → UsersService.findByEmail()
4. UsersService → Repository.findOne()
5. Repository → MariaDB
6. MariaDB → Usuario encontrado
7. AuthService → bcrypt.compare(password, hash)
8. AuthService → jwtService.sign({ sub, role })
9. AuthController → { access_token: "..." }
10. Frontend → Guarda token en localStorage
11. Peticiones subsecuentes → Authorization: Bearer {token}
```

### Flujo de Creación de Inspección

```
1. Frontend → POST /inspections { inspection data }
2. JwtAuthGuard → Valida token JWT
3. ValidationPipe → Valida CreateInspectionDto
4. InspectionsController → InspectionsService.create()
5. Service → Valida reglas de negocio
6. Service → Resuelve relaciones (inspectors, subdependencias)
7. Service → Repository.create() + Repository.save()
8. Repository → Cascade guarda entidades relacionadas
9. MariaDB → INSERT en múltiples tablas
10. Service → Sanitiza datos sensibles
11. Controller → Devuelve inspección creada
```

### Flujo de Generación de PDF

```
1. Frontend → GET /reports/pdf/{procedureNumber}
2. JwtAuthGuard → Valida token
3. ReportsController → ReportsService.generatePDF()
4. Service → InspectionRepo.findOne() con relaciones
5. Service → PDFFormatterService.generateOfficialPDF()
6. PDFFormatter → Descarga imágenes de Cloudinary
7. PDFFormatter → Genera PDF con pdfkit (3 páginas)
8. Service → Devuelve Buffer
9. Controller → Content-Type: application/pdf
10. Frontend → Abre/descarga PDF
```

### Flujo de Subida de Imagen

```
1. Frontend → POST /cloudinary/upload (FormData con archivo)
2. JwtAuthGuard → Valida token
3. FileInterceptor → Procesa archivo con Multer
4. CloudinaryController → CloudinaryService.uploadImage()
5. Service → Cloudinary SDK upload_stream()
6. Cloudinary → Procesa y almacena imagen
7. Cloudinary → Devuelve { secure_url, public_id, ... }
8. Controller → Devuelve URL de imagen
9. Frontend → Guarda URL en estado
10. Frontend → Incluye URL en payload de inspección
```

---

## Decisiones Arquitectónicas

### 1. ¿Por qué NestJS?

**Ventajas:**
- Estructura modular escalable
- TypeScript nativo (type safety)
- Decoradores para reducir boilerplate
- Ecosistema maduro (similar a Angular)
- Dependency Injection nativa
- Testing integrado (Jest)

### 2. ¿Por qué MariaDB sobre PostgreSQL?

**Razones:**
- Mayor rendimiento en operaciones de lectura
- Compatible con MySQL (infraestructura existente)
- Mejor soporte en Railway
- Menor curva de aprendizaje para el equipo

### 3. ¿Por qué TypeORM?

**Ventajas:**
- Active Record y Data Mapper patterns
- Migraciones automáticas (synchronize: true)
- Cascade operations para relaciones
- Decoradores TypeScript nativos
- Soporte completo para MariaDB

### 4. ¿Por qué Cloudinary?

**Razones:**
- CDN global (rendimiento)
- Transformaciones automáticas de imágenes
- 25GB gratis/mes
- API sencilla
- No requiere servidor de archivos

### 5. ¿Por qué JWT sobre Sessions?

**Ventajas:**
- Stateless (escalabilidad horizontal)
- Funciona en arquitecturas distribuidas
- No requiere almacenamiento en servidor
- Compatible con mobile apps futuras

### 6. Decisión: Guard Global vs. Guard por Ruta

**Elegido:** Guard Global con @Public() decorator

**Razón:**  
- Secure by default (todas las rutas protegidas)
- Menos código repetitivo
- Fácil auditar rutas públicas
- Previene olvidos de seguridad

```typescript
// app.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard, // Aplicado globalmente
}

// auth.controller.ts
@Public() // Excepción explícita
@Post('login')
```

### 7. Decisión: Cascade en Relaciones

**Elegido:** `cascade: true` en relaciones OneToOne

**Razón:**
- Simplifica creación de inspecciones
- Evita saves múltiples en Service
- Garantiza atomicidad (transacción única)

```typescript
@OneToOne(() => Construction, { cascade: true })
@JoinColumn()
construction: Construction;
```

### 8. Decisión: Soft Delete vs. Hard Delete

**Elegido:** Soft Delete con campo `deletedAt` y status `TRASHED`

**Razón:**
- Auditoría completa
- Recuperación de datos
- Cumplimiento legal
- No perdemos historial

### 9. Decisión: Múltiples Controllers vs. Controller Único

**Elegido:** Multiple Controllers (uno por subdependencia)

**Razón:**
- Separación de responsabilidades
- Código más mantenible
- Facilita testing unitario
- Permite escalabilidad (micro frontends)

### 10. Decisión: CRON Job para Archivado

**Elegido:** Ejecutar cada 5 horas

**Razón:**
- No interfiere con horario laboral
- Balance entre carga del servidor y actualización
- Suficiente frecuencia para SLA de 7 días

```typescript
@Cron('0 0 */5 * * *', { timeZone: 'America/Costa_Rica' })
async archiveReviewedOlderThan7Days() { }
```

---

## Integración con Servicios Externos

### Cloudinary

```typescript
// Configuración
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

// Uso
const result = await cloudinary.uploader.upload_stream({ folder: 'inspections' });
// → https://res.cloudinary.com/da84etlav/image/upload/v123/file.jpg
```

### Nodemailer (Email)

```typescript
// Configuración
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=andreylanza3@gmail.com
SMTP_PASS=gryg oagf vclj ltbe

// Uso
await transporter.sendMail({
  to: user.email,
  subject: 'Bienvenido',
  template: 'welcome',
  context: { firstName: user.firstName }
});
```

### Passport JWT

```typescript
// Configuración
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=1h

// Estrategia
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
}
```

---

## Escalabilidad y Rendimiento

### Puntos de Mejora Futuros

1. **Caché con Redis**
   - Cachear estadísticas frecuentes
   - Reducir queries a BD

2. **Paginación**
   - Implementar en `findAll()`
   - Evitar cargar miles de registros

3. **Índices en BD**
   - `procedureNumber` (búsquedas frecuentes)
   - `status` (filtros comunes)
   - `createdAt` (ordenamiento)

4. **Queue System (Bull)**
   - Generación de PDFs en background
   - Envío de emails asíncrono

5. **Compresión de Respuestas**
   - Middleware de compresión gzip
   - Reducir tamaño de payloads

6. **Rate Limiting**
   - Protección contra ataques DDoS
   - Throttling de endpoints públicos

---

## Seguridad

### Implementaciones Actuales

✅ JWT con expiración (1 hora)  
✅ Passwords hasheadas con bcrypt (factor 10)  
✅ Tokens de reset con SHA-256  
✅ Guard global con excepciones explícitas  
✅ CORS configurado para frontend específico  
✅ Validación de entrada con DTOs  
✅ Sanitización de datos sensibles  
✅ Prevención de inyección SQL (TypeORM)  

### Mejoras Recomendadas

⏳ Refresh tokens  
⏳ Rate limiting  
⏳ Helmet middleware  
⏳ HTTPS obligatorio en producción  
⏳ Auditoría de logs  
⏳ 2FA para admins  

---

**Próximo Documento:** [03-BASE-DE-DATOS.md](./03-BASE-DE-DATOS.md)
