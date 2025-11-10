# Manual de Integración: Base de Datos, Backend y Frontend

## Índice
1. [Introducción](#introducción)
2. [Arquitectura de Integración](#arquitectura-de-integración)
3. [Parte 1: Despliegue de Base de Datos](#parte-1-despliegue-de-base-de-datos)
4. [Parte 2: Vinculación Backend ↔ Base de Datos](#parte-2-vinculación-backend--base-de-datos)
5. [Parte 3: Vinculación Frontend ↔ Backend](#parte-3-vinculación-frontend--backend)
6. [Configuración por Escenario](#configuración-por-escenario)
7. [Testing de Conexiones](#testing-de-conexiones)
8. [Troubleshooting](#troubleshooting)

---

## Introducción

Este manual explica paso a paso cómo:
- ✅ Desplegar y configurar la base de datos MariaDB
- ✅ Conectar el backend NestJS a la base de datos
- ✅ Conectar el frontend al backend
- ✅ Configurar CORS correctamente
- ✅ Probar las conexiones

---

## Arquitectura de Integración

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                               │
└────────────────────┬────────────────────────────────────────┘
                     │ https://inspecciones.com
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vue)                      │
│                 Vercel / VPS / Netlify                       │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │ axios.create({                                     │     │
│  │   baseURL: 'https://api.inspecciones.com'         │     │
│  │ })                                                 │     │
│  └───────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │ API Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                          │
│                 Railway / VPS / Cloud                        │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │ TypeOrmModule.forRoot({                           │     │
│  │   host: 'db.inspecciones.com',                    │     │
│  │   port: 3306,                                     │     │
│  │   database: 'inspect_muni'                        │     │
│  │ })                                                │     │
│  └───────────────────────────────────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DATOS (MariaDB)                         │
│                  Railway / VPS / RDS                         │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ users   │  │inspect  │  │construct│ ... (18 tablas)     │
│  └─────────┘  └─────────┘  └─────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Parte 1: Despliegue de Base de Datos

### Opción 1: Base de Datos en Railway

#### 1.1 Crear Base de Datos en Railway

```bash
# 1. Ir a railway.app y crear nuevo proyecto
# 2. Click en "New" → "Database" → "Add MariaDB"
```

**Railway genera automáticamente:**
- `DATABASE_URL`: URL completa de conexión
- `MYSQL_ROOT_PASSWORD`: Contraseña de root
- `MYSQL_DATABASE`: Nombre de la base de datos

#### 1.2 Obtener Credenciales

En el dashboard de Railway, pestaña "Variables":

```env
DATABASE_URL=mysql://root:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway
```

**Extraer valores individuales:**
- **Host:** `containers-us-west-XXX.railway.app`
- **Puerto:** (generalmente `3306` o puerto aleatorio)
- **Usuario:** `root`
- **Contraseña:** (generada aleatoriamente)
- **Base de datos:** `railway`

#### 1.3 Verificar Conexión

```bash
# Instalar cliente MySQL
npm install -g mysql

# Conectar (reemplazar con tus valores)
mysql -h containers-us-west-XXX.railway.app -u root -p -P 3306 railway
```

O usar **Railway CLI**:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Conectar a la base de datos
railway connect
```

---

### Opción 2: Base de Datos en VPS

#### 2.1 Instalar MariaDB

**Ubuntu/Debian:**
```bash
# Actualizar sistema
sudo apt update

# Instalar MariaDB
sudo apt install -y mariadb-server mariadb-client

# Iniciar servicio
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Configuración segura
sudo mysql_secure_installation
```

**CentOS/RHEL:**
```bash
# Instalar MariaDB
sudo dnf install -y mariadb-server mariadb

# Iniciar servicio
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Configuración segura
sudo mysql_secure_installation
```

**Windows Server:**
- Descargar MSI desde: https://mariadb.org/download/
- Instalar con configuración por defecto
- Habilitar servicio de Windows

#### 2.2 Crear Base de Datos y Usuario

```bash
# Conectar como root
sudo mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE inspect_muni CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario para la aplicación
CREATE USER 'inspecciones_app'@'localhost' IDENTIFIED BY 'P@ssw0rd_S3cur0_2025!';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON inspect_muni.* TO 'inspecciones_app'@'localhost';

-- Si el backend está en otro servidor, permitir acceso remoto
CREATE USER 'inspecciones_app'@'%' IDENTIFIED BY 'P@ssw0rd_S3cur0_2025!';
GRANT ALL PRIVILEGES ON inspect_muni.* TO 'inspecciones_app'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User='inspecciones_app';

-- Salir
EXIT;
```

#### 2.3 Configurar Firewall (para acceso remoto)

**UFW (Ubuntu):**
```bash
# Permitir acceso a MariaDB desde IP específica
sudo ufw allow from 192.168.1.100 to any port 3306

# O permitir desde cualquier IP (menos seguro)
sudo ufw allow 3306/tcp
```

**Firewalld (CentOS/RHEL):**
```bash
# Abrir puerto
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

#### 2.4 Habilitar Acceso Remoto en MariaDB

Editar `/etc/mysql/mariadb.conf.d/50-server.cnf` (Ubuntu) o `/etc/my.cnf.d/server.cnf` (CentOS):

```ini
[mysqld]
# Cambiar de:
bind-address = 127.0.0.1

# A (escuchar en todas las interfaces):
bind-address = 0.0.0.0

# O IP específica:
bind-address = 10.0.0.5
```

Reiniciar servicio:
```bash
sudo systemctl restart mariadb
```

#### 2.5 Probar Conexión Remota

Desde otra máquina:
```bash
mysql -h 192.168.1.100 -u inspecciones_app -p inspect_muni
```

---

### Opción 3: Base de Datos en AWS RDS

#### 3.1 Crear Instancia RDS

```bash
# 1. Ir a AWS Console → RDS → Create database
# 2. Seleccionar: MariaDB 10.11
# 3. Templates: Free tier o Production
# 4. Settings:
#    - DB instance identifier: inspecciones-db
#    - Master username: admin
#    - Master password: (contraseña segura)
# 5. DB instance class: db.t3.micro (free tier) o db.t3.medium
# 6. Storage: 20 GB SSD
# 7. Connectivity:
#    - Public access: Yes (para desarrollo) o No (producción con VPC)
#    - VPC security group: Crear nuevo
# 8. Additional configuration:
#    - Initial database name: inspect_muni
# 9. Create database
```

#### 3.2 Configurar Security Group

```bash
# En AWS Console → EC2 → Security Groups
# Editar inbound rules del security group de RDS:

Type: MySQL/Aurora
Protocol: TCP
Port: 3306
Source: 
  - Para desarrollo: 0.0.0.0/0 (cualquier IP)
  - Para producción: IP del servidor backend o security group del backend
```

#### 3.3 Obtener Endpoint

En RDS Console → Databases → inspecciones-db:

```
Endpoint: inspecciones-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com
Port: 3306
```

---

## Parte 2: Vinculación Backend ↔ Base de Datos

### 2.1 Configurar Variables de Entorno

Crear/editar `.env` en el backend:

**Opción A: Variables Individuales (Recomendado para desarrollo)**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=inspecciones_app
DB_PASSWORD=P@ssw0rd_S3cur0_2025!
DB_DATABASE=inspect_muni
```

**Opción B: DATABASE_URL (Railway, Heroku)**

```env
DATABASE_URL=mysql://user:password@host:port/database
```

### 2.2 Configurar TypeORM en el Backend

El archivo `src/app.module.ts` ya está configurado para leer las variables:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRoot({
      type: 'mariadb',
      
      // Opción 1: Usar DATABASE_URL
      url: process.env.DATABASE_URL,
      
      // Opción 2: Usar variables individuales
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      
      // Configuración de entidades
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      
      // Sincronización automática (solo desarrollo)
      synchronize: process.env.TYPEORM_SYNC === 'true',
      
      // Logging
      logging: process.env.NODE_ENV === 'development',
      
      // Configuración de conexión
      autoLoadEntities: true,
      connectTimeout: 60000,
      
      // Pool de conexiones
      extra: {
        connectionLimit: 10,
      },
    }),
    
    // Otros módulos...
  ],
})
export class AppModule {}
```

### 2.3 Probar Conexión desde el Backend

**Método 1: Iniciar la aplicación**

```bash
# En el directorio del backend
npm run start:dev
```

Si conecta correctamente, verás:
```
[Nest] 12345  - 11/10/2025, 10:30:00 AM     LOG [TypeOrmModule] Successfully connected to database
[Nest] 12345  - 11/10/2025, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
```

**Método 2: Script de prueba**

Crear `scripts/test-db-connection.ts`:

```typescript
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    const connection = await createConnection({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log('✅ Conexión exitosa a la base de datos');
    console.log('📊 Base de datos:', connection.options.database);
    console.log('🖥️  Host:', connection.options.host);
    
    await connection.close();
    console.log('✅ Conexión cerrada correctamente');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
```

Ejecutar:
```bash
npx ts-node scripts/test-db-connection.ts
```

### 2.4 Crear Tablas en la Base de Datos

**Opción A: Sincronización Automática (Solo Desarrollo)**

```env
TYPEORM_SYNC=true
```

```bash
npm run start:dev
# Las tablas se crearán automáticamente
```

**Opción B: Migraciones (Producción)**

```bash
# Generar migración
npm run typeorm migration:generate -- -n InitialMigration

# Ejecutar migraciones
npm run typeorm migration:run

# Revertir última migración
npm run typeorm migration:revert
```

**Opción C: Script SQL Manual**

```sql
-- Ver estructura actual
SHOW TABLES;
DESCRIBE users;
DESCRIBE inspections;

-- Si las tablas no existen, ejecutar con TYPEORM_SYNC=true una vez
-- o crear manualmente (no recomendado)
```

### 2.5 Verificar que las Tablas se Crearon

```bash
# Conectar a la base de datos
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE

# Ver tablas
SHOW TABLES;

# Debe mostrar:
# +-------------------------+
# | Tables_in_inspect_muni  |
# +-------------------------+
# | antiquity               |
# | collection              |
# | concession              |
# | concession_parcel       |
# | construction            |
# | general_inspection      |
# | individual_request      |
# | inspection              |
# | inspection_users        |
# | land_use                |
# | legal_entity_request    |
# | location                |
# | mayor_office            |
# | pc_cancellation         |
# | platforms_and_services  |
# | revenue_patent          |
# | tax_procedure           |
# | users                   |
# | work_closure            |
# | work_receipt            |
# +-------------------------+
```

---

## Parte 3: Vinculación Frontend ↔ Backend

### 3.1 Configurar URL del Backend en el Frontend

#### React (Vite/Create React App)

**Crear archivo `.env` en la raíz del frontend:**

```env
# Desarrollo local
VITE_API_URL=http://localhost:3000

# Producción
VITE_API_URL=https://api.inspecciones.com
```

**Crear servicio de API (`src/services/api.ts`):**

```typescript
import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Usar en componentes:**

```typescript
import api from '@/services/api';

// Login
async function login(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

// Obtener inspecciones
async function getInspections() {
  try {
    const response = await api.get('/inspections');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo inspecciones:', error);
    throw error;
  }
}
```

#### Vue.js

**Crear plugin de axios (`src/plugins/axios.ts`):**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Usar en Vuex/Pinia stores:**

```typescript
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: null,
  }),
  
  actions: {
    async login(email: string, password: string) {
      const response = await api.post('/auth/login', { email, password });
      this.token = response.data.access_token;
      localStorage.setItem('access_token', this.token);
      return response.data;
    },
    
    async fetchUser() {
      const response = await api.get('/users/me');
      this.user = response.data;
    },
  },
});
```

### 3.2 Configurar CORS en el Backend

**Archivo `src/main.ts`:**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend corriendo en puerto ${port}`);
  console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL}`);
}

bootstrap();
```

**Variables de entorno en el backend:**

```env
# Desarrollo
FRONTEND_URL=http://localhost:5174

# Producción
FRONTEND_URL=https://inspecciones.vercel.app
```

⚠️ **IMPORTANTE:** `FRONTEND_URL` NO debe terminar en `/`

### 3.3 Probar Conexión Frontend → Backend

**Crear componente de prueba:**

```typescript
// TestConnection.tsx
import { useEffect, useState } from 'react';
import api from '@/services/api';

export function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function testConnection() {
      try {
        // Endpoint público de health check
        const response = await api.get('/health');
        setStatus('success');
        setMessage(`✅ Conectado: ${JSON.stringify(response.data)}`);
      } catch (error: any) {
        setStatus('error');
        setMessage(`❌ Error: ${error.message}`);
      }
    }
    
    testConnection();
  }, []);

  return (
    <div>
      <h2>Test de Conexión</h2>
      <p>Estado: {status}</p>
      <p>{message}</p>
    </div>
  );
}
```

**Crear endpoint de health check en el backend (si no existe):**

```typescript
// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
    };
  }
}
```

---

## Configuración por Escenario

### Escenario 1: Todo Local (Desarrollo)

```
Frontend: http://localhost:5174
Backend:  http://localhost:3000
Database: localhost:3306
```

**Backend `.env`:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=inspect_muni
TYPEORM_SYNC=true
PORT=3000
FRONTEND_URL=http://localhost:5174
JWT_SECRET=dev_secret_change_in_production
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000
```

---

### Escenario 2: Frontend Vercel + Backend Railway + DB Railway

```
Frontend: https://inspecciones-frontend.vercel.app
Backend:  https://inspecciones-backend.up.railway.app
Database: Railway internal (containers-us-west-XXX.railway.app)
```

**Backend en Railway:**
```env
DATABASE_URL=mysql://root:xxx@containers-us-west-XXX.railway.app:3306/railway
TYPEORM_SYNC=false
PORT=$PORT
NODE_ENV=production
FRONTEND_URL=https://inspecciones-frontend.vercel.app
JWT_SECRET=production_secret_64_characters_minimum
```

**Frontend en Vercel:**
```env
VITE_API_URL=https://inspecciones-backend.up.railway.app
```

---

### Escenario 3: Frontend VPS + Backend VPS + DB VPS (Mismo Servidor)

```
Frontend: https://inspecciones.com (Nginx → localhost:5173)
Backend:  https://api.inspecciones.com (Nginx → localhost:3000)
Database: localhost:3306
```

**Backend `.env`:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=inspecciones_app
DB_PASSWORD=secure_password
DB_DATABASE=inspect_muni
TYPEORM_SYNC=false
PORT=3000
FRONTEND_URL=https://inspecciones.com
JWT_SECRET=production_secret_64_characters
```

**Frontend `.env`:**
```env
VITE_API_URL=https://api.inspecciones.com
```

**Nginx configuración:**
```nginx
# Frontend
server {
    listen 443 ssl;
    server_name inspecciones.com;
    
    ssl_certificate /etc/ssl/certs/inspecciones.com.crt;
    ssl_certificate_key /etc/ssl/private/inspecciones.com.key;
    
    root /var/www/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 443 ssl;
    server_name api.inspecciones.com;
    
    ssl_certificate /etc/ssl/certs/api.inspecciones.com.crt;
    ssl_certificate_key /etc/ssl/private/api.inspecciones.com.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Escenario 4: Frontend VPS + Backend VPS + DB AWS RDS

```
Frontend: https://inspecciones.com (VPS1)
Backend:  https://api.inspecciones.com (VPS2)
Database: inspecciones-db.xxx.us-east-1.rds.amazonaws.com
```

**Backend `.env`:**
```env
DB_HOST=inspecciones-db.c1a2b3c4d5e6.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=rds_secure_password
DB_DATABASE=inspect_muni
TYPEORM_SYNC=false
PORT=3000
FRONTEND_URL=https://inspecciones.com
JWT_SECRET=production_secret_64_characters
```

---

## Testing de Conexiones

### Test 1: Backend → Database

```bash
# Desde el servidor del backend
mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE -e "SELECT 1;"

# Debe responder:
# +---+
# | 1 |
# +---+
# | 1 |
# +---+
```

### Test 2: Backend Health Check

```bash
# Desde cualquier máquina
curl https://api.inspecciones.com/health

# Debe responder:
# {"status":"ok","timestamp":"2025-11-10T10:30:00.000Z","environment":"production"}
```

### Test 3: Frontend → Backend (Login)

```bash
# Probar endpoint de login
curl -X POST https://api.inspecciones.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Debe responder con token:
# {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### Test 4: Frontend → Backend con JWT

```bash
# Usar token del test anterior
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl https://api.inspecciones.com/users/me \
  -H "Authorization: Bearer $TOKEN"

# Debe responder con datos del usuario
```

### Test 5: CORS desde el Frontend

Abrir consola del navegador y ejecutar:

```javascript
fetch('https://api.inspecciones.com/health')
  .then(res => res.json())
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err));
```

---

## Troubleshooting

### Error: ECONNREFUSED (Backend no puede conectar a DB)

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Soluciones:**
1. Verificar que MariaDB esté corriendo:
   ```bash
   sudo systemctl status mariadb  # Linux
   ```

2. Verificar credenciales en `.env`:
   ```bash
   cat .env | grep DB_
   ```

3. Probar conexión manual:
   ```bash
   mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD
   ```

4. Verificar firewall:
   ```bash
   sudo ufw status  # Ubuntu
   telnet $DB_HOST 3306  # Probar conectividad
   ```

---

### Error: CORS Policy Blocked (Frontend no puede conectar a Backend)

**Síntomas:**
```
Access to fetch at 'https://api.com' from origin 'https://frontend.com' has been blocked by CORS policy
```

**Soluciones:**

1. Verificar `FRONTEND_URL` en backend `.env`:
   ```bash
   echo $FRONTEND_URL
   # Debe coincidir EXACTAMENTE con la URL del frontend
   # SIN barra al final
   ```

2. Verificar configuración CORS en `main.ts`:
   ```typescript
   app.enableCors({
     origin: process.env.FRONTEND_URL,
     credentials: true,
   });
   ```

3. Reiniciar backend después de cambiar variables:
   ```bash
   pm2 restart inspecciones-api  # VPS
   # O hacer redeploy en Railway
   ```

4. Verificar que el frontend use la URL correcta:
   ```typescript
   // En frontend
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

---

### Error: 401 Unauthorized (Token inválido)

**Síntomas:**
```
401 Unauthorized
```

**Soluciones:**

1. Verificar que el token se esté enviando:
   ```typescript
   // En navegador, Network tab
   // Headers → Authorization: Bearer xxx
   ```

2. Verificar que `JWT_SECRET` sea el mismo en backend:
   ```bash
   # Backend
   echo $JWT_SECRET
   ```

3. Token expirado - hacer login nuevamente

4. Limpiar localStorage del navegador:
   ```javascript
   localStorage.clear();
   ```

---

### Error: Connection timeout

**Síntomas:**
```
Error: Connection timeout
```

**Soluciones:**

1. Aumentar timeout en TypeORM:
   ```typescript
   TypeOrmModule.forRoot({
     connectTimeout: 60000,  // 60 segundos
   })
   ```

2. Verificar latencia de red:
   ```bash
   ping $DB_HOST
   ```

3. Verificar límite de conexiones en MariaDB:
   ```sql
   SHOW VARIABLES LIKE 'max_connections';
   SET GLOBAL max_connections = 200;
   ```

---

## Checklist de Integración

### Base de Datos
- [ ] MariaDB instalado y corriendo
- [ ] Base de datos `inspect_muni` creada
- [ ] Usuario de aplicación creado con permisos
- [ ] Firewall configurado (si acceso remoto)
- [ ] Conexión probada con cliente MySQL

### Backend
- [ ] Variables de entorno configuradas en `.env`
- [ ] TypeORM configurado correctamente
- [ ] Tablas creadas (TYPEORM_SYNC o migraciones)
- [ ] Health check endpoint funciona
- [ ] CORS habilitado para frontend
- [ ] Backend accesible desde internet (producción)

### Frontend
- [ ] VITE_API_URL configurado
- [ ] Servicio de API (axios) creado
- [ ] Interceptores para JWT configurados
- [ ] Health check desde frontend exitoso
- [ ] Login funciona correctamente
- [ ] Requests autenticados funcionan

### Producción
- [ ] TYPEORM_SYNC=false en backend
- [ ] JWT_SECRET aleatorio y seguro
- [ ] HTTPS habilitado
- [ ] Certificados SSL válidos
- [ ] Backups de base de datos configurados
- [ ] Monitoreo activo

---

**✅ Manual completo de integración de componentes.**
