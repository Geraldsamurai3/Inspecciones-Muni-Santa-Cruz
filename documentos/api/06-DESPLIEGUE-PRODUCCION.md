# Despliegue y Producción

## Índice
1. [Entornos](#entornos)
2. [Despliegue en Railway](#despliegue-en-railway)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Variables de Entorno](#variables-de-entorno)
5. [Servicios Externos](#servicios-externos)
6. [Monitoreo y Logs](#monitoreo-y-logs)
7. [Troubleshooting](#troubleshooting)

---

## Entornos

### Desarrollo (Local)

**Backend:**
```
URL: http://localhost:3000
BD: MariaDB local (localhost:3306)
Email: SMTP Gmail
Imágenes: Cloudinary
```

**Frontend:**
```
URL: http://localhost:5174
```

**Características:**
- ✅ Sincronización automática de BD (`TYPEORM_SYNC=true`)
- ✅ Hot reload con `npm run start:dev`
- ✅ Logs detallados en consola
- ✅ CORS permisivo (localhost)

---

### Producción

**Backend:**
```
Plataforma: Railway
URL: https://inspecciones-muni-santa-cruz-production.up.railway.app
BD: MariaDB en Railway
Email: SendGrid (recomendado) / Gmail (limitado)
Imágenes: Cloudinary
```

**Frontend:**
```
Plataforma: Vercel
URL: https://inspecciones-front-santa-cruz.vercel.app
```

**Características:**
- ✅ `TYPEORM_SYNC=false` (migraciones manuales)
- ✅ HTTPS automático (Railway + Vercel)
- ✅ Variables de entorno cifradas
- ✅ Auto-deploy en push a `main`

---

## Despliegue en Railway

### 1. Preparación del Proyecto

**Verificar package.json:**

```json
{
  "name": "inspecciones",
  "version": "0.0.1",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:prod": "node dist/main",
    "start:dev": "nest start --watch"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Asegurar archivo .gitignore:**

```
node_modules/
dist/
.env
.env.local
*.log
coverage/
.DS_Store
```

---

### 2. Crear Proyecto en Railway

1. **Ir a https://railway.app/**
2. **Login con GitHub**
3. **New Project → Deploy from GitHub repo**
4. **Seleccionar repositorio:** `Inspecciones-Muni-Santa-Cruz`
5. **Configurar:**
   - **Root Directory:** `/` (raíz)
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start:prod`
   - **Port:** `$PORT` (Railway lo asigna automáticamente)

---

### 3. Configurar Base de Datos

**Opción A: Base de Datos de Railway (Recomendado)**

1. **En Railway Dashboard:**
   - Click en proyecto → **New** → **Database** → **Add MariaDB**
2. **Railway crea automáticamente:**
   - Base de datos MariaDB
   - Variables de entorno (`DATABASE_URL`)
3. **Conectar a backend:**
   - Railway inyecta `DATABASE_URL` automáticamente

**Configuración TypeORM con DATABASE_URL:**

```typescript
// app.module.ts
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (cs: ConfigService) => {
    const databaseUrl = cs.get<string>('DATABASE_URL');
    
    if (databaseUrl) {
      // Producción: usar DATABASE_URL de Railway
      return {
        type: 'mariadb',
        url: databaseUrl,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,  // Importante: false en producción
        autoLoadEntities: true,
      };
    }
    
    // Desarrollo: usar variables individuales
    return {
      type: 'mariadb',
      host: cs.get<string>('DB_HOST'),
      port: cs.get<number>('DB_PORT'),
      username: cs.get<string>('DB_USERNAME'),
      password: cs.get<string>('DB_PASSWORD'),
      database: cs.get<string>('DB_DATABASE'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: cs.get<boolean>('TYPEORM_SYNC', false),
      autoLoadEntities: true,
    };
  },
})
```

**Opción B: Base de Datos Externa**

1. Configurar variables de entorno individualmente:
   ```
   DB_HOST=<host_externo>
   DB_PORT=3306
   DB_USERNAME=<usuario>
   DB_PASSWORD=<password>
   DB_DATABASE=inspect_muni
   ```

---

### 4. Configurar Variables de Entorno

**En Railway Dashboard → Variables:**

```env
# Base de Datos (si no usas DATABASE_URL)
DB_HOST=containers-us-west-123.railway.app
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<password_generado>
DB_DATABASE=inspect_muni

# TypeORM
TYPEORM_SYNC=false           # ¡CRÍTICO! Siempre false en producción

# Server
PORT=$PORT                   # Railway asigna automáticamente
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app

# JWT
JWT_SECRET=<64_caracteres_aleatorios_hex>
JWT_EXPIRATION=1h

# Cloudinary
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# Email - SendGrid (Recomendado)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<sendgrid_api_key>
EMAIL_FROM=Inspecciones Santa Cruz <noreply@santacruz.go.cr>

# Email - Gmail (Alternativa, con limitaciones)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=andreylanza3@gmail.com
# SMTP_PASS=<app_password>
# EMAIL_FROM=Inspecciones <no-reply@midominio.com>

# Node Environment
NODE_ENV=production
```

**⚠️ NOTAS IMPORTANTES:**

1. **JWT_SECRET:**
   ```bash
   # Generar en local y copiar
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **TYPEORM_SYNC:**
   - ✅ `false` en producción (migraciones manuales)
   - ❌ `true` puede eliminar datos

3. **PORT:**
   - Railway asigna dinámicamente
   - Usar `$PORT` o `process.env.PORT`

4. **FRONTEND_URL:**
   - Configurar URL final de Vercel
   - Sin `/` al final

---

### 5. Deploy Automático

**Railway detecta cambios automáticamente:**

```bash
# En local
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin main

# Railway automáticamente:
# 1. Detecta push
# 2. Ejecuta npm install
# 3. Ejecuta npm run build
# 4. Ejecuta npm run start:prod
# 5. Asigna URL pública
```

**Verificar Deploy:**
1. **Railway Dashboard → Deployments**
2. **Ver logs en tiempo real**
3. **Verificar estado: Running**

**Acceder a la app:**
```
https://inspecciones-muni-santa-cruz-production.up.railway.app
```

---

### 6. Custom Domain (Opcional)

**Si tienes dominio propio:**

1. **Railway Dashboard → Settings → Domains**
2. **Add Custom Domain:** `api.santacruz.go.cr`
3. **Configurar DNS:**
   ```
   Tipo: CNAME
   Nombre: api
   Valor: <railway_domain>.up.railway.app
   ```
4. **Railway genera certificado SSL automáticamente**

---

## Configuración de Base de Datos

### Migraciones en Producción

**⚠️ CRÍTICO: `TYPEORM_SYNC=false` en producción**

**Proceso de Migraciones:**

```bash
# 1. Generar migración en local
npm run typeorm migration:generate -- -n AddNewField

# 2. Revisar archivo generado en src/migrations/
# 3. Probar en local
npm run typeorm migration:run

# 4. Commit y push
git add .
git commit -m "migration: add new field"
git push

# 5. En Railway (después de deploy):
# Ejecutar migración vía Railway CLI o script
```

**Configurar comando de migración en Railway:**

```json
// package.json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:run": "npm run typeorm migration:run -- -d ./src/config/typeorm.config.ts",
    "migration:revert": "npm run typeorm migration:revert -- -d ./src/config/typeorm.config.ts"
  }
}
```

**Ejecutar manualmente en Railway:**
1. **Railway Dashboard → Service → Connect**
2. **Ejecutar:** `npm run migration:run`

---

### Backup de Base de Datos

**Desde Railway CLI:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar a proyecto
railway link

# Exportar BD
railway run mysqldump -u root -p inspect_muni > backup_$(date +%Y%m%d).sql

# Restaurar
railway run mysql -u root -p inspect_muni < backup_20250110.sql
```

**Backup Automático (Recomendado):**

Railway ofrece backups automáticos en planes pagos:
- **Frecuencia:** Diaria
- **Retención:** 7 días
- **Restauración:** Un clic desde dashboard

---

## Variables de Entorno

### Desarrollo (.env local)

```env
# Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Andreylxi$$
DB_DATABASE=inspect_muni

# TypeORM
TYPEORM_SYNC=true

# Server
PORT=3000
FRONTEND_URL=http://localhost:5174

# JWT
JWT_SECRET=tu_secreto_jwt_desarrollo
JWT_EXPIRATION=1h

# Cloudinary
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# Email (Gmail con App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=andreylanza3@gmail.com
SMTP_PASS=gryg oagf vclj ltbe
EMAIL_FROM="Inspecciones <no-reply@midominio.com>"
```

---

### Producción (Railway)

```env
# Base de Datos (Railway proporciona DATABASE_URL automáticamente)
# O configurar manualmente:
DB_HOST=containers-us-west-123.railway.app
DB_PORT=6379
DB_USERNAME=root
DB_PASSWORD=<generado_por_railway>
DB_DATABASE=inspect_muni

# TypeORM
TYPEORM_SYNC=false    # ¡CRÍTICO!

# Server
PORT=$PORT            # Railway asigna automáticamente
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app

# JWT (generar nuevo secreto fuerte)
JWT_SECRET=<64_caracteres_hex_aleatorios>
JWT_EXPIRATION=1h

# Cloudinary (mismas credenciales)
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# Email - SendGrid (Recomendado para Railway)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Inspecciones Santa Cruz <noreply@santacruz.go.cr>"

# Environment
NODE_ENV=production
```

---

## Servicios Externos

### SendGrid (Email en Producción)

**¿Por qué SendGrid?**
- ✅ Gmail bloquea conexiones desde servidores cloud (Railway, AWS, Heroku)
- ✅ SendGrid permite 100 emails/día gratis
- ✅ Mejor deliverability (no spam)
- ✅ API y SMTP disponibles

**Configuración:**

1. **Crear cuenta en SendGrid:**
   - https://sendgrid.com/
   - Verificar email

2. **Generar API Key:**
   - Settings → API Keys → Create API Key
   - Nombre: "Railway Inspecciones"
   - Permisos: Mail Send (Full Access)
   - Copiar API Key (solo se muestra una vez)

3. **Verificar dominio (Recomendado):**
   - Settings → Sender Authentication
   - Single Sender Verification
   - Verificar email: `noreply@santacruz.go.cr`

4. **Configurar en Railway:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey              # Literal "apikey"
   SMTP_PASS=SG.abc123...        # Tu API Key
   EMAIL_FROM="Inspecciones Santa Cruz <noreply@santacruz.go.cr>"
   ```

**Límites:**
- **Gratis:** 100 emails/día
- **Essentials ($19.95/mes):** 50,000 emails/mes

**Troubleshooting:**
```typescript
// Verificar configuración
console.log('SMTP Config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  from: process.env.EMAIL_FROM,
});
```

---

### Cloudinary (Almacenamiento de Imágenes)

**Configuración Actual:**

```env
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE
```

**Límites (Plan Gratuito):**
- **Almacenamiento:** 25 GB
- **Ancho de banda:** 25 GB/mes
- **Transformaciones:** 25,000/mes

**Monitoreo:**
1. **Dashboard Cloudinary:** https://cloudinary.com/console
2. **Media Library:** Ver todas las imágenes subidas
3. **Reports:** Uso de almacenamiento y ancho de banda

**Carpetas Organizadas:**
```
/inspections/
  /signatures/
  /constructions/
  /closures/
  /collections/
```

**Buenas Prácticas:**
- ✅ Usar `folder` parameter en uploads
- ✅ Eliminar imágenes no utilizadas
- ✅ Optimizar tamaño antes de subir (frontend)
- ✅ Usar transformaciones de Cloudinary para redimensionar

---

### Railway CLI

**Instalación:**

```bash
npm install -g @railway/cli
```

**Comandos Útiles:**

```bash
# Login
railway login

# Vincular proyecto
railway link

# Ver variables de entorno
railway variables

# Ver logs en tiempo real
railway logs

# Ejecutar comando en Railway
railway run <comando>

# Abrir proyecto en navegador
railway open
```

**Ejemplo: Ver logs de producción**

```bash
railway logs --follow
```

---

## Monitoreo y Logs

### Logs en Railway

**Ver logs:**
1. **Railway Dashboard → Service → Deployments**
2. **Click en deployment activo**
3. **Ver logs en tiempo real**

**Tipos de logs:**
- **Build logs:** Compilación de TypeScript
- **Deploy logs:** Inicio de servidor
- **Runtime logs:** Logs de aplicación

**Logs de aplicación:**

```typescript
// main.ts
console.log(`🚀 Servidor corriendo en http://localhost:${port}/`);

// auth.service.ts
console.log(`✅ Login exitoso: ${email}`);
console.warn(`❌ Login fallido: ${email}`);

// email.service.ts
console.log('📧 Intentando enviar email a:', to);
console.log('✅ Email enviado exitosamente. MessageId:', messageId);
console.error('❌ Error enviando email:', error);
```

---

### Monitoreo de Salud

**Endpoint de Health Check:**

```typescript
// app.controller.ts
@Get()
@Public()
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  };
}
```

**Acceder:**
```
https://inspecciones-muni-santa-cruz-production.up.railway.app/
```

**Railway Health Checks:**
- Railway ping automático cada 60 segundos
- Si falla, reinicia el servicio

---

### Alertas (Recomendado)

**⏳ NO IMPLEMENTADO**

**Opciones:**

1. **Sentry (Monitoreo de Errores):**
   ```bash
   npm install @sentry/node
   ```
   
   ```typescript
   // main.ts
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

2. **UptimeRobot (Monitoreo de Uptime):**
   - https://uptimerobot.com/
   - Ping cada 5 minutos
   - Alertas por email si caído

3. **Railway Webhooks:**
   - Notificaciones de deploy
   - Alertas de crash

---

## Troubleshooting

### Problema: App no inicia en Railway

**Síntomas:**
- Deploy exitoso pero servicio crashea
- Logs muestran error de conexión a BD

**Solución:**

1. **Verificar variables de entorno:**
   ```bash
   railway variables
   ```

2. **Verificar DATABASE_URL o credenciales:**
   ```bash
   railway logs | grep "DB_"
   ```

3. **Verificar PORT:**
   ```typescript
   // main.ts
   const port = process.env.PORT ? Number(process.env.PORT) : 3000;
   await app.listen(port, '0.0.0.0');  // Importante: '0.0.0.0'
   ```

---

### Problema: Emails no se envían desde Railway

**Síntomas:**
- Funciona en local
- Timeout en producción

**Causa:** Gmail bloquea conexiones desde servidores cloud

**Solución:**

1. **Usar SendGrid:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.abc123...
   ```

2. **Verificar logs:**
   ```bash
   railway logs | grep "email"
   ```

---

### Problema: CORS Error desde Frontend

**Síntomas:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solución:**

1. **Verificar FRONTEND_URL en Railway:**
   ```env
   FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
   ```

2. **Sin `/` al final**

3. **Verificar main.ts:**
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
     methods: ['GET','POST','PUT','PATCH','DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type','Authorization'],
   });
   ```

---

### Problema: Base de datos no se crea automáticamente

**Síntomas:**
- Error: "Unknown database 'inspect_muni'"

**Solución:**

1. **Verificar función `ensureDatabaseExists()` en main.ts:**
   ```typescript
   async function ensureDatabaseExists() {
     const tmpDs = new DataSource({
       type: 'mariadb',
       host: process.env.DB_HOST,
       port: Number(process.env.DB_PORT),
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
     });
     await tmpDs.initialize();

     await tmpDs.query(`
       CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     `);

     await tmpDs.destroy();
   }
   ```

2. **O crear manualmente:**
   ```bash
   railway run mysql -u root -p -e "CREATE DATABASE inspect_muni;"
   ```

---

### Problema: Migraciones no se ejecutan

**Síntomas:**
- Campos nuevos no aparecen en BD
- Error: "Unknown column"

**Causa:** `TYPEORM_SYNC=false` en producción

**Solución:**

1. **Ejecutar migraciones manualmente:**
   ```bash
   railway run npm run migration:run
   ```

2. **O temporalmente habilitar sync (⚠️ peligroso):**
   ```env
   TYPEORM_SYNC=true   # Solo para primera creación
   ```
   
3. **Volver a false después:**
   ```env
   TYPEORM_SYNC=false
   ```

---

### Problema: Imágenes no se suben a Cloudinary

**Síntomas:**
- Frontend recibe 404
- Error: "CloudinaryController not found"

**Causa:** Controller no registrado en módulo

**Solución:**

```typescript
// cloudinary.module.ts
@Module({
  controllers: [CloudinaryController],  // ← Asegurar que existe
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
```

---

### Problema: JWT Token inválido

**Síntomas:**
- Error 401: Unauthorized
- Funciona en local, falla en producción

**Causas Posibles:**

1. **JWT_SECRET diferente:**
   ```bash
   # Verificar en Railway
   railway variables | grep JWT_SECRET
   ```

2. **Token expirado:**
   - Tokens duran 1 hora
   - Usuario debe hacer login nuevamente

3. **Formato de Authorization header:**
   ```javascript
   // Correcto
   'Authorization': `Bearer ${token}`
   
   // Incorrecto
   'Authorization': token
   ```

---

## Checklist de Deploy

### Pre-Deploy

- [ ] `TYPEORM_SYNC=false` en .env de Railway
- [ ] JWT_SECRET generado aleatoriamente (64 caracteres hex)
- [ ] FRONTEND_URL configurado correctamente (sin `/` al final)
- [ ] SendGrid configurado (o alternativa de email)
- [ ] Cloudinary credentials verificadas
- [ ] `.env` en `.gitignore`
- [ ] Tests pasando (`npm run test`)
- [ ] Build exitoso localmente (`npm run build`)

### Post-Deploy

- [ ] Verificar logs de Railway (sin errores)
- [ ] Health check endpoint responde: `GET /`
- [ ] Login funciona desde frontend
- [ ] Crear inspección funciona
- [ ] Email de bienvenida funciona
- [ ] Subida de imágenes a Cloudinary funciona
- [ ] PDF se genera correctamente
- [ ] Dashboard carga correctamente
- [ ] CORS permite requests desde frontend

### Monitoreo Continuo

- [ ] Configurar alertas de downtime (UptimeRobot)
- [ ] Configurar Sentry para tracking de errores
- [ ] Revisar logs diariamente
- [ ] Monitorear uso de Cloudinary (límites)
- [ ] Backups de BD configurados
- [ ] Documentar credenciales en gestor seguro (1Password/Bitwarden)

---

**Próximo Documento:** [07-GUIA-DESARROLLO.md](./07-GUIA-DESARROLLO.md)
