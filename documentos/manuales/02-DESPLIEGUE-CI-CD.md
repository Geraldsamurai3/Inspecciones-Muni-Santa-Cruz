# Manual de CI/CD con GitHub Actions

## Índice
1. [Introducción](#introducción)
2. [Arquitectura de CI/CD](#arquitectura-de-cicd)
3. [Configuración del Repositorio](#configuración-del-repositorio)
4. [Workflow de CI (Integración Continua)](#workflow-de-ci-integración-continua)
5. [Workflow de CD (Despliegue Continuo)](#workflow-de-cd-despliegue-continuo)
6. [Despliegue Automático a VPS](#despliegue-automático-a-vps)
7. [Despliegue Automático a Railway](#despliegue-automático-a-railway)
8. [Secrets y Variables de Entorno](#secrets-y-variables-de-entorno)
9. [Estrategias de Despliegue](#estrategias-de-despliegue)
10. [Rollback Automático](#rollback-automático)
11. [Monitoreo y Notificaciones](#monitoreo-y-notificaciones)
12. [Troubleshooting](#troubleshooting)

---

## Introducción

Este manual explica cómo configurar un pipeline de CI/CD completo para automatizar:

- ✅ **Linting** y formateo de código
- ✅ **Tests** unitarios y E2E
- ✅ **Build** de la aplicación
- ✅ **Despliegue automático** a diferentes entornos
- ✅ **Rollback** en caso de errores
- ✅ **Notificaciones** de estado

### Herramientas Utilizadas

- **GitHub Actions**: Pipeline CI/CD
- **PM2**: Process manager en VPS
- **Railway**: Plataforma PaaS (opcional)
- **Docker**: Containerización (opcional)
- **Slack/Discord**: Notificaciones

---

## Arquitectura de CI/CD

```
┌─────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │ git push
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS (CI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Lint    │→ │  Test    │→ │  Build   │→ │  Deploy  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└───────────────────┬─────────────────────┬───────────────────────┘
                    │                     │
         ┌──────────▼──────────┐ ┌───────▼──────────┐
         │   VPS (Production)  │ │  Railway (Prod)  │
         │   PM2 + Nginx       │ │  Auto Deploy     │
         └─────────────────────┘ └──────────────────┘
```

---

## Configuración del Repositorio

### 1. Estructura de Branches

```
main (production)
  ↑
develop (staging)
  ↑
feature/nueva-funcionalidad
hotfix/correccion-critica
```

**Estrategia:**
- `main` → Producción (protegida)
- `develop` → Staging/Pre-producción
- `feature/*` → Nuevas funcionalidades
- `hotfix/*` → Correcciones urgentes

### 2. Proteger Branch Main

En GitHub:

1. Settings → Branches → Add branch protection rule
2. Branch name pattern: `main`
3. Activar:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

---

## Workflow de CI (Integración Continua)

### Crear Archivo de Workflow

Crear: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check formatting
        run: npm run format -- --check

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
    
    services:
      mariadb:
        image: mariadb:10.11
        env:
          MYSQL_ROOT_PASSWORD: test_password
          MYSQL_DATABASE: inspect_muni_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
        env:
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_USERNAME: root
          DB_PASSWORD: test_password
          DB_DATABASE: inspect_muni_test
          JWT_SECRET: test_jwt_secret_for_ci_only
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_USERNAME: root
          DB_PASSWORD: test_password
          DB_DATABASE: inspect_muni_test
          JWT_SECRET: test_jwt_secret_for_ci_only
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Workflow de CD (Despliegue Continuo)

### Despliegue a VPS

Crear: `.github/workflows/deploy-vps.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Permite ejecución manual

jobs:
  deploy:
    name: Deploy to Production VPS
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd ~/apps/Inspecciones-Muni-Santa-Cruz
            
            # Backup del .env actual
            cp .env .env.backup
            
            # Pull latest changes
            git pull origin main
            
            # Install dependencies
            npm ci --production
            
            # Build application
            npm run build
            
            # Reload PM2
            pm2 reload ecosystem.config.js --update-env
            
            # Wait for app to start
            sleep 5
            
            # Check if app is running
            if pm2 list | grep -q "online"; then
              echo "✅ Deployment successful"
              # Remove backup
              rm .env.backup
            else
              echo "❌ Deployment failed, rolling back"
              # Restore backup
              mv .env.backup .env
              git reset --hard HEAD~1
              npm ci --production
              npm run build
              pm2 reload ecosystem.config.js
              exit 1
            fi
      
      - name: Health check
        run: |
          sleep 10
          curl -f https://api.inspecciones-santacruz.com/health || exit 1
      
      - name: Notify success
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '✅ Deployment to Production VPS successful',
              attachments: [{
                color: 'good',
                text: `Commit: ${{ github.event.head_commit.message }}\nAuthor: ${{ github.actor }}`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '❌ Deployment to Production VPS failed',
              attachments: [{
                color: 'danger',
                text: `Commit: ${{ github.event.head_commit.message }}\nAuthor: ${{ github.actor }}`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Despliegue Automático a VPS

### Configuración del Servidor

#### 1. Generar SSH Key en GitHub

```bash
# En tu máquina local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/github_actions_key.pub usuario@TU_IP_VPS
```

#### 2. Probar Conexión

```bash
ssh -i ~/.ssh/github_actions_key usuario@TU_IP_VPS
```

#### 3. Configurar Deploy Key en el Servidor

```bash
# En el servidor VPS
cd ~/apps/Inspecciones-Muni-Santa-Cruz

# Configurar git para usar SSH
git remote set-url origin git@github.com:Geraldsamurai3/Inspecciones-Muni-Santa-Cruz.git

# Generar deploy key
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/vps_deploy_key

# Agregar clave pública a GitHub
cat ~/.ssh/vps_deploy_key.pub
# Copiar y pegar en: GitHub → Repo → Settings → Deploy keys → Add deploy key
```

#### 4. Script de Despliegue en VPS

Crear: `~/apps/Inspecciones-Muni-Santa-Cruz/scripts/deploy.sh`

```bash
#!/bin/bash

# Script de despliegue automático
# Uso: ./scripts/deploy.sh

set -e  # Detener en caso de error

APP_DIR="$HOME/apps/Inspecciones-Muni-Santa-Cruz"
BACKUP_DIR="$HOME/backups/inspecciones"
APP_NAME="inspecciones-api"

echo "🚀 Iniciando despliegue..."

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

# Ir al directorio de la app
cd "$APP_DIR"

# Backup de .env
echo "📦 Creando backup de .env..."
cp .env "$BACKUP_DIR/.env.$(date +%Y%m%d_%H%M%S)"

# Obtener versión actual
CURRENT_VERSION=$(git rev-parse --short HEAD)
echo "📌 Versión actual: $CURRENT_VERSION"

# Pull de cambios
echo "⬇️  Descargando cambios..."
git pull origin main

# Nueva versión
NEW_VERSION=$(git rev-parse --short HEAD)
echo "📌 Nueva versión: $NEW_VERSION"

# Instalar dependencias
echo "📚 Instalando dependencias..."
npm ci --production

# Build
echo "🔨 Compilando aplicación..."
npm run build

# Backup de PM2
echo "💾 Guardando configuración PM2..."
pm2 save

# Reload PM2
echo "🔄 Recargando aplicación..."
pm2 reload ecosystem.config.js --update-env

# Esperar que la app inicie
echo "⏳ Esperando inicio de aplicación..."
sleep 5

# Health check
echo "🏥 Verificando salud de la aplicación..."
if pm2 list | grep -q "$APP_NAME.*online"; then
  echo "✅ Despliegue exitoso: $CURRENT_VERSION → $NEW_VERSION"
  
  # Limpiar backups antiguos (mayores a 7 días)
  find "$BACKUP_DIR" -name ".env.*" -type f -mtime +7 -delete
  
  exit 0
else
  echo "❌ Despliegue falló, la aplicación no está en línea"
  echo "🔙 Intentando rollback..."
  
  # Rollback
  git reset --hard "$CURRENT_VERSION"
  npm ci --production
  npm run build
  pm2 reload ecosystem.config.js
  
  echo "🔙 Rollback completado"
  exit 1
fi
```

Dar permisos:

```bash
chmod +x ~/apps/Inspecciones-Muni-Santa-Cruz/scripts/deploy.sh
```

---

## Despliegue Automático a Railway

### Crear Workflow para Railway

Crear: `.github/workflows/deploy-railway.yml`

```yaml
name: Deploy to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Deploy to Railway
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Health check
        run: |
          sleep 15
          curl -f https://inspecciones-muni-santa-cruz-production.up.railway.app/health || exit 1
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        if: always()
        with:
          status: ${{ job.status }}
          text: 'Railway deployment ${{ job.status }}'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Secrets y Variables de Entorno

### Configurar Secrets en GitHub

1. Ir a: **Repository → Settings → Secrets and variables → Actions**
2. Click en **New repository secret**

### Secrets Necesarios

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `VPS_HOST` | IP o dominio del VPS | `123.45.67.89` |
| `VPS_USERNAME` | Usuario SSH | `appuser` |
| `VPS_SSH_KEY` | Clave privada SSH | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Puerto SSH | `22` |
| `RAILWAY_TOKEN` | Token de Railway | `railway_xxxxx` |
| `SLACK_WEBHOOK` | Webhook de Slack | `https://hooks.slack.com/...` |
| `SNYK_TOKEN` | Token de Snyk (seguridad) | `snyk_xxxxx` |

### Obtener Railway Token

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Obtener token
railway whoami
```

### Configurar Slack Webhook

1. Ir a: https://api.slack.com/apps
2. Create New App → From scratch
3. Incoming Webhooks → Activate
4. Add New Webhook to Workspace
5. Copiar Webhook URL

---

## Estrategias de Despliegue

### 1. Blue-Green Deployment

```yaml
# .github/workflows/blue-green.yml
name: Blue-Green Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy to Green environment
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            # Deploy to green (port 3001)
            cd ~/apps/Inspecciones-Muni-Santa-Cruz-Green
            git pull
            npm ci --production
            npm run build
            pm2 reload ecosystem-green.config.js
            
            # Health check green
            sleep 5
            if curl -f http://localhost:3001/health; then
              echo "✅ Green is healthy"
              
              # Switch Nginx to green
              sudo ln -sf /etc/nginx/sites-available/inspecciones-green /etc/nginx/sites-enabled/inspecciones
              sudo systemctl reload nginx
              
              # Stop blue
              pm2 stop inspecciones-api-blue
            else
              echo "❌ Green failed, keeping blue"
              exit 1
            fi
```

### 2. Canary Deployment

```yaml
# .github/workflows/canary.yml
name: Canary Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy canary (10% traffic)
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            # Deploy canary
            cd ~/apps/Inspecciones-Muni-Santa-Cruz-Canary
            git pull
            npm ci --production
            npm run build
            pm2 reload ecosystem-canary.config.js
            
            # Configure Nginx for 10% canary traffic
            # (Requiere configuración especial de Nginx con split_clients)
            
            # Monitor for 10 minutes
            sleep 600
            
            # Check error rate
            ERROR_RATE=$(pm2 logs inspecciones-api-canary --lines 1000 | grep -c "ERROR" || echo 0)
            
            if [ $ERROR_RATE -lt 10 ]; then
              echo "✅ Canary successful, promoting to 100%"
              # Promote canary to production
            else
              echo "❌ Canary failed, rolling back"
              pm2 stop inspecciones-api-canary
              exit 1
            fi
```

### 3. Rolling Deployment

```javascript
// ecosystem.config.js - Configuración para rolling deployment
module.exports = {
  apps: [{
    name: 'inspecciones-api',
    script: 'dist/main.js',
    instances: 4,  // 4 instancias
    exec_mode: 'cluster',
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    
    // PM2 reinicia de a una instancia
    instance_var: 'INSTANCE_ID',
    
    // Esperar 2 segundos entre reinicios
    restart_delay: 2000
  }]
};
```

---

## Rollback Automático

### Script de Rollback

Crear: `~/apps/Inspecciones-Muni-Santa-Cruz/scripts/rollback.sh`

```bash
#!/bin/bash

# Script de rollback
# Uso: ./scripts/rollback.sh [COMMIT_HASH]

set -e

APP_DIR="$HOME/apps/Inspecciones-Muni-Santa-Cruz"
APP_NAME="inspecciones-api"

cd "$APP_DIR"

# Si se pasa un commit, usar ese; si no, el anterior
if [ -z "$1" ]; then
  TARGET_COMMIT=$(git rev-parse HEAD~1)
  echo "📌 Sin commit especificado, usando anterior: $TARGET_COMMIT"
else
  TARGET_COMMIT="$1"
  echo "📌 Rollback a commit: $TARGET_COMMIT"
fi

echo "🔙 Iniciando rollback..."

# Reset al commit objetivo
git reset --hard "$TARGET_COMMIT"

# Reinstalar dependencias
echo "📚 Reinstalando dependencias..."
npm ci --production

# Rebuild
echo "🔨 Recompilando..."
npm run build

# Reload PM2
echo "🔄 Recargando aplicación..."
pm2 reload ecosystem.config.js

# Verificar
sleep 5
if pm2 list | grep -q "$APP_NAME.*online"; then
  echo "✅ Rollback exitoso a $TARGET_COMMIT"
else
  echo "❌ Rollback falló"
  exit 1
fi
```

### Workflow de Rollback Manual

Crear: `.github/workflows/rollback.yml`

```yaml
name: Manual Rollback

on:
  workflow_dispatch:
    inputs:
      commit:
        description: 'Commit hash to rollback to (leave empty for previous)'
        required: false
        default: ''

jobs:
  rollback:
    name: Rollback to Previous Version
    runs-on: ubuntu-latest
    
    steps:
      - name: Rollback on VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/apps/Inspecciones-Muni-Santa-Cruz
            ./scripts/rollback.sh ${{ github.event.inputs.commit }}
      
      - name: Notify rollback
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '🔙 Rollback executed',
              attachments: [{
                color: 'warning',
                text: `Target: ${{ github.event.inputs.commit || 'previous commit' }}\nBy: ${{ github.actor }}`
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Monitoreo y Notificaciones

### Health Check Endpoint

Asegurarse de tener un endpoint de salud:

```typescript
// src/app.controller.ts
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };
}
```

### Workflow de Monitoreo

Crear: `.github/workflows/health-check.yml`

```yaml
name: Health Check

on:
  schedule:
    - cron: '*/15 * * * *'  # Cada 15 minutos
  workflow_dispatch:

jobs:
  check:
    name: Check API Health
    runs-on: ubuntu-latest
    
    steps:
      - name: Health check
        run: |
          RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api.inspecciones-santacruz.com/health)
          
          if [ $RESPONSE -eq 200 ]; then
            echo "✅ API is healthy"
          else
            echo "❌ API returned $RESPONSE"
            exit 1
          fi
      
      - name: Notify if down
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              text: '🚨 API is DOWN!',
              attachments: [{
                color: 'danger',
                text: 'Health check failed. Please investigate immediately.'
              }]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Notificaciones a Discord

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: "Deployment Status"
    description: "Deployment to production ${{ job.status }}"
    color: ${{ job.status == 'success' && '0x00FF00' || '0xFF0000' }}
```

---

## Troubleshooting

### Error: SSH Connection Failed

**Problema:**
```
ssh: connect to host xxx.xxx.xxx.xxx port 22: Connection refused
```

**Solución:**
1. Verificar que el VPS esté encendido
2. Verificar puerto SSH correcto (22 o personalizado)
3. Verificar firewall del VPS
4. Verificar que la SSH key sea correcta

```bash
# Probar conexión manualmente
ssh -i ~/.ssh/github_actions_key usuario@IP -vvv
```

---

### Error: PM2 Command Not Found

**Problema:**
```
pm2: command not found
```

**Solución:**
```bash
# En el servidor VPS
npm install -g pm2

# Agregar PM2 al PATH en .bashrc o .profile
echo 'export PATH="$PATH:$(npm bin -g)"' >> ~/.bashrc
source ~/.bashrc
```

---

### Error: Build Artifact Too Large

**Problema:**
```
Error: Artifact size exceeds limit
```

**Solución:**
Modificar `.github/workflows/ci.yml`:

```yaml
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    name: dist
    path: |
      dist/
      !dist/**/*.map
      !dist/**/*.spec.js
    retention-days: 1  # Reducir retención
```

---

### Error: Database Migration Failed

**Problema:**
```
Migration failed: Table already exists
```

**Solución:**
```yaml
# En el workflow, agregar paso de migración
- name: Run migrations
  run: |
    ssh usuario@VPS "cd ~/apps/Inspecciones-Muni-Santa-Cruz && npm run migration:run"
```

---

## Checklist de CI/CD

### Antes de Implementar

- [ ] Tests unitarios cubren >80% del código
- [ ] Tests E2E para flujos críticos
- [ ] Health check endpoint implementado
- [ ] Scripts de rollback probados
- [ ] Secrets configurados en GitHub
- [ ] SSH keys configuradas correctamente
- [ ] Backups automáticos de BD configurados
- [ ] Monitoreo de logs configurado

### Después de Implementar

- [ ] Pipeline CI ejecuta correctamente
- [ ] Deployment automático funciona
- [ ] Rollback automático probado
- [ ] Notificaciones llegan correctamente
- [ ] Health checks funcionan
- [ ] Logs accesibles en GitHub Actions
- [ ] Documentación actualizada

---

## Comandos Útiles

```bash
# Ver workflows en ejecución
gh run list

# Ver logs de un workflow
gh run view [RUN_ID] --log

# Re-ejecutar workflow fallido
gh run rerun [RUN_ID]

# Trigger manual deployment
gh workflow run deploy-vps.yml

# Ver secrets configurados
gh secret list

# Agregar secret
gh secret set VPS_HOST
```

---

**✅ Manual completo de CI/CD. Ver también:**
- [01-DESPLIEGUE-VPS.md](./01-DESPLIEGUE-VPS.md) - Despliegue manual en VPS
- [03-DESPLIEGUE-DATACENTER.md](./03-DESPLIEGUE-DATACENTER.md) - Servidor corporativo
