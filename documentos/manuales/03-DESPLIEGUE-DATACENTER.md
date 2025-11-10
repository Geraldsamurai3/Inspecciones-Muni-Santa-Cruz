# Manual de Despliegue en Datacenter Corporativo

## Índice
1. [Introducción](#introducción)
2. [Arquitectura de Datacenter](#arquitectura-de-datacenter)
3. [Requisitos del Servidor](#requisitos-del-servidor)
4. [Configuración de Red Corporativa](#configuración-de-red-corporativa)
5. [Instalación en Windows Server](#instalación-en-windows-server)
6. [Instalación en Linux Server](#instalación-en-linux-server)
7. [Configuración de Dominio Corporativo](#configuración-de-dominio-corporativo)
8. [Base de Datos Corporativa](#base-de-datos-corporativa)
9. [Active Directory Integration](#active-directory-integration)
10. [Balanceo de Carga](#balanceo-de-carga)
11. [Alta Disponibilidad](#alta-disponibilidad)
12. [Backup y Disaster Recovery](#backup-y-disaster-recovery)
13. [Seguridad Corporativa](#seguridad-corporativa)
14. [Monitoreo Empresarial](#monitoreo-empresarial)

---

## Introducción

Este manual cubre el despliegue de la aplicación de Inspecciones Municipales en un entorno de datacenter corporativo, considerando:

- 🏢 Infraestructura empresarial existente
- 🔒 Políticas de seguridad corporativa
- 📊 Integración con sistemas legacy
- ⚡ Alta disponibilidad y redundancia
- 📈 Escalabilidad empresarial

---

## Arquitectura de Datacenter

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET / WAN                                │
└────────────────────┬────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────────┐
│                    FIREWALL / WAF                                    │
│              (Fortinet, Palo Alto, Cisco ASA)                        │
└────────────────────┬────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────────┐
│                  LOAD BALANCER                                       │
│            (F5, HAProxy, Nginx Plus)                                 │
│              inspecciones.municipalidad.go.cr                        │
└───────┬──────────────────────────┬──────────────────────────────────┘
        │                          │
    ┌───▼────┐                 ┌───▼────┐
    │  WEB1  │                 │  WEB2  │
    │ Node.js│                 │ Node.js│
    │  PM2   │                 │  PM2   │
    └───┬────┘                 └───┬────┘
        │                          │
        └──────────┬───────────────┘
                   │
        ┌──────────▼───────────┐
        │   DATABASE CLUSTER   │
        │  MariaDB Galera      │
        │  Master / Slave      │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │   STORAGE / NAS      │
        │   Backups + Logs     │
        └──────────────────────┘
```

---

## Requisitos del Servidor

### Servidor de Aplicación (Producción)

**Hardware Mínimo:**
- CPU: 4 cores @ 2.5GHz
- RAM: 8GB
- Disco: 100GB SSD (RAID 1 recomendado)
- Red: 1Gbps

**Hardware Recomendado:**
- CPU: 8 cores @ 3.0GHz
- RAM: 16GB
- Disco: 250GB SSD NVMe (RAID 10)
- Red: 10Gbps con bonding

**Sistema Operativo:**
- Windows Server 2019/2022 Standard o Datacenter
- Ubuntu Server 22.04 LTS
- Red Hat Enterprise Linux 8/9
- CentOS Stream 9

### Servidor de Base de Datos

**Hardware Recomendado:**
- CPU: 8 cores @ 3.5GHz
- RAM: 32GB (64GB para alta carga)
- Disco: 500GB SSD NVMe (RAID 10)
- Red: 10Gbps

---

## Configuración de Red Corporativa

### Segmentación de Red

```
DMZ (Public):
  - Load Balancer:     10.100.1.10
  - WAF:               10.100.1.11

Application Tier (Private):
  - Web Server 1:      10.100.2.10
  - Web Server 2:      10.100.2.11

Database Tier (Restricted):
  - DB Master:         10.100.3.10
  - DB Slave:          10.100.3.11

Management (Isolated):
  - Jump Server:       10.100.4.10
  - Monitoring:        10.100.4.11
```

### Configuración de Firewall

```
# Reglas de firewall (ejemplo para iptables)

# Permitir solo Load Balancer a Web Servers
iptables -A INPUT -s 10.100.1.10 -p tcp --dport 3000 -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j DROP

# Permitir solo Web Servers a Database
iptables -A INPUT -s 10.100.2.0/24 -p tcp --dport 3306 -j ACCEPT
iptables -A INPUT -p tcp --dport 3306 -j DROP

# Permitir SSH solo desde Jump Server
iptables -A INPUT -s 10.100.4.10 -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j DROP
```

### DNS Interno

```
# Configuración DNS corporativa

; Zona: municipalidad.go.cr
inspecciones.municipalidad.go.cr.  IN  A  10.100.1.10  ; Load Balancer
api.inspecciones.municipalidad.go.cr.  IN  A  10.100.1.10

web1.inspecciones.municipalidad.go.cr.  IN  A  10.100.2.10
web2.inspecciones.municipalidad.go.cr.  IN  A  10.100.2.11

db-master.inspecciones.municipalidad.go.cr.  IN  A  10.100.3.10
db-slave.inspecciones.municipalidad.go.cr.  IN  A  10.100.3.11
```

---

## Instalación en Windows Server

### 1. Prerrequisitos

```powershell
# Instalar IIS (opcional, para reverse proxy)
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Instalar URL Rewrite Module
# Descargar desde: https://www.iis.net/downloads/microsoft/url-rewrite

# Instalar Application Request Routing (ARR)
# Descargar desde: https://www.iis.net/downloads/microsoft/application-request-routing
```

### 2. Instalar Node.js

```powershell
# Descargar Node.js LTS desde https://nodejs.org/
# O usar Chocolatey:
choco install nodejs-lts -y

# Verificar instalación
node --version
npm --version
```

### 3. Instalar MariaDB

```powershell
# Descargar MariaDB desde https://mariadb.org/download/
# Instalar como servicio de Windows

# Durante instalación:
# - Habilitar networking
# - Puerto: 3306
# - Set root password
# - Enable as Windows Service
```

### 4. Crear Usuario de Servicio

```powershell
# Crear usuario dedicado para la aplicación
net user InspeccionesApp "P@ssw0rd_Seguro!" /add /passwordchg:no /passwordreq:yes
net localgroup "IIS_IUSRS" InspeccionesApp /add

# Dar permisos a la carpeta de la aplicación
icacls "C:\Apps\Inspecciones" /grant "InspeccionesApp:(OI)(CI)F" /T
```

### 5. Desplegar Aplicación

```powershell
# Crear directorio
New-Item -Path "C:\Apps\Inspecciones" -ItemType Directory

# Clonar repositorio
cd C:\Apps
git clone https://github.com/Geraldsamurai3/Inspecciones-Muni-Santa-Cruz.git Inspecciones
cd Inspecciones

# Instalar dependencias
npm install --production

# Crear archivo .env
New-Item -Path ".env" -ItemType File
# Editar .env con las variables necesarias

# Compilar
npm run build
```

### 6. Configurar como Servicio de Windows

**Instalar node-windows:**

```powershell
npm install -g node-windows
```

**Crear script de servicio** (`install-service.js`):

```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Inspecciones Municipales API',
  description: 'API Backend para Sistema de Inspecciones',
  script: 'C:\\Apps\\Inspecciones\\dist\\main.js',
  nodeOptions: [
    '--max_old_space_size=2048'
  ],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    },
    {
      name: 'PORT',
      value: '3000'
    }
  ],
  workingDirectory: 'C:\\Apps\\Inspecciones',
  user: {
    domain: 'MUNICIPALIDAD',
    account: 'InspeccionesApp',
    password: 'P@ssw0rd_Seguro!'
  },
  logpath: 'C:\\Apps\\Inspecciones\\logs'
});

svc.on('install', function() {
  console.log('Servicio instalado correctamente');
  svc.start();
});

svc.install();
```

**Instalar servicio:**

```powershell
node install-service.js
```

**Verificar servicio:**

```powershell
# Ver servicios
Get-Service | Where-Object {$_.Name -like "*Inspecciones*"}

# Iniciar servicio
Start-Service "Inspecciones Municipales API"

# Detener servicio
Stop-Service "Inspecciones Municipales API"

# Ver logs
Get-Content "C:\Apps\Inspecciones\logs\*.log" -Tail 50 -Wait
```

### 7. Configurar IIS como Reverse Proxy

**web.config** en `C:\inetpub\wwwroot\inspecciones\`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxyInboundRule1" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:3000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
    
    <httpProtocol>
      <customHeaders>
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
    
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="10485760" />
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

---

## Instalación en Linux Server

### 1. Configuración Inicial (RHEL/CentOS)

```bash
# Actualizar sistema
sudo dnf update -y

# Instalar herramientas
sudo dnf install -y git curl wget vim

# Configurar SELinux (si aplica)
sudo setenforce 0
sudo sed -i 's/SELINUX=enforcing/SELINUX=permissive/' /etc/selinux/config
```

### 2. Instalar Node.js

```bash
# Agregar repositorio NodeSource
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar
node --version
npm --version
```

### 3. Instalar MariaDB

```bash
# Agregar repositorio oficial de MariaDB
sudo tee /etc/yum.repos.d/mariadb.repo <<EOF
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.11/rhel9-amd64
module_hotfixes = 1
gpgkey = https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck = 1
EOF

# Instalar MariaDB
sudo dnf install -y MariaDB-server MariaDB-client

# Iniciar servicio
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Configuración segura
sudo mysql_secure_installation
```

### 4. Crear Usuario del Sistema

```bash
# Crear usuario dedicado
sudo useradd -r -s /bin/bash -d /opt/inspecciones inspecciones

# Crear directorio de aplicación
sudo mkdir -p /opt/inspecciones
sudo chown -R inspecciones:inspecciones /opt/inspecciones
```

### 5. Desplegar Aplicación

```bash
# Cambiar a usuario inspecciones
sudo su - inspecciones

# Clonar repositorio
cd /opt/inspecciones
git clone https://github.com/Geraldsamurai3/Inspecciones-Muni-Santa-Cruz.git app
cd app

# Instalar dependencias
npm ci --production

# Configurar variables de entorno
cp .env.example .env
nano .env

# Compilar
npm run build
```

### 6. Configurar Systemd Service

Crear `/etc/systemd/system/inspecciones.service`:

```ini
[Unit]
Description=Inspecciones Municipales API
Documentation=https://github.com/Geraldsamurai3/Inspecciones-Muni-Santa-Cruz
After=network.target mariadb.service

[Service]
Type=simple
User=inspecciones
Group=inspecciones
WorkingDirectory=/opt/inspecciones/app
EnvironmentFile=/opt/inspecciones/app/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=inspecciones

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/inspecciones/app/logs

[Install]
WantedBy=multi-user.target
```

**Habilitar servicio:**

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar
sudo systemctl enable inspecciones
sudo systemctl start inspecciones

# Verificar estado
sudo systemctl status inspecciones

# Ver logs
sudo journalctl -u inspecciones -f
```

---

## Configuración de Dominio Corporativo

### 1. Certificado SSL Corporativo

#### Opción A: Certificado Interno (CA Corporativa)

```bash
# Generar CSR (Certificate Signing Request)
openssl req -new -newkey rsa:2048 -nodes \
  -keyout inspecciones.municipalidad.go.cr.key \
  -out inspecciones.municipalidad.go.cr.csr \
  -subj "/C=CR/ST=Guanacaste/L=Santa Cruz/O=Municipalidad de Santa Cruz/CN=inspecciones.municipalidad.go.cr"

# Enviar CSR al equipo de infraestructura/seguridad para firma
# Recibirás: inspecciones.municipalidad.go.cr.crt

# Instalar certificado en el servidor
sudo cp inspecciones.municipalidad.go.cr.crt /etc/ssl/certs/
sudo cp inspecciones.municipalidad.go.cr.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/inspecciones.municipalidad.go.cr.key
```

#### Opción B: Certificado Público (Let's Encrypt)

```bash
# Solo si el dominio es público
sudo dnf install -y certbot

# Obtener certificado
sudo certbot certonly --standalone \
  -d inspecciones.municipalidad.go.cr \
  --email ti@municipalidad.go.cr \
  --agree-tos

# Certificados quedan en:
# /etc/letsencrypt/live/inspecciones.municipalidad.go.cr/
```

### 2. Configurar Nginx con SSL

```bash
# Instalar Nginx
sudo dnf install -y nginx

# Configurar sitio
sudo nano /etc/nginx/conf.d/inspecciones.conf
```

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name inspecciones.municipalidad.go.cr;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name inspecciones.municipalidad.go.cr;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/inspecciones.municipalidad.go.cr.crt;
    ssl_certificate_key /etc/ssl/private/inspecciones.municipalidad.go.cr.key;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/inspecciones_access.log;
    error_log /var/log/nginx/inspecciones_error.log;
    
    # Tamaño máximo de subida
    client_max_body_size 10M;
    
    # Proxy a Node.js
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
}
```

```bash
# Habilitar e iniciar Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar configuración
sudo nginx -t

# Recargar
sudo systemctl reload nginx
```

---

## Base de Datos Corporativa

### Configuración de MariaDB Galera Cluster (Alta Disponibilidad)

#### Servidor 1 (db-master: 10.100.3.10)

```bash
# Instalar Galera
sudo dnf install -y galera-4

# Configurar MariaDB
sudo nano /etc/my.cnf.d/server.cnf
```

```ini
[galera]
wsrep_on=ON
wsrep_provider=/usr/lib64/galera-4/libgalera_smm.so
wsrep_cluster_name="InspeccionesCluster"
wsrep_cluster_address="gcomm://10.100.3.10,10.100.3.11"
wsrep_node_name="db-master"
wsrep_node_address="10.100.3.10"
wsrep_sst_method=rsync

binlog_format=ROW
default_storage_engine=InnoDB
innodb_autoinc_lock_mode=2

# Performance tuning
innodb_buffer_pool_size=8G
innodb_log_file_size=512M
max_connections=500
```

#### Servidor 2 (db-slave: 10.100.3.11)

Misma configuración pero cambiar:
```ini
wsrep_node_name="db-slave"
wsrep_node_address="10.100.3.11"
```

#### Inicializar Cluster

```bash
# En db-master (solo primera vez)
sudo galera_new_cluster

# Verificar
mysql -u root -p -e "SHOW STATUS LIKE 'wsrep_cluster_size';"
# Debe mostrar: wsrep_cluster_size | 1

# En db-slave
sudo systemctl start mariadb

# Verificar en db-master
mysql -u root -p -e "SHOW STATUS LIKE 'wsrep_cluster_size';"
# Debe mostrar: wsrep_cluster_size | 2
```

### Configuración de Backup Automático

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-inspecciones-db.sh
```

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/mnt/backup/mariadb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="inspect_muni"
DB_USER="backup_user"
DB_PASS="backup_password"
RETENTION_DAYS=30

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Backup completo
mysqldump -u "$DB_USER" -p"$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  "$DB_NAME" | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Verificar backup
if [ $? -eq 0 ]; then
  echo "$(date): Backup exitoso - backup_$DATE.sql.gz" >> /var/log/db-backup.log
  
  # Eliminar backups antiguos
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  
  # Copiar a NAS corporativo (opcional)
  rsync -av "$BACKUP_DIR/" backup@nas.municipalidad.go.cr:/backups/inspecciones/
else
  echo "$(date): ERROR - Backup falló" >> /var/log/db-backup.log
  # Enviar alerta por email
  echo "Backup de base de datos falló" | mail -s "ALERTA: Backup DB" ti@municipalidad.go.cr
fi
```

```bash
# Permisos
sudo chmod +x /usr/local/bin/backup-inspecciones-db.sh

# Agregar a cron (diario a las 2 AM)
sudo crontab -e
```

```cron
0 2 * * * /usr/local/bin/backup-inspecciones-db.sh
```

---

## Active Directory Integration

### Autenticación LDAP/AD

**Instalar dependencias:**

```bash
npm install passport-ldapauth
```

**Configurar estrategia LDAP** (`src/auth/ldap.strategy.ts`):

```typescript
import { Strategy as LdapStrategy } from 'passport-ldapauth';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LdapAuthStrategy extends PassportStrategy(LdapStrategy, 'ldap') {
  constructor() {
    super({
      server: {
        url: 'ldap://ad.municipalidad.go.cr:389',
        bindDN: 'CN=ServiceAccount,OU=Service Accounts,DC=municipalidad,DC=go,DC=cr',
        bindCredentials: 'service_account_password',
        searchBase: 'OU=Users,DC=municipalidad,DC=go,DC=cr',
        searchFilter: '(sAMAccountName={{username}})',
        searchAttributes: ['displayName', 'mail', 'memberOf'],
      },
    });
  }

  async validate(user: any) {
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Mapear grupos de AD a roles de la aplicación
    const groups = user.memberOf || [];
    const isAdmin = groups.some((g: string) => 
      g.includes('CN=Inspecciones-Admins')
    );
    
    return {
      username: user.sAMAccountName,
      email: user.mail,
      displayName: user.displayName,
      role: isAdmin ? 'admin' : 'inspector',
    };
  }
}
```

**Variables de entorno:**

```env
# Active Directory
AD_URL=ldap://ad.municipalidad.go.cr:389
AD_BIND_DN=CN=ServiceAccount,OU=Service Accounts,DC=municipalidad,DC=go,DC=cr
AD_BIND_CREDENTIALS=service_account_password
AD_SEARCH_BASE=OU=Users,DC=municipalidad,DC=go,DC=cr
AD_ADMIN_GROUP=CN=Inspecciones-Admins,OU=Groups,DC=municipalidad,DC=go,DC=cr
```

---

## Balanceo de Carga

### HAProxy Configuration

```bash
# Instalar HAProxy
sudo dnf install -y haproxy
```

**Configurar** `/etc/haproxy/haproxy.cfg`:

```haproxy
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    
    # SSL/TLS configuration
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

# Frontend HTTPS
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/inspecciones.pem
    mode http
    option httplog
    option forwardfor
    
    # Security headers
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    http-response set-header X-Frame-Options "SAMEORIGIN"
    http-response set-header X-Content-Type-Options "nosniff"
    
    default_backend app_backend

# Frontend HTTP → HTTPS redirect
frontend http_front
    bind *:80
    mode http
    redirect scheme https code 301 if !{ ssl_fc }

# Backend servidores de aplicación
backend app_backend
    mode http
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    
    # Servidores
    server web1 10.100.2.10:3000 check inter 5s rise 2 fall 3
    server web2 10.100.2.11:3000 check inter 5s rise 2 fall 3

# Stats page
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats auth admin:admin_password_here
```

```bash
# Iniciar HAProxy
sudo systemctl enable haproxy
sudo systemctl start haproxy

# Ver stats
curl http://localhost:8404/stats
```

---

## Alta Disponibilidad

### Keepalived (VIP Failover)

**En ambos servidores:**

```bash
sudo dnf install -y keepalived
```

**Servidor 1 (MASTER)** - `/etc/keepalived/keepalived.conf`:

```
vrrp_script chk_haproxy {
    script "/usr/bin/killall -0 haproxy"
    interval 2
    weight 2
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 101
    advert_int 1
    
    authentication {
        auth_type PASS
        auth_pass SecurePass123
    }
    
    virtual_ipaddress {
        10.100.1.100/24  # VIP
    }
    
    track_script {
        chk_haproxy
    }
}
```

**Servidor 2 (BACKUP)** - Misma configuración pero:
```
state BACKUP
priority 100
```

```bash
# Iniciar Keepalived
sudo systemctl enable keepalived
sudo systemctl start keepalived

# Verificar VIP
ip addr show eth0
```

---

## Backup y Disaster Recovery

### Plan de Respaldo Completo

```bash
# Script de backup completo
sudo nano /usr/local/bin/backup-completo.sh
```

```bash
#!/bin/bash

BACKUP_ROOT="/mnt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/completo_$DATE"

mkdir -p "$BACKUP_DIR"

# 1. Backup de base de datos
echo "Respaldando base de datos..."
mysqldump -u root -p --all-databases --single-transaction | gzip > "$BACKUP_DIR/all_databases.sql.gz"

# 2. Backup de aplicación
echo "Respaldando aplicación..."
tar -czf "$BACKUP_DIR/app.tar.gz" /opt/inspecciones/app

# 3. Backup de configuraciones
echo "Respaldando configuraciones..."
tar -czf "$BACKUP_DIR/config.tar.gz" \
  /etc/nginx \
  /etc/systemd/system/inspecciones.service \
  /etc/haproxy \
  /etc/ssl/certs/inspecciones* \
  /opt/inspecciones/app/.env

# 4. Copiar a NAS
echo "Copiando a NAS..."
rsync -av "$BACKUP_DIR/" backup@nas.municipalidad.go.cr:/backups/inspecciones/

# 5. Limpiar backups antiguos (mayores a 30 días)
find "$BACKUP_ROOT" -name "completo_*" -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completo finalizado: $BACKUP_DIR"
```

### Plan de Recuperación (Disaster Recovery)

```bash
# Restaurar desde backup
sudo nano /usr/local/bin/restore-completo.sh
```

```bash
#!/bin/bash

if [ -z "$1" ]; then
  echo "Uso: $0 <directorio_backup>"
  exit 1
fi

BACKUP_DIR="$1"

# 1. Detener servicios
echo "Deteniendo servicios..."
sudo systemctl stop inspecciones nginx haproxy

# 2. Restaurar base de datos
echo "Restaurando base de datos..."
gunzip < "$BACKUP_DIR/all_databases.sql.gz" | mysql -u root -p

# 3. Restaurar aplicación
echo "Restaurando aplicación..."
rm -rf /opt/inspecciones/app_old
mv /opt/inspecciones/app /opt/inspecciones/app_old
tar -xzf "$BACKUP_DIR/app.tar.gz" -C /

# 4. Restaurar configuraciones
echo "Restaurando configuraciones..."
tar -xzf "$BACKUP_DIR/config.tar.gz" -C /

# 5. Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl start mariadb
sleep 5
sudo systemctl start inspecciones
sudo systemctl start nginx
sudo systemctl start haproxy

# 6. Verificar
echo "Verificando servicios..."
sudo systemctl status inspecciones nginx haproxy mariadb

echo "Restauración completada"
```

---

## Seguridad Corporativa

### 1. Firewall Application Gateway (WAF)

**ModSecurity con Nginx:**

```bash
# Instalar ModSecurity
sudo dnf install -y mod_security

# Configurar reglas OWASP
sudo git clone https://github.com/coreruleset/coreruleset /usr/local/modsecurity-crs
```

### 2. IDS/IPS (Snort/Suricata)

```bash
# Instalar Suricata
sudo dnf install -y suricata

# Configurar reglas
sudo suricata-update

# Iniciar
sudo systemctl enable suricata
sudo systemctl start suricata
```

### 3. Log Aggregation (ELK Stack)

**Enviar logs a servidor central:**

```bash
# Instalar Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.x.x-x86_64.rpm
sudo rpm -vi filebeat-8.x.x-x86_64.rpm

# Configurar
sudo nano /etc/filebeat/filebeat.yml
```

```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/nginx/*.log
    - /var/log/inspecciones/*.log
    - /var/log/mariadb/*.log

output.elasticsearch:
  hosts: ["elk.municipalidad.go.cr:9200"]
  username: "filebeat_user"
  password: "password"
```

---

## Monitoreo Empresarial

### Prometheus + Grafana

**Instalar node_exporter:**

```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar -xzf node_exporter-*.tar.gz
sudo mv node_exporter-*/node_exporter /usr/local/bin/
sudo useradd -rs /bin/false node_exporter

# Crear servicio
sudo nano /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

**Agregar a Prometheus corporativo:**

Informar al equipo de infraestructura para agregar el servidor a Prometheus:
```yaml
- job_name: 'inspecciones-app'
  static_configs:
    - targets: ['10.100.2.10:9100', '10.100.2.11:9100']
```

---

## Checklist de Despliegue Corporativo

### Pre-Despliegue
- [ ] Servidores provisionados y configurados
- [ ] Red corporativa configurada (VLANs, firewall)
- [ ] DNS interno configurado
- [ ] Certificados SSL obtenidos
- [ ] Active Directory configurado (si aplica)
- [ ] Cuentas de servicio creadas
- [ ] Permisos de firewall aprobados
- [ ] Plan de rollback documentado

### Despliegue
- [ ] Aplicación instalada en todos los servidores
- [ ] Variables de entorno configuradas
- [ ] Base de datos cluster configurado
- [ ] Balanceador de carga configurado
- [ ] Alta disponibilidad (Keepalived) configurado
- [ ] SSL/TLS verificado
- [ ] Health checks funcionando

### Post-Despliegue
- [ ] Backups automáticos configurados
- [ ] Monitoreo integrado con Prometheus/Grafana
- [ ] Logs enviados a sistema central (ELK)
- [ ] Alertas configuradas
- [ ] Documentación actualizada
- [ ] Equipo capacitado
- [ ] Plan de DR probado

---

**✅ Manual completo de despliegue en datacenter corporativo.**
