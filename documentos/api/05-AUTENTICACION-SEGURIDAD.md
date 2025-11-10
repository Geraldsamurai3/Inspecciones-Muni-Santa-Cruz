# Autenticación y Seguridad

## Índice
1. [Estrategia de Autenticación](#estrategia-de-autenticación)
2. [JSON Web Tokens (JWT)](#json-web-tokens-jwt)
3. [Guards y Protección de Rutas](#guards-y-protección-de-rutas)
4. [Gestión de Contraseñas](#gestión-de-contraseñas)
5. [Recuperación de Contraseña](#recuperación-de-contraseña)
6. [Roles y Autorización](#roles-y-autorización)
7. [CORS y Configuración de Seguridad](#cors-y-configuración-de-seguridad)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Estrategia de Autenticación

### Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌─────────────────────────────┐
│    AuthController           │
└──────┬──────────────────────┘
       │
       │ 2. AuthService.login()
       ▼
┌─────────────────────────────┐
│    AuthService              │
│  - Busca usuario por email  │
│  - Compara password (bcrypt)│
│  - Verifica no bloqueado    │
└──────┬──────────────────────┘
       │
       │ 3. JwtService.sign()
       ▼
┌─────────────────────────────┐
│    JwtService               │
│  - Crea token JWT           │
│  - Payload: { sub, role }   │
│  - Expira en 1 hora         │
└──────┬──────────────────────┘
       │
       │ 4. { access_token }
       ▼
┌─────────────┐
│   Usuario   │
│ Guarda token│
└─────────────┘
```

### Implementación

```typescript
// auth.service.ts
async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.usersService.findByEmail(email);
  if (!user) 
    throw new UnauthorizedException('Credenciales inválidas');

  const passwordMatches = await bcrypt.compare(pass, user.passwordHash);
  if (!passwordMatches)
    throw new UnauthorizedException('Credenciales inválidas');

  if (user.isBlocked)
    throw new ForbiddenException('Tu cuenta está bloqueada');

  const { passwordHash, resetToken, resetTokenExpires, ...payload } = user;
  return payload; 
}

async login(dto: LoginDto) {
  const user = await this.validateUser(dto.email, dto.password);
  if (!user) 
    throw new UnauthorizedException('Credenciales inválidas');

  const payload = { sub: user.id, role: user.role };
  return { access_token: this.jwtService.sign(payload) };
}
```

---

## JSON Web Tokens (JWT)

### Configuración

```typescript
// auth.module.ts
import { JwtModule } from '@nestjs/jwt';

JwtModule.register({
  secret: process.env.JWT_SECRET,        // 'tu_secreto_jwt'
  signOptions: { expiresIn: '1h' },      // Token expira en 1 hora
})
```

### Variables de Entorno

```env
JWT_SECRET=tu_secreto_jwt              # Cambiar en producción
JWT_EXPIRATION=1h                      # Tiempo de expiración
```

### Estructura del Token

**Payload:**
```json
{
  "sub": 1,                              // User ID
  "role": "inspector",                   // Rol del usuario
  "iat": 1704888000,                     // Issued at (timestamp)
  "exp": 1704891600                      // Expiration (timestamp)
}
```

**Token Completo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJpbnNwZWN0b3IiLCJpYXQiOjE3MDQ4ODgwMDAsImV4cCI6MTcwNDg5MTYwMH0.signature
```

### Uso del Token

**Frontend debe enviar en header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo JavaScript:**
```javascript
// Guardar token después de login
localStorage.setItem('access_token', response.access_token);

// Enviar en requests subsecuentes
fetch('http://localhost:3000/inspections', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## Guards y Protección de Rutas

### JwtAuthGuard Global

**Configuración en app.module.ts:**

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,  // Aplicado globalmente
    },
  ],
})
export class AppModule {}
```

**Implementación:**

```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta tiene @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;  // Permitir acceso sin autenticación
    }
    
    return super.canActivate(context);  // Validar JWT
  }
}
```

### Decorator @Public()

**Definición:**

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Uso:**

```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  
  @Public()  // Esta ruta NO requiere JWT
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  
  @Public()  // Esta ruta NO requiere JWT
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}

// inspections.controller.ts
@Controller('inspections')
export class InspectionsController {
  
  // Esta ruta SÍ requiere JWT (por defecto)
  @Get()
  findAll() {
    return this.service.findAll();
  }
}
```

### Rutas Públicas Actuales

1. `POST /auth/login` - Inicio de sesión
2. `POST /auth/register` - Registro de usuario
3. `POST /users/forgot-password` - Solicitar reset de contraseña
4. `POST /users/reset-password` - Restablecer contraseña con token

**Todas las demás rutas requieren JWT.**

### JWT Strategy (Passport)

```typescript
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,  // Rechazar tokens expirados
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // Este objeto se inyecta en req.user
    return { 
      userId: payload.sub, 
      role: payload.role 
    };
  }
}
```

**Acceder al usuario autenticado:**

```typescript
@Get('me')
getProfile(@Req() req: any) {
  // req.user = { userId: 1, role: 'inspector' }
  return req.user;
}
```

---

## Gestión de Contraseñas

### Hashing con bcrypt

**Factor de Costo:** 10 (balance entre seguridad y rendimiento)

**Implementación:**

```typescript
// users.service.ts
import * as bcrypt from 'bcrypt';

async create(dto: CreateUserDto): Promise<User> {
  const user = this.repo.create({
    email: dto.email,
    passwordHash: await bcrypt.hash(dto.password, 10),  // Factor 10
    // ...otros campos
  });
  return this.repo.save(user);
}
```

**Comparación de contraseñas:**

```typescript
// auth.service.ts
const passwordMatches = await bcrypt.compare(
  plainPassword,      // Contraseña ingresada
  user.passwordHash   // Hash en BD
);

if (!passwordMatches) {
  throw new UnauthorizedException('Credenciales inválidas');
}
```

### Reglas de Contraseñas

**Actual:**
- Mínimo 6 caracteres

**Recomendado para Producción:**
```typescript
// Agregar validación en DTO
@IsString()
@MinLength(8)
@Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  { message: 'La contraseña debe contener mayúscula, minúscula, número y símbolo' }
)
password: string;
```

**Política Recomendada:**
- ✅ Mínimo 8 caracteres
- ✅ Al menos una mayúscula
- ✅ Al menos una minúscula
- ✅ Al menos un número
- ✅ Al menos un símbolo especial
- ✅ No contraseñas comunes (verificar contra lista)

### Cambio de Contraseña

```typescript
// users.service.ts
async update(id: number, dto: UpdateUserDto): Promise<User> {
  const user = await this.findOne(id);
  
  if ((dto as any).password) {
    user.passwordHash = await bcrypt.hash((dto as any).password, 10);
  }
  
  Object.assign(user, dto, { password: undefined });
  return this.repo.save(user);
}
```

**Nota:** El campo `password` del DTO se hashea y guarda como `passwordHash`, luego se elimina `password` del objeto.

---

## Recuperación de Contraseña

### Flujo Completo

```
1. Usuario → POST /users/forgot-password { email }
2. Backend → Genera token aleatorio (32 bytes hex)
3. Backend → Hashea token con SHA-256
4. Backend → Guarda hash en user.resetToken
5. Backend → Guarda timestamp en user.resetTokenExpires (now + 20 min)
6. Backend → Envía email con link
7. Usuario → Clic en link: /admin/reset-password?token={rawToken}
8. Frontend → POST /users/reset-password { token, newPassword }
9. Backend → Hashea token recibido con SHA-256
10. Backend → Busca usuario con resetToken = hash
11. Backend → Verifica expiración (< 20 minutos)
12. Backend → Actualiza passwordHash
13. Backend → Limpia resetToken y resetTokenExpires
14. Usuario → Hace login con nueva contraseña
```

### Implementación del Token

**Generación:**

```typescript
// users.service.ts
import { randomBytes, createHash } from 'crypto';

async generateResetToken(email: string): Promise<string> {
  const user = await this.repo.findOne({ where: { email } });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  // Token original (se envía por email)
  const rawToken = randomBytes(32).toString('hex');
  
  // Hash SHA-256 (se guarda en BD)
  user.resetToken = this.hashToken(rawToken);
  user.resetTokenExpires = Date.now() + 20 * 60 * 1000;  // 20 minutos
  
  await this.repo.save(user);
  
  return rawToken;  // Devolver token SIN hashear
}

private hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

**Validación:**

```typescript
// users.service.ts
async resetPassword(token: string, newPassword: string): Promise<void> {
  const hashed = this.hashToken(token);
  const user = await this.repo.findOne({ where: { resetToken: hashed } });

  if (!user || !user.resetTokenExpires || Date.now() > user.resetTokenExpires) {
    throw new BadRequestException('Token inválido o expirado');
  }

  if (user.isBlocked) {
    throw new BadRequestException('La cuenta está bloqueada');
  }

  // Cambiar contraseña
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  
  // CRÍTICO: Limpiar campos de reset
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  
  await this.repo.save(user);
}
```

### Seguridad del Token

**¿Por qué SHA-256 y no bcrypt?**

1. **SHA-256:**
   - Rápido de comparar (criptográficamente seguro)
   - Determinístico (mismo input = mismo hash)
   - Ideal para tokens de un solo uso

2. **bcrypt:**
   - Lento (diseñado para contraseñas)
   - Cada hash es diferente (salt aleatorio)
   - Innecesario para tokens temporales

**Ventajas:**
- ✅ Token en URL no se puede usar directamente (necesita hashear)
- ✅ Si BD es comprometida, tokens hasheados son inútiles
- ✅ Token de un solo uso (se limpia después de usar)
- ✅ Expiración de 20 minutos

### Email de Recuperación

```typescript
// email.service.ts
async sendResetPasswordEmail(
  to: string,
  token: string,
  firstName?: string,
  lastName?: string,
) {
  const frontend = process.env.FRONTEND_URL.replace(/\/$/, '');
  const url = new URL('/admin/reset-password', frontend);
  url.searchParams.set('token', token);
  const resetLink = url.toString();
  
  // resetLink = "http://localhost:5174/admin/reset-password?token=abc123..."

  await this.transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Restablece tu contraseña',
    template: 'reset-password',
    context: {
      resetLink,
      expiresIn: '20 minutos',
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      year: new Date().getFullYear(),
    },
  });
}
```

**Plantilla (reset-password.hbs):**

```handlebars
<!DOCTYPE html>
<html>
<head>
  <title>Restablece tu contraseña</title>
</head>
<body>
  <h1>Hola {{firstName}} {{lastName}}</h1>
  <p>Recibimos una solicitud para restablecer tu contraseña.</p>
  <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
  <a href="{{resetLink}}">Restablecer Contraseña</a>
  <p>Este enlace expira en <strong>{{expiresIn}}</strong>.</p>
  <p>Si no solicitaste este cambio, ignora este correo.</p>
  <hr>
  <p>© {{year}} Municipalidad de Santa Cruz</p>
</body>
</html>
```

---

## Roles y Autorización

### Roles Disponibles

1. **admin** - Administrador
   - Acceso completo al sistema
   - Gestión de usuarios
   - Vista administrativa del dashboard
   - Bloqueo/desbloqueo de usuarios

2. **inspector** - Inspector
   - Creación y gestión de inspecciones
   - Vista personal del dashboard
   - Generación de reportes

### Implementación Actual

**⚠️ NOTA:** El sistema NO implementa validación de roles en endpoints.

**Todos los usuarios autenticados pueden:**
- Crear inspecciones
- Ver todas las inspecciones
- Actualizar cualquier inspección
- Acceder a dashboards (admin y inspector)

### Implementación Recomendada de Roles

**Guard de Roles:**

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;  // No requiere roles específicos
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Decorator @Roles():**

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Uso:**

```typescript
// users.controller.ts
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)  // Aplicar guard
export class UsersController {
  
  @Roles('admin')  // Solo admin
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
  
  @Roles('admin')  // Solo admin
  @Patch(':id/block')
  blockUser(@Param('id') id: number) {
    return this.usersService.block(id);
  }
  
  @Roles('admin', 'inspector')  // Ambos roles
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

### Bloqueo de Usuarios

**Funcionalidad:**

```typescript
// users.service.ts
async block(id: number): Promise<User> {
  const user = await this.findOne(id);
  user.isBlocked = !user.isBlocked;  // Toggle
  return this.repo.save(user);
}
```

**Validación en Login:**

```typescript
// auth.service.ts
if (user.isBlocked) {
  throw new ForbiddenException('Tu cuenta está bloqueada');
}
```

**Efectos:**
- ❌ No puede hacer login
- ❌ No puede restablecer contraseña
- ✅ Tokens JWT existentes siguen siendo válidos (hasta expirar)

**Recomendación:** Implementar lista negra de tokens o reducir tiempo de expiración.

---

## CORS y Configuración de Seguridad

### CORS (Cross-Origin Resource Sharing)

**Configuración:**

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,       // http://localhost:5174
  credentials: true,                      // Permitir cookies
  methods: ['GET','POST','PUT','PATCH','DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
});
```

**Variables de Entorno:**

```env
FRONTEND_URL=http://localhost:5174    # Desarrollo
# FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app  # Producción
```

**Múltiples Orígenes (Producción):**

```typescript
app.enableCors({
  origin: [
    'http://localhost:5174',
    'https://inspecciones-front-santa-cruz.vercel.app'
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
});
```

### Configuración de Seguridad Adicional

**⏳ NO IMPLEMENTADO - Recomendado para Producción:**

**1. Helmet (Headers de Seguridad):**

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet());
```

**Headers agregados:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=15552000`

**2. Rate Limiting:**

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,      // 60 segundos
  limit: 100,   // 100 requests por ventana
})
```

**3. Validación de Content-Type:**

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,               // Elimina propiedades no definidas
  forbidNonWhitelisted: true,    // Rechaza peticiones con campos desconocidos
}));
```

**4. HTTPS en Producción:**

```typescript
// Railway automáticamente proporciona HTTPS
// Verificar en código:
if (process.env.NODE_ENV === 'production' && !req.secure) {
  return res.redirect('https://' + req.headers.host + req.url);
}
```

---

## Mejores Prácticas

### 1. Gestión de Secretos

**❌ NO hacer:**
```typescript
// Hard-coded secrets
const secret = 'mi_secreto_super_secreto';
```

**✅ SÍ hacer:**
```typescript
// Variables de entorno
const secret = process.env.JWT_SECRET;

// Validar en inicio
if (!secret) {
  throw new Error('JWT_SECRET no está configurado');
}
```

**Producción (Railway):**
- Configurar variables de entorno en dashboard
- No incluir `.env` en repositorio Git
- Usar secretos fuertes (generados aleatoriamente)

**Generar secreto seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Expiración de Tokens

**Actual:** 1 hora

**Recomendaciones:**
- **Access Token:** 15 minutos (tokens de corta duración)
- **Refresh Token:** 7 días (renovar access token sin login)

**Implementación de Refresh Tokens:**

```typescript
// auth.service.ts
async login(dto: LoginDto) {
  const user = await this.validateUser(dto.email, dto.password);
  
  const accessToken = this.jwtService.sign(
    { sub: user.id, role: user.role },
    { expiresIn: '15m' }
  );
  
  const refreshToken = this.jwtService.sign(
    { sub: user.id, type: 'refresh' },
    { expiresIn: '7d' }
  );
  
  // Guardar refresh token en BD
  await this.usersService.updateRefreshToken(user.id, refreshToken);
  
  return { 
    access_token: accessToken,
    refresh_token: refreshToken 
  };
}
```

### 3. Logging de Seguridad

**Eventos a Loguear:**
- ✅ Intentos de login fallidos
- ✅ Cambios de contraseña
- ✅ Tokens expirados
- ✅ Bloqueos de cuenta
- ✅ Accesos con token inválido

**Implementación:**

```typescript
// auth.service.ts
async validateUser(email: string, pass: string) {
  const user = await this.usersService.findByEmail(email);
  
  if (!user) {
    console.warn(`❌ Login fallido: email no encontrado - ${email}`);
    throw new UnauthorizedException('Credenciales inválidas');
  }
  
  const passwordMatches = await bcrypt.compare(pass, user.passwordHash);
  if (!passwordMatches) {
    console.warn(`❌ Login fallido: contraseña incorrecta - ${email}`);
    throw new UnauthorizedException('Credenciales inválidas');
  }
  
  console.log(`✅ Login exitoso: ${email}`);
  return user;
}
```

### 4. Auditoría

**Campos de Auditoría en Entidades:**

```typescript
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

@Column({ nullable: true })
createdBy?: number;  // User ID

@Column({ nullable: true })
updatedBy?: number;  // User ID
```

**Uso:**

```typescript
async create(dto: CreateInspectionDto, userId: number) {
  const inspection = this.repo.create({
    ...dto,
    createdBy: userId,
    updatedBy: userId,
  });
  return this.repo.save(inspection);
}
```

### 5. Sanitización de Datos

**Implementado:**

```typescript
// users.entity.ts
toSafeObject() {
  const { passwordHash, resetToken, resetTokenExpires, isBlocked, ...safeData } = this;
  return safeData;
}

// inspections.service.ts
private sanitizeInspection(inspection: Inspection): any {
  if (!inspection) return inspection;
  
  const sanitized = { ...inspection };
  if (sanitized.inspectors) {
    sanitized.inspectors = sanitized.inspectors.map(
      (inspector: any) => inspector.toSafeObject()
    );
  }
  
  return sanitized;
}
```

**Nunca devolver:**
- ❌ `passwordHash`
- ❌ `resetToken`
- ❌ `resetTokenExpires`
- ❌ Datos personales de usuarios no relacionados

### 6. Validación de Entrada

**Siempre usar DTOs con class-validator:**

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MaxLength(100)
  firstName: string;
}
```

**ValidationPipe Global:**

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
}));
```

### 7. Prevención de Ataques Comunes

**SQL Injection:**
- ✅ TypeORM previene automáticamente
- ✅ Usa query builders o parámetros

**XSS (Cross-Site Scripting):**
- ⏳ Sanitizar HTML en frontend
- ⏳ Content Security Policy headers

**CSRF (Cross-Site Request Forgery):**
- ✅ CORS configurado correctamente
- ⏳ Implementar tokens CSRF para forms

**Brute Force:**
- ⏳ Rate limiting en /auth/login
- ⏳ Bloqueo temporal después de N intentos

**DDoS:**
- ⏳ Rate limiting global
- ✅ Railway proporciona protección básica

---

## Checklist de Seguridad

### Implementado ✅

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Guard global con excepciones @Public()
- ✅ Tokens de reset con SHA-256
- ✅ Expiración de tokens (JWT: 1h, reset: 20min)
- ✅ Validación de entrada con DTOs
- ✅ CORS configurado
- ✅ Sanitización de datos sensibles
- ✅ Bloqueo de usuarios
- ✅ Prevención de inyección SQL (TypeORM)

### Pendiente ⏳

- ⏳ Refresh tokens
- ⏳ Rate limiting
- ⏳ Helmet (headers de seguridad)
- ⏳ Logging de eventos de seguridad
- ⏳ Auditoría (createdBy, updatedBy)
- ⏳ Validación de roles en endpoints
- ⏳ 2FA para administradores
- ⏳ Lista negra de tokens
- ⏳ Política de contraseñas robusta
- ⏳ Alertas de actividad sospechosa
- ⏳ HTTPS obligatorio en producción
- ⏳ Rotación de JWT_SECRET

---

## Configuración de Producción

### Variables de Entorno Críticas

```env
# Secretos (generar aleatoriamente)
JWT_SECRET=<64_caracteres_aleatorios_hex>
DB_PASSWORD=<password_fuerte>

# URLs (producción)
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
DB_HOST=<railway_db_host>

# Seguridad
NODE_ENV=production
TYPEORM_SYNC=false              # ¡CRÍTICO! No sincronizar en prod
```

### Recomendaciones Finales

1. **Cambiar JWT_SECRET** regularmente (cada 3-6 meses)
2. **Monitorear logs** de seguridad
3. **Actualizar dependencias** (npm audit)
4. **Implementar refresh tokens** cuanto antes
5. **Agregar rate limiting** antes de lanzamiento
6. **Habilitar HTTPS** en todos los entornos
7. **Configurar Helmet** para headers de seguridad
8. **Implementar validación de roles** en endpoints críticos
9. **Agregar tests de seguridad** (penetration testing)
10. **Documentar políticas** de seguridad para el equipo

---

**Próximo Documento:** [06-DESPLIEGUE-PRODUCCION.md](./06-DESPLIEGUE-PRODUCCION.md)
