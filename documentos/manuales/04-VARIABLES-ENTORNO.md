# Manual de Variables de Entorno

## Índice
1. [Introducción](#introducción)
2. [Variables Obligatorias](#variables-obligatorias)
3. [Variables Opcionales](#variables-opcionales)
4. [Configuración por Entorno](#configuración-por-entorno)
5. [Secrets y Seguridad](#secrets-y-seguridad)
6. [Validación de Variables](#validación-de-variables)
7. [Troubleshooting](#troubleshooting)
8. [Plantillas de Configuración](#plantillas-de-configuración)

---

## Introducción

Este manual documenta todas las variables de entorno necesarias para configurar la aplicación de Inspecciones Municipales en diferentes entornos (desarrollo, staging, producción).

### Ubicación del Archivo

```
Proyecto/
├── .env                    # Variables de entorno (NO subir a Git)
├── .env.example            # Plantilla de ejemplo (SÍ subir a Git)
├── .env.development        # Configuración de desarrollo
├── .env.production         # Configuración de producción
└── .env.test               # Configuración para tests
```

### Cómo Crear el Archivo .env

```bash
# Copiar desde plantilla
cp .env.example .env

# Editar con tus valores
nano .env  # Linux/Mac
notepad .env  # Windows
```

---

## Variables Obligatorias

### Base de Datos

#### `DB_HOST`
- **Descripción:** Host del servidor de MariaDB
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valores:**
  - Desarrollo: `localhost` o `127.0.0.1`
  - Docker: `mariadb` (nombre del servicio)
  - Producción: IP privada o dominio interno
- **Ejemplo:**
  ```env
  DB_HOST=localhost
  DB_HOST=10.100.3.10
  DB_HOST=db.municipalidad.go.cr
  ```

#### `DB_PORT`
- **Descripción:** Puerto del servidor MariaDB
- **Tipo:** Number
- **Obligatorio:** ✅ Sí
- **Valor por defecto:** `3306`
- **Ejemplo:**
  ```env
  DB_PORT=3306
  ```

#### `DB_USERNAME`
- **Descripción:** Usuario de la base de datos
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valores:**
  - Desarrollo: `root` (no recomendado para producción)
  - Producción: usuario específico (ej: `inspecciones_user`)
- **Ejemplo:**
  ```env
  DB_USERNAME=inspecciones_user
  ```

#### `DB_PASSWORD`
- **Descripción:** Contraseña del usuario de base de datos
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Seguridad:** 🔒 **ALTA** - Nunca exponer en logs
- **Requisitos de producción:**
  - Mínimo 16 caracteres
  - Mayúsculas, minúsculas, números y símbolos
  - No usar contraseñas comunes
- **Ejemplo:**
  ```env
  DB_PASSWORD=P@ssw0rd_S3gur0_2025!
  ```
- **Generar contraseña segura:**
  ```bash
  # Linux/Mac
  openssl rand -base64 24
  
  # PowerShell
  -join ((33..126) | Get-Random -Count 24 | ForEach-Object {[char]$_})
  ```

#### `DB_DATABASE`
- **Descripción:** Nombre de la base de datos
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valor recomendado:** `inspect_muni`
- **Ejemplo:**
  ```env
  DB_DATABASE=inspect_muni
  ```

---

### TypeORM

#### `TYPEORM_SYNC`
- **Descripción:** Sincronización automática del esquema de BD
- **Tipo:** Boolean (`true` / `false`)
- **Obligatorio:** ✅ Sí
- **Valores:**
  - Desarrollo: `true` (crea/actualiza tablas automáticamente)
  - **Producción: `false`** (⚠️ **CRÍTICO** - usar migraciones)
- **⚠️ PELIGRO:** Si está en `true` en producción, TypeORM puede:
  - Eliminar columnas que no estén en las entidades
  - Perder datos sin respaldo
  - Causar downtime
- **Ejemplo:**
  ```env
  # Desarrollo
  TYPEORM_SYNC=true
  
  # Producción
  TYPEORM_SYNC=false
  ```

---

### Servidor

#### `PORT`
- **Descripción:** Puerto donde escucha la aplicación
- **Tipo:** Number
- **Obligatorio:** ✅ Sí (⚠️ Railway lo asigna automáticamente)
- **Valores:**
  - Desarrollo: `3000`
  - Producción VPS: `3000` (o el que uses)
  - Railway: `$PORT` (variable dinámica)
- **Ejemplo:**
  ```env
  PORT=3000
  ```
- **Railway específico:**
  ```env
  PORT=$PORT
  ```

#### `NODE_ENV`
- **Descripción:** Entorno de ejecución
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valores permitidos:**
  - `development` - Desarrollo local
  - `production` - Producción
  - `staging` - Pre-producción
  - `test` - Testing
- **Ejemplo:**
  ```env
  NODE_ENV=production
  ```

#### `FRONTEND_URL`
- **Descripción:** URL del frontend (para CORS)
- **Tipo:** String (URL)
- **Obligatorio:** ✅ Sí
- **⚠️ IMPORTANTE:** 
  - **NO** incluir barra al final (`/`)
  - Debe coincidir EXACTAMENTE con el dominio del frontend
- **Ejemplo:**
  ```env
  # ✅ Correcto
  FRONTEND_URL=https://inspecciones-frontend.vercel.app
  FRONTEND_URL=https://inspecciones.municipalidad.go.cr
  
  # ❌ Incorrecto
  FRONTEND_URL=https://inspecciones-frontend.vercel.app/
  FRONTEND_URL=http://localhost:5174/
  ```

---

### JWT (Autenticación)

#### `JWT_SECRET`
- **Descripción:** Clave secreta para firmar tokens JWT
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Seguridad:** 🔒 **MUY ALTA** - Nunca compartir
- **Requisitos:**
  - Mínimo 64 caracteres
  - Aleatorio y único por entorno
  - **NUNCA** reutilizar entre dev/staging/prod
- **Generar:**
  ```bash
  # Node.js
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # OpenSSL
  openssl rand -hex 64
  
  # PowerShell
  -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 128 | ForEach-Object {[char]$_})
  ```
- **Ejemplo:**
  ```env
  JWT_SECRET=a8f3b2e9c7d4f6a1b3e5c7d9f2a4b6c8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3
  ```

#### `JWT_EXPIRATION`
- **Descripción:** Tiempo de expiración del token JWT
- **Tipo:** String (formato: `1h`, `30m`, `7d`)
- **Obligatorio:** ✅ Sí
- **Valor recomendado:** `1h` (1 hora)
- **Valores permitidos:**
  - `30m` - 30 minutos (muy seguro, poco conveniente)
  - `1h` - 1 hora (**recomendado**)
  - `2h` - 2 horas
  - `24h` - 24 horas (no recomendado)
- **Ejemplo:**
  ```env
  JWT_EXPIRATION=1h
  ```

---

### Cloudinary (Almacenamiento de Imágenes)

#### `CLOUDINARY_CLOUD_NAME`
- **Descripción:** Nombre de tu cloud en Cloudinary
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Dónde encontrarlo:** Dashboard de Cloudinary → Account Details
- **Ejemplo:**
  ```env
  CLOUDINARY_CLOUD_NAME=da84etlav
  ```

#### `CLOUDINARY_API_KEY`
- **Descripción:** API Key de Cloudinary
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Dónde encontrarlo:** Dashboard de Cloudinary → Account Details → API Keys
- **Ejemplo:**
  ```env
  CLOUDINARY_API_KEY=862873356192438
  ```

#### `CLOUDINARY_API_SECRET`
- **Descripción:** API Secret de Cloudinary
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Seguridad:** 🔒 **ALTA** - Nunca exponer
- **Dónde encontrarlo:** Dashboard de Cloudinary → Account Details → API Keys
- **Ejemplo:**
  ```env
  CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE
  ```

**Cómo obtener credenciales de Cloudinary:**
1. Crear cuenta en https://cloudinary.com (gratis hasta 25GB)
2. Ir a Dashboard
3. Copiar: Cloud name, API Key, API Secret

---

### Email (SMTP)

#### `SMTP_HOST`
- **Descripción:** Host del servidor SMTP
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valores comunes:**
  - Gmail: `smtp.gmail.com`
  - SendGrid: `smtp.sendgrid.net` (**recomendado para producción**)
  - Outlook: `smtp.office365.com`
  - Servidor corporativo: IP o dominio
- **Ejemplo:**
  ```env
  SMTP_HOST=smtp.sendgrid.net
  ```

#### `SMTP_PORT`
- **Descripción:** Puerto del servidor SMTP
- **Tipo:** Number
- **Obligatorio:** ✅ Sí
- **Valores comunes:**
  - `587` - STARTTLS (**recomendado**)
  - `465` - SSL/TLS
  - `25` - Sin cifrado (no recomendado)
- **Ejemplo:**
  ```env
  SMTP_PORT=587
  ```

#### `SMTP_SECURE`
- **Descripción:** Usar SSL/TLS directo
- **Tipo:** Boolean (`true` / `false`)
- **Obligatorio:** ✅ Sí
- **Valores:**
  - `false` - Para puerto 587 (STARTTLS)
  - `true` - Para puerto 465 (SSL/TLS)
- **Ejemplo:**
  ```env
  SMTP_SECURE=false
  ```

#### `SMTP_USER`
- **Descripción:** Usuario para autenticación SMTP
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Valores:**
  - Gmail: tu email completo
  - SendGrid: `apikey` (literal)
  - Otros: usuario proporcionado
- **Ejemplo:**
  ```env
  # Gmail
  SMTP_USER=municipalidad.santacruz@gmail.com
  
  # SendGrid
  SMTP_USER=apikey
  ```

#### `SMTP_PASS`
- **Descripción:** Contraseña o API Key para SMTP
- **Tipo:** String
- **Obligatorio:** ✅ Sí
- **Seguridad:** 🔒 **ALTA** - Nunca exponer
- **Valores:**
  - Gmail: App Password (no la contraseña normal)
  - SendGrid: API Key completo (`SG.xxxxx`)
  - Otros: contraseña proporcionada
- **Ejemplo:**
  ```env
  # Gmail App Password
  SMTP_PASS=abcd efgh ijkl mnop
  
  # SendGrid API Key
  SMTP_PASS=SG.1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
  ```

**Obtener App Password de Gmail:**
1. Ir a: https://myaccount.google.com/apppasswords
2. Seleccionar: Mail → Other (Custom name)
3. Nombre: "Inspecciones Municipales"
4. Generar
5. Copiar el código de 16 caracteres

**Obtener API Key de SendGrid:**
1. Crear cuenta en https://sendgrid.com (100 emails/día gratis)
2. Settings → API Keys → Create API Key
3. Name: "Inspecciones API"
4. Full Access
5. Copiar la clave `SG.xxxxx`

#### `EMAIL_FROM`
- **Descripción:** Email remitente y nombre
- **Tipo:** String (formato: `"Nombre <email@domain.com>"`)
- **Obligatorio:** ✅ Sí
- **Formato:** `"Display Name <email@domain.com>"`
- **Ejemplo:**
  ```env
  EMAIL_FROM="Municipalidad Santa Cruz <inspecciones@santacruz.go.cr>"
  EMAIL_FROM="Sistema de Inspecciones <no-reply@municipalidad.go.cr>"
  ```

---

## Variables Opcionales

### Database URL (Railway)

#### `DATABASE_URL`
- **Descripción:** URL de conexión completa a la base de datos
- **Tipo:** String (URL)
- **Obligatorio:** ❌ No (Railway la genera automáticamente)
- **Formato:** `mysql://usuario:password@host:puerto/database`
- **⚠️ Nota:** Si está presente, sobrescribe `DB_HOST`, `DB_PORT`, etc.
- **Ejemplo:**
  ```env
  DATABASE_URL=mysql://root:password@mysql.railway.internal:3306/railway
  ```
- **Railway:** Se genera automáticamente al agregar plugin de MariaDB

### Logging

#### `LOG_LEVEL`
- **Descripción:** Nivel de detalle de logs
- **Tipo:** String
- **Obligatorio:** ❌ No
- **Valor por defecto:** `info`
- **Valores permitidos:**
  - `error` - Solo errores críticos
  - `warn` - Advertencias y errores
  - `info` - Información general (**recomendado**)
  - `debug` - Información detallada (desarrollo)
  - `verbose` - Todo (troubleshooting)
- **Ejemplo:**
  ```env
  LOG_LEVEL=info
  ```

### Timezone

#### `TZ`
- **Descripción:** Zona horaria del servidor
- **Tipo:** String
- **Obligatorio:** ❌ No
- **Valor recomendado:** `America/Costa_Rica`
- **Ejemplo:**
  ```env
  TZ=America/Costa_Rica
  ```

---

## Configuración por Entorno

### Desarrollo (`.env.development`)

```env
# === BASE DE DATOS ===
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=inspect_muni

# === TYPEORM ===
TYPEORM_SYNC=true

# === SERVIDOR ===
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# === JWT ===
JWT_SECRET=dev_secret_123_CAMBIAR_EN_PRODUCCION
JWT_EXPIRATION=24h

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# === EMAIL (Gmail para desarrollo) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu.email@gmail.com
SMTP_PASS=tu_app_password_aqui
EMAIL_FROM="Desarrollo Inspecciones <tu.email@gmail.com>"

# === LOGGING ===
LOG_LEVEL=debug
TZ=America/Costa_Rica
```

---

### Staging (`.env.staging`)

```env
# === BASE DE DATOS ===
DB_HOST=staging-db.municipalidad.local
DB_PORT=3306
DB_USERNAME=inspecciones_staging
DB_PASSWORD=P@ssw0rd_Stag1ng_2025!
DB_DATABASE=inspect_muni_staging

# === TYPEORM ===
TYPEORM_SYNC=false

# === SERVIDOR ===
PORT=3000
NODE_ENV=staging
FRONTEND_URL=https://staging.inspecciones.municipalidad.go.cr

# === JWT ===
JWT_SECRET=f8e2a9c7b4d3e1f9a6b8c5d2e7f4a3b9c6d1e8f5a2b7c4d9e6f3a1b8c5d2e9f6a3b7c4d1e8f5a2b9c6d3e7f4
JWT_EXPIRATION=1h

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# === EMAIL (SendGrid) ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.staging_api_key_aqui
EMAIL_FROM="Staging Inspecciones <staging@municipalidad.go.cr>"

# === LOGGING ===
LOG_LEVEL=info
TZ=America/Costa_Rica
```

---

### Producción (`.env.production`)

```env
# === BASE DE DATOS ===
DB_HOST=10.100.3.10
DB_PORT=3306
DB_USERNAME=inspecciones_prod
DB_PASSWORD=P@ssw0rd_Pr0d_V3ry_S3cur3_2025!
DB_DATABASE=inspect_muni

# === TYPEORM ===
# ⚠️ CRÍTICO: Siempre false en producción
TYPEORM_SYNC=false

# === SERVIDOR ===
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://inspecciones.municipalidad.go.cr

# === JWT ===
# ⚠️ Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=a8f3b2e9c7d4f6a1b3e5c7d9f2a4b6c8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9
JWT_EXPIRATION=1h

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# === EMAIL (SendGrid Producción) ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.production_api_key_aqui_SECRETO
EMAIL_FROM="Municipalidad Santa Cruz <inspecciones@santacruz.go.cr>"

# === LOGGING ===
LOG_LEVEL=warn
TZ=America/Costa_Rica
```

---

### Railway Producción

```env
# === BASE DE DATOS ===
# Railway genera DATABASE_URL automáticamente
# NO configurar DB_HOST, DB_PORT, etc. si usas DATABASE_URL

# === TYPEORM ===
TYPEORM_SYNC=false

# === SERVIDOR ===
# Railway asigna PORT automáticamente
PORT=$PORT
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app

# === JWT ===
JWT_SECRET=a8f3b2e9c7d4f6a1b3e5c7d9f2a4b6c8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9a2b4c6d8e1f3a5b7c9d2e4f6a8b1c3d5e7f9
JWT_EXPIRATION=1h

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=da84etlav
CLOUDINARY_API_KEY=862873356192438
CLOUDINARY_API_SECRET=SZbXZ9WE87lgZ6dhqXujWLBFAtE

# === EMAIL ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.railway_production_key
EMAIL_FROM="Municipalidad Santa Cruz <inspecciones@santacruz.go.cr>"

# === LOGGING ===
LOG_LEVEL=info
```

---

## Secrets y Seguridad

### ⚠️ NUNCA Subir a Git

**Agregar a `.gitignore`:**

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.staging.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

### ✅ Sí Subir a Git

```gitignore
# Plantillas (sin valores reales)
.env.example
```

**Ejemplo `.env.example`:**

```env
# === BASE DE DATOS ===
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_DATABASE=inspect_muni

# === TYPEORM ===
TYPEORM_SYNC=false

# === SERVIDOR ===
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# === JWT ===
JWT_SECRET=generate_with_node_crypto
JWT_EXPIRATION=1h

# === CLOUDINARY ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === EMAIL ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM="Your Name <email@domain.com>"
```

### Rotar Secrets Periódicamente

**JWT_SECRET:**
- Cambiar cada 6-12 meses
- Cambiar inmediatamente si se compromete
- ⚠️ Al cambiar, invalida todos los tokens existentes

**DB_PASSWORD:**
- Cambiar cada 90 días (política corporativa)
- Usar gestor de contraseñas (Bitwarden, 1Password)

**SMTP_PASS:**
- Rotar API Keys cada 6 meses
- Monitorear uso en dashboard de SendGrid

---

## Validación de Variables

### Script de Validación

Crear: `scripts/validate-env.js`

```javascript
const requiredVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'TYPEORM_SYNC',
  'PORT',
  'NODE_ENV',
  'FRONTEND_URL',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM'
];

const errors = [];

// Validar que existan
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    errors.push(`❌ Variable faltante: ${varName}`);
  }
});

// Validaciones específicas
if (process.env.NODE_ENV === 'production') {
  if (process.env.TYPEORM_SYNC === 'true') {
    errors.push('🚨 CRÍTICO: TYPEORM_SYNC debe ser false en producción');
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
    errors.push('⚠️  ADVERTENCIA: JWT_SECRET debe tener al menos 64 caracteres');
  }
  
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.endsWith('/')) {
    errors.push('⚠️  ADVERTENCIA: FRONTEND_URL no debe terminar en /');
  }
}

// Mostrar resultados
if (errors.length > 0) {
  console.error('\n🔴 Errores de configuración:\n');
  errors.forEach(err => console.error(err));
  process.exit(1);
} else {
  console.log('\n✅ Todas las variables de entorno están configuradas correctamente\n');
}
```

**Ejecutar:**

```bash
node scripts/validate-env.js
```

---

## Troubleshooting

### Error: Cannot connect to database

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Soluciones:**
1. Verificar que MariaDB esté corriendo:
   ```bash
   sudo systemctl status mariadb  # Linux
   # O verificar servicio en Windows
   ```
2. Verificar credenciales en `.env`:
   ```bash
   cat .env | grep DB_
   ```
3. Probar conexión manualmente:
   ```bash
   mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE
   ```

---

### Error: JWT token invalid

**Síntomas:**
```
401 Unauthorized: Invalid token
```

**Soluciones:**
1. Verificar que `JWT_SECRET` sea el mismo que se usó para crear el token
2. Verificar que el token no haya expirado (`JWT_EXPIRATION`)
3. Limpiar tokens y volver a hacer login

---

### Error: CORS policy blocked

**Síntomas:**
```
Access to fetch has been blocked by CORS policy
```

**Soluciones:**
1. Verificar `FRONTEND_URL` en `.env`:
   ```bash
   echo $FRONTEND_URL
   ```
2. Asegurarse de que NO termine en `/`:
   ```env
   # ✅ Correcto
   FRONTEND_URL=https://frontend.com
   
   # ❌ Incorrecto
   FRONTEND_URL=https://frontend.com/
   ```
3. Reiniciar aplicación después de cambiar

---

### Error: Email not sent

**Síntomas:**
```
Error sending email: Invalid login
```

**Soluciones:**

**Gmail:**
1. Verificar que uses App Password (no contraseña normal)
2. Habilitar "Acceso de aplicaciones menos seguras" (no recomendado)
3. Mejor: Cambiar a SendGrid

**SendGrid:**
1. Verificar API Key en dashboard
2. Verificar que `SMTP_USER=apikey` (literal)
3. Verificar dominio verificado en SendGrid

---

### Error: Cloudinary upload failed

**Síntomas:**
```
Error uploading to Cloudinary
```

**Soluciones:**
1. Verificar credenciales:
   ```bash
   echo $CLOUDINARY_CLOUD_NAME
   echo $CLOUDINARY_API_KEY
   ```
2. Verificar límites de plan (25GB gratis)
3. Verificar en Dashboard de Cloudinary

---

## Plantillas de Configuración

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=inspect_muni
      - TYPEORM_SYNC=true
      - NODE_ENV=development
      - FRONTEND_URL=http://localhost:5174
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=1h
    env_file:
      - .env
    depends_on:
      - mariadb
  
  mariadb:
    image: mariadb:10.11
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - MYSQL_DATABASE=inspect_muni
    ports:
      - "3306:3306"
    volumes:
      - mariadb_data:/var/lib/mysql

volumes:
  mariadb_data:
```

### GitHub Actions Secrets

```yaml
# .github/workflows/deploy.yml
env:
  DB_HOST: ${{ secrets.DB_HOST }}
  DB_PORT: ${{ secrets.DB_PORT }}
  DB_USERNAME: ${{ secrets.DB_USERNAME }}
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  DB_DATABASE: ${{ secrets.DB_DATABASE }}
  TYPEORM_SYNC: false
  NODE_ENV: production
  FRONTEND_URL: ${{ secrets.FRONTEND_URL }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
  JWT_EXPIRATION: 1h
  CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
  CLOUDINARY_API_KEY: ${{ secrets.CLOUDINARY_API_KEY }}
  CLOUDINARY_API_SECRET: ${{ secrets.CLOUDINARY_API_SECRET }}
  SMTP_HOST: ${{ secrets.SMTP_HOST }}
  SMTP_PORT: ${{ secrets.SMTP_PORT }}
  SMTP_USER: ${{ secrets.SMTP_USER }}
  SMTP_PASS: ${{ secrets.SMTP_PASS }}
  EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
```

---

## Checklist de Configuración

### Desarrollo
- [ ] `.env` creado desde `.env.example`
- [ ] Base de datos local corriendo
- [ ] `TYPEORM_SYNC=true`
- [ ] JWT_SECRET configurado (puede ser simple)
- [ ] Cloudinary configurado
- [ ] Gmail App Password configurado
- [ ] Script de validación ejecutado

### Producción
- [ ] `.env` con valores de producción
- [ ] `TYPEORM_SYNC=false` ✅
- [ ] JWT_SECRET aleatorio de 64+ caracteres
- [ ] DB_PASSWORD fuerte (16+ caracteres)
- [ ] SendGrid API Key configurado
- [ ] FRONTEND_URL correcto (sin `/` al final)
- [ ] Variables validadas con script
- [ ] Backup de `.env` guardado de forma segura
- [ ] `.env` NO subido a Git

---

**✅ Manual completo de variables de entorno. Ver también los otros manuales en esta carpeta.**
