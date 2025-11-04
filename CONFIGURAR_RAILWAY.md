# 🚀 Configurar Variables de Entorno en Railway

## Problema
El endpoint `/users/forgot-password` funciona en **local** pero retorna **401 Unauthorized** en **Railway**.

## Causa
Las **variables de entorno SMTP** no están configuradas en Railway, causando que el servicio de email falle.

---

## 📋 Variables Requeridas en Railway

Ve a tu proyecto en Railway → **Variables** y agrega estas variables:

### 1. SMTP Configuration (Ejemplo con Gmail)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=andreylanza3@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

⚠️ **IMPORTANTE para Gmail:**
- NO uses tu contraseña normal de Gmail
- Debes generar una **"Contraseña de aplicación"**

### 2. Email Configuration

```bash
EMAIL_FROM="Inspecciones Santa Cruz <andreylanza3@gmail.com>"
```

### 3. Frontend URL

```bash
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

⚠️ **Sin "/" al final**

---

## 🔐 Cómo Generar Contraseña de Aplicación en Gmail

### Paso 1: Habilitar Verificación en 2 Pasos
1. Ve a **Google Account**: https://myaccount.google.com/
2. Click en **Seguridad**
3. Busca **Verificación en 2 pasos**
4. Actívala (si no está activada)

### Paso 2: Generar Contraseña de Aplicación
1. En **Seguridad** → **Contraseñas de aplicaciones**
2. Puede que necesites iniciar sesión nuevamente
3. Selecciona:
   - **App**: Correo
   - **Dispositivo**: Otro (personalizado)
   - Nombre: "Railway Inspecciones"
4. Click en **Generar**
5. Google te mostrará una contraseña de 16 caracteres (ejemplo: `abcd efgh ijkl mnop`)
6. **Copia esta contraseña** y úsala en `SMTP_PASS`

### Paso 3: Configurar en Railway
```bash
SMTP_PASS=abcdefghijklmnop
```
(Sin espacios en la contraseña)

---

## ✅ Checklist de Configuración

Verifica que tengas **TODAS** estas variables en Railway:

- [ ] `SMTP_HOST` (smtp.gmail.com)
- [ ] `SMTP_PORT` (587)
- [ ] `SMTP_USER` (tu email)
- [ ] `SMTP_PASS` (contraseña de aplicación, NO tu contraseña normal)
- [ ] `EMAIL_FROM` (formato: "Nombre <email@gmail.com>")
- [ ] `FRONTEND_URL` (sin "/" al final)

También verifica que tengas estas (probablemente ya las tengas):

- [ ] `DB_HOST`
- [ ] `DB_PORT`
- [ ] `DB_USERNAME`
- [ ] `DB_PASSWORD`
- [ ] `DB_DATABASE`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRATION` (1d)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

---

## 🔧 Pasos para Configurar en Railway

### 1. Accede a Railway
```
https://railway.app/
```

### 2. Selecciona tu Proyecto
- Click en **inspecciones-muni-santa-cruz-production**

### 3. Ve a Variables
- Click en tu servicio backend
- Click en la pestaña **"Variables"**

### 4. Agrega las Variables
- Click en **"New Variable"**
- Agrega cada variable una por una:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = andreylanza3@gmail.com
SMTP_PASS = [tu contraseña de aplicación]
EMAIL_FROM = "Inspecciones Santa Cruz <andreylanza3@gmail.com>"
FRONTEND_URL = https://inspecciones-front-santa-cruz.vercel.app
```

### 5. Railway Reiniciará Automáticamente
- Después de agregar las variables, Railway reiniciará el servicio
- Espera 1-2 minutos

### 6. Prueba el Endpoint
```bash
curl -X POST https://inspecciones-muni-santa-cruz-production.up.railway.app/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "andreylanza3@gmail.com"}'
```

Respuesta esperada:
```json
{
  "message": "Email de restablecimiento enviado"
}
```

---

## 🐛 Si Sigue Sin Funcionar

### Opción 1: Revisar Logs en Railway
1. Ve a tu proyecto en Railway
2. Click en **"Deployments"**
3. Click en el último deployment
4. Revisa los **logs** en tiempo real
5. Busca errores como:
   - `Error enviando email de restablecimiento`
   - `SMTP connection failed`
   - `Invalid login`

### Opción 2: Usar SendGrid (Más Confiable)

SendGrid es más confiable para producción y tiene 100 emails/día gratis:

#### A. Crear Cuenta en SendGrid
1. Ve a https://sendgrid.com/
2. Crea una cuenta gratuita
3. Verifica tu email
4. Ve a **Settings → API Keys**
5. Crea una nueva API Key con permisos **"Mail Send"**
6. Copia la API Key (empieza con `SG.`)

#### B. Configurar en Railway
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Inspecciones Santa Cruz <noreply@tudominio.com>"
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

---

## 📧 Formato del Email de Restablecimiento

Cuando el usuario recibe el email, verá:

**Asunto:** Restablece tu contraseña

**Contenido:**
- Nombre del usuario
- Botón: "Restablecer Contraseña"
- Link que lleva a: `https://inspecciones-front-santa-cruz.vercel.app/admin/reset-password?token=xxxxx`
- Mensaje de expiración: "Este enlace expirará en 20 minutos"

---

## 🎯 Resumen

**El problema NO es tu código** ✅

Tu código está correcto:
- `@Public()` decorador aplicado ✅
- Guard global configurado ✅
- Endpoints de auth públicos ✅

**El problema es configuración** ⚙️

Solo necesitas agregar las variables SMTP en Railway para que el servicio de email funcione.

---

## 📞 Ayuda Adicional

Si después de configurar todo sigue sin funcionar:

1. Toma screenshot de tus variables en Railway (oculta las contraseñas)
2. Copia los logs de Railway cuando intentes enviar el email
3. Verifica que el email `andreylanza3@gmail.com` exista en tu base de datos

---

**Tiempo estimado:** 5-10 minutos para configurar Gmail

**Prioridad:** 🔴 CRÍTICA - Sin esto, el forgot-password no funcionará
