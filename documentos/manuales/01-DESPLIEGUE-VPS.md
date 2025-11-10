# Manual de Despliegue en VPS

## Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial del Servidor](#configuración-inicial-del-servidor)
3. [Instalación de Dependencias](#instalación-de-dependencias)
4. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
5. [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
6. [Configuración de Nginx](#configuración-de-nginx)
7. [Configuración de SSL/HTTPS](#configuración-de-sslhttps)
8. [Process Manager (PM2)](#process-manager-pm2)
9. [Variables de Entorno](#variables-de-entorno)
10. [Monitoreo y Logs](#monitoreo-y-logs)
11. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

### Servidor VPS Recomendado

- **RAM:** Mínimo 2GB (4GB recomendado)
- **CPU:** 2 cores
- **Almacenamiento:** 20GB SSD
- **SO:** Ubuntu 22.04 LTS (recomendado) o Ubuntu 20.04 LTS
- **Ancho de banda:** Ilimitado o mínimo 1TB/mes

### Proveedores Sugeridos

- **DigitalOcean:** Droplet de $12/mes (2GB RAM, 2 vCPUs)
- **Linode:** Linode 2GB ($12/mes)
- **Vultr:** Cloud Compute 2GB ($12/mes)
- **AWS Lightsail:** $10/mes (2GB RAM)
- **Hetzner:** CX21 (€5.83/mes) - Excelente relación precio/calidad

### Dominio

- Tener un dominio registrado (ej: `inspecciones-santacruz.com`)
- Acceso a configuración DNS del dominio

---

## Configuración Inicial del Servidor

### 1. Acceso SSH

```bash
# Conectar al servidor (reemplazar con tu IP)
ssh root@TU_IP_VPS

# O si tienes un usuario no-root
ssh usuario@TU_IP_VPS
```

### 2. Actualizar el Sistema

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar paquetes instalados
sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git build-essential
```

### 3. Crear Usuario para la Aplicación (Recomendado)

```bash
# Crear usuario
sudo adduser appuser

# Agregar a grupo sudo
sudo usermod -aG sudo appuser

# Cambiar a nuevo usuario
su - appuser
```

### 4. Configurar Firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar estado
sudo ufw status
```

---

## Instalación de Dependencias

### 1. Instalar Node.js 18.x

```bash
# Agregar repositorio de NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x o superior
```

### 2. Instalar MariaDB 10.x

```bash
# Instalar MariaDB
sudo apt install -y mariadb-server mariadb-client

# Iniciar servicio
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Verificar estado
sudo systemctl status mariadb

# Configuración segura
sudo mysql_secure_installation
```

**Durante `mysql_secure_installation`:**
- Enter current password: `[ENTER]` (no hay password aún)
- Switch to unix_socket authentication: `N`
- Change root password: `Y` → Ingresar password seguro
- Remove anonymous users: `Y`
- Disallow root login remotely: `Y`
- Remove test database: `Y`
- Reload privilege tables: `Y`

### 3. Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar servicio
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar estado
sudo systemctl status nginx
```

### 4. Instalar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalación
pm2 --version
```

---

## Configuración de la Base de Datos

### 1. Crear Base de Datos

```bash
# Acceder a MariaDB como root
sudo mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE inspect_muni CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario para la aplicación
CREATE USER 'inspecciones_user'@'localhost' IDENTIFIED BY 'TU_PASSWORD_SEGURO_AQUI';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON inspect_muni.* TO 'inspecciones_user'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT User, Host FROM mysql.user;

-- Salir
EXIT;
```

### 2. Probar Conexión

```bash
# Conectar con el nuevo usuario
mysql -u inspecciones_user -p inspect_muni

# Si conecta correctamente, salir
EXIT;
```

### 3. Configurar Backups Automáticos

```bash
# Crear directorio para backups
sudo mkdir -p /var/backups/mariadb

# Crear script de backup
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
# Script de backup automático

BACKUP_DIR="/var/backups/mariadb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="inspect_muni"
DB_USER="inspecciones_user"
DB_PASS="TU_PASSWORD_SEGURO_AQUI"

# Crear backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Eliminar backups antiguos (mayores a 7 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +7 -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/backup-db.sh

# Agregar a crontab (ejecutar diariamente a las 2 AM)
sudo crontab -e
```

Agregar línea:
```
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## Despliegue de la Aplicación

### 1. Clonar Repositorio

```bash
# Ir al directorio home
cd ~

# Crear directorio para aplicaciones
mkdir -p apps
cd apps

# Clonar repositorio
git clone https://github.com/Geraldsamurai3/Inspecciones-Muni-Santa-Cruz.git
cd Inspecciones-Muni-Santa-Cruz

# Verificar branch
git branch
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias de producción
npm install --production

# Si tienes problemas con permisos
sudo chown -R $USER:$USER ~/apps/Inspecciones-Muni-Santa-Cruz
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

```env
# === BASE DE DATOS ===
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=inspecciones_user
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI
DB_DATABASE=inspect_muni

# === TYPEORM ===
# ⚠️ IMPORTANTE: SIEMPRE false en producción
TYPEORM_SYNC=false

# === SERVIDOR ===
PORT=3000
NODE_ENV=production

# URL del frontend (SIN BARRA AL FINAL)
FRONTEND_URL=https://tu-frontend.vercel.app

# === JWT ===
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=TU_JWT_SECRET_64_CARACTERES_ALEATORIOS
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
SMTP_PASS=SG.TU_SENDGRID_API_KEY_AQUI
EMAIL_FROM="Municipalidad Santa Cruz <inspecciones@santacruz.go.cr>"
```

**⚠️ IMPORTANTE:** Generar JWT_SECRET aleatorio:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Compilar la Aplicación

```bash
# Compilar TypeScript a JavaScript
npm run build

# Verificar que se creó la carpeta dist/
ls -la dist/
```

### 5. Ejecutar Migraciones (Si aplica)

```bash
# Si tienes migraciones TypeORM
npm run migration:run

# O crear las tablas manualmente ejecutando SQL
```

### 6. Probar la Aplicación

```bash
# Iniciar en modo producción (temporalmente)
npm run start:prod

# Debe mostrar:
# [Nest] 12345  - 01/10/2025, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
# Server running on port 3000
```

```bash
# Probar endpoint en otra terminal
curl http://localhost:3000

# Debe responder con datos
```

Si funciona, detener con `Ctrl+C`.

---

## Configuración de Nginx

### 1. Crear Configuración del Sitio

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/inspecciones
```

```nginx
# Configuración para inspecciones-santacruz.com

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name inspecciones-santacruz.com www.inspecciones-santacruz.com;

    # Redirigir todo a HTTPS
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name inspecciones-santacruz.com www.inspecciones-santacruz.com;

    # Certificados SSL (se configurarán con Certbot)
    ssl_certificate /etc/letsencrypt/live/inspecciones-santacruz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inspecciones-santacruz.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Logs
    access_log /var/log/nginx/inspecciones_access.log;
    error_log /var/log/nginx/inspecciones_error.log;

    # Tamaño máximo de subida (para imágenes)
    client_max_body_size 10M;

    # Proxy a la aplicación Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para assets estáticos (si los sirves desde aquí)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Habilitar el Sitio

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/inspecciones /etc/nginx/sites-enabled/

# Eliminar sitio default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Si está OK, recargar Nginx
sudo systemctl reload nginx
```

### 3. Configurar DNS

En tu proveedor de dominio (GoDaddy, Namecheap, etc.):

```
Tipo    Nombre    Valor           TTL
A       @         TU_IP_VPS       3600
A       www       TU_IP_VPS       3600
```

Esperar propagación DNS (5-60 minutos).

---

## Configuración de SSL/HTTPS

### 1. Instalar Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado SSL

```bash
# Obtener certificado (reemplazar con tu dominio)
sudo certbot --nginx -d inspecciones-santacruz.com -d www.inspecciones-santacruz.com

# Durante el proceso:
# - Email: tu@email.com
# - Agree to Terms: Y
# - Share email: N (opcional)
# - Redirect HTTP to HTTPS: 2 (Redirect)
```

### 3. Verificar Renovación Automática

```bash
# Certbot renueva automáticamente. Probar:
sudo certbot renew --dry-run

# Si funciona, está configurado correctamente
```

### 4. Verificar SSL

Visitar: `https://www.ssllabs.com/ssltest/analyze.html?d=inspecciones-santacruz.com`

Debe obtener calificación A o A+.

---

## Process Manager (PM2)

### 1. Crear Archivo de Configuración PM2

```bash
# Crear ecosystem.config.js
nano ~/apps/Inspecciones-Muni-Santa-Cruz/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'inspecciones-api',
    script: 'dist/main.js',
    instances: 2,  // 2 instancias para balanceo de carga
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000
  }]
};
```

### 2. Crear Directorio de Logs

```bash
mkdir -p ~/apps/Inspecciones-Muni-Santa-Cruz/logs
```

### 3. Iniciar con PM2

```bash
# Ir al directorio del proyecto
cd ~/apps/Inspecciones-Muni-Santa-Cruz

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración para arranque automático
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup

# Copiar y ejecutar el comando que muestra PM2
```

### 4. Comandos PM2 Útiles

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs de una app específica
pm2 logs inspecciones-api

# Reiniciar aplicación
pm2 restart inspecciones-api

# Recargar sin downtime
pm2 reload inspecciones-api

# Detener aplicación
pm2 stop inspecciones-api

# Eliminar aplicación
pm2 delete inspecciones-api

# Ver métricas
pm2 monit

# Ver información detallada
pm2 show inspecciones-api
```

---

## Variables de Entorno

### Checklist de Variables de Producción

| Variable | Descripción | Valor Producción | ⚠️ Importante |
|----------|-------------|------------------|---------------|
| `DB_HOST` | Host de base de datos | `localhost` | ✅ |
| `DB_PORT` | Puerto MariaDB | `3306` | ✅ |
| `DB_USERNAME` | Usuario de BD | `inspecciones_user` | ✅ |
| `DB_PASSWORD` | Password de BD | 🔒 Seguro | ✅ Cambiar |
| `DB_DATABASE` | Nombre de BD | `inspect_muni` | ✅ |
| `TYPEORM_SYNC` | Sincronización auto | **`false`** | 🚨 CRÍTICO |
| `PORT` | Puerto aplicación | `3000` | ✅ |
| `NODE_ENV` | Entorno | `production` | ✅ |
| `FRONTEND_URL` | URL frontend | `https://tu-frontend.com` | ✅ Sin `/` final |
| `JWT_SECRET` | Secret JWT | 🔒 64 chars random | 🚨 Cambiar |
| `JWT_EXPIRATION` | Expiración token | `1h` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloud Cloudinary | Ver cuenta | ✅ |
| `CLOUDINARY_API_KEY` | API Key Cloudinary | Ver cuenta | ✅ |
| `CLOUDINARY_API_SECRET` | API Secret | Ver cuenta | 🔒 Secreto |
| `SMTP_HOST` | Host SMTP | `smtp.sendgrid.net` | ✅ |
| `SMTP_PORT` | Puerto SMTP | `587` | ✅ |
| `SMTP_USER` | Usuario SMTP | `apikey` | ✅ |
| `SMTP_PASS` | Password SMTP | `SG.xxxxx` | 🔒 SendGrid |
| `EMAIL_FROM` | Email remitente | `"Nombre <email@domain>"` | ✅ |

### Generar JWT Secret Seguro

```bash
# Método 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Método 2: OpenSSL
openssl rand -hex 64

# Método 3: /dev/urandom (Linux)
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
```

---

## Monitoreo y Logs

### 1. Logs de la Aplicación

```bash
# Logs de PM2 en tiempo real
pm2 logs inspecciones-api

# Solo errores
pm2 logs inspecciones-api --err

# Últimas 100 líneas
pm2 logs inspecciones-api --lines 100

# Guardar logs en archivo
pm2 logs inspecciones-api > logs_$(date +%Y%m%d).txt
```

### 2. Logs de Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/inspecciones_access.log

# Error log
sudo tail -f /var/log/nginx/inspecciones_error.log

# Buscar errores específicos
sudo grep "error" /var/log/nginx/inspecciones_error.log
```

### 3. Logs de MariaDB

```bash
# Error log
sudo tail -f /var/log/mysql/error.log

# Query log (si está habilitado)
sudo tail -f /var/log/mysql/query.log
```

### 4. Monitoreo con PM2 Plus (Opcional)

```bash
# Registrarse en https://app.pm2.io/
# Obtener clave pública y secreta

# Conectar PM2
pm2 link TU_CLAVE_PUBLICA TU_CLAVE_SECRETA
```

### 5. Monitoreo de Recursos

```bash
# Uso de CPU y RAM
htop

# Uso de disco
df -h

# Procesos de Node
ps aux | grep node

# Puertos abiertos
sudo netstat -tulpn | grep LISTEN
```

---

## Troubleshooting

### Problema 1: La aplicación no inicia

**Síntomas:**
```bash
pm2 status
# App en estado "errored"
```

**Solución:**
```bash
# Ver logs
pm2 logs inspecciones-api --err

# Verificar variables de entorno
cat ~/apps/Inspecciones-Muni-Santa-Cruz/.env

# Probar manualmente
cd ~/apps/Inspecciones-Muni-Santa-Cruz
npm run start:prod
```

**Causas comunes:**
- Error en `.env` (variable faltante o incorrecta)
- Base de datos no accesible
- Puerto 3000 ocupado

---

### Problema 2: Error de conexión a base de datos

**Síntomas:**
```
ECONNREFUSED 127.0.0.1:3306
```

**Solución:**
```bash
# Verificar que MariaDB esté corriendo
sudo systemctl status mariadb

# Reiniciar MariaDB
sudo systemctl restart mariadb

# Probar conexión
mysql -u inspecciones_user -p inspect_muni

# Verificar credenciales en .env
```

---

### Problema 3: Error 502 Bad Gateway en Nginx

**Síntomas:**
Al visitar el dominio aparece "502 Bad Gateway"

**Solución:**
```bash
# Verificar que la app esté corriendo
pm2 status

# Si no está corriendo, iniciar
pm2 start ecosystem.config.js

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/inspecciones_error.log

# Verificar configuración de Nginx
sudo nginx -t
```

---

### Problema 4: Error de permisos al subir imágenes

**Síntomas:**
```
EACCES: permission denied
```

**Solución:**
```bash
# Dar permisos al directorio de la aplicación
sudo chown -R $USER:$USER ~/apps/Inspecciones-Muni-Santa-Cruz

# Si usas carpeta de uploads local
mkdir -p ~/apps/Inspecciones-Muni-Santa-Cruz/uploads
chmod 755 ~/apps/Inspecciones-Muni-Santa-Cruz/uploads
```

---

### Problema 5: Emails no se envían

**Síntomas:**
Usuarios no reciben emails de recuperación de contraseña

**Solución:**
```bash
# Verificar configuración SMTP en .env
cat ~/apps/Inspecciones-Muni-Santa-Cruz/.env | grep SMTP

# Probar conexión SMTP manualmente
telnet smtp.sendgrid.net 587

# Verificar logs
pm2 logs inspecciones-api | grep -i "email"

# Verificar API Key de SendGrid en https://app.sendgrid.com/
```

---

### Problema 6: CORS errors desde el frontend

**Síntomas:**
```
Access to fetch at 'https://api.inspecciones.com' has been blocked by CORS policy
```

**Solución:**
```bash
# Verificar FRONTEND_URL en .env
cat ~/apps/Inspecciones-Muni-Santa-Cruz/.env | grep FRONTEND_URL

# Debe coincidir EXACTAMENTE con la URL del frontend (sin barra final)
# Correcto: https://inspecciones-frontend.vercel.app
# Incorrecto: https://inspecciones-frontend.vercel.app/

# Reiniciar aplicación después de cambiar
pm2 restart inspecciones-api
```

---

### Problema 7: Certificado SSL expirado

**Síntomas:**
Navegador muestra advertencia de seguridad

**Solución:**
```bash
# Verificar fecha de expiración
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar renovación automática
sudo systemctl status certbot.timer

# Forzar renovación
sudo certbot renew --force-renewal
```

---

### Problema 8: Aplicación consume mucha RAM

**Síntomas:**
```bash
pm2 monit
# Muestra uso de RAM > 500MB por instancia
```

**Solución:**
```bash
# Reducir número de instancias en ecosystem.config.js
# Cambiar instances: 2 a instances: 1

# Reducir límite de memoria
# Cambiar max_memory_restart: '500M' a '300M'

# Reiniciar
pm2 delete inspecciones-api
pm2 start ecosystem.config.js
```

---

## Actualización de la Aplicación

### Proceso de Actualización

```bash
# 1. Conectar al servidor
ssh usuario@TU_IP_VPS

# 2. Ir al directorio del proyecto
cd ~/apps/Inspecciones-Muni-Santa-Cruz

# 3. Hacer backup de .env
cp .env .env.backup

# 4. Obtener últimos cambios
git pull origin main

# 5. Instalar nuevas dependencias
npm install --production

# 6. Compilar
npm run build

# 7. Ejecutar migraciones (si aplica)
# npm run migration:run

# 8. Reiniciar aplicación
pm2 reload inspecciones-api

# 9. Verificar logs
pm2 logs inspecciones-api
```

---

## Checklist de Seguridad

- [ ] Firewall configurado (UFW)
- [ ] SSH con autenticación por llave (no password)
- [ ] Usuario no-root para la aplicación
- [ ] Fail2ban instalado para proteger SSH
- [ ] MariaDB solo escucha en localhost
- [ ] JWT_SECRET aleatorio y seguro (64 caracteres)
- [ ] DB_PASSWORD fuerte (mínimo 16 caracteres)
- [ ] TYPEORM_SYNC=false en producción
- [ ] SSL/HTTPS configurado correctamente
- [ ] Headers de seguridad en Nginx
- [ ] Backups automáticos de base de datos
- [ ] Logs monitoreados regularmente
- [ ] Rate limiting en Nginx (opcional)
- [ ] Variables de entorno en .env (no hardcodeadas)

---

## Comandos de Referencia Rápida

```bash
# Reiniciar aplicación
pm2 restart inspecciones-api

# Ver logs
pm2 logs inspecciones-api

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar MariaDB
sudo systemctl restart mariadb

# Ver estado de servicios
sudo systemctl status nginx mariadb

# Backup manual de BD
mysqldump -u inspecciones_user -p inspect_muni > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u inspecciones_user -p inspect_muni < backup_20250110.sql

# Actualizar aplicación
cd ~/apps/Inspecciones-Muni-Santa-Cruz && git pull && npm install --production && npm run build && pm2 reload inspecciones-api
```

---

**✅ Manual completo de despliegue en VPS. Ver también:**
- [02-DESPLIEGUE-CI-CD.md](./02-DESPLIEGUE-CI-CD.md) - Automatización con GitHub Actions
- [03-DESPLIEGUE-DATACENTER.md](./03-DESPLIEGUE-DATACENTER.md) - Servidor corporativo
