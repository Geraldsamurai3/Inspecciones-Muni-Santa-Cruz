# Solución Error "forgot-password" en Railway

## Problema Identificado

El endpoint `/users/forgot-password` está fallando en producción (Railway). El error indica que hay un problema al enviar el email de restablecimiento.

## Posibles Causas

1. **Variables de entorno SMTP no configuradas en Railway**
2. **Credenciales SMTP incorrectas**
3. **Puerto SMTP bloqueado por Railway**
4. **FRONTEND_URL no configurada correctamente**

## Solución Paso a Paso

### 1. Verificar Variables de Entorno en Railway

Ve a tu proyecto en Railway y asegúrate de que estas variables estén configuradas:

```bash
# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación

# Email Configuration
EMAIL_FROM="Inspecciones Santa Cruz <tu-email@gmail.com>"

# Frontend URL (IMPORTANTE: sin / al final)
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

### 2. Configurar Gmail para enviar emails

Si usas Gmail, necesitas:

#### A. Habilitar "Contraseña de aplicación"

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Seguridad → Contraseñas de aplicaciones
4. Genera una nueva contraseña de aplicación
5. Usa esa contraseña en `SMTP_PASS` (NO tu contraseña normal)

#### B. Permitir aplicaciones menos seguras (alternativa)

Si no puedes usar contraseña de aplicación:
1. Ve a https://myaccount.google.com/lesssecureapps
2. Activa "Permitir aplicaciones menos seguras"

### 3. Alternativa: Usar SendGrid (Recomendado para Producción)

SendGrid es más confiable para producción:

#### A. Crear cuenta en SendGrid
1. Ve a https://sendgrid.com/
2. Crea una cuenta gratuita (100 emails/día gratis)
3. Verifica tu email
4. Ve a Settings → API Keys
5. Crea una nueva API Key con permisos "Mail Send"

#### B. Configurar en Railway
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Tu API Key
EMAIL_FROM="Inspecciones Santa Cruz <noreply@tudominio.com>"
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

### 4. Verificar que FRONTEND_URL esté correcto

El `FRONTEND_URL` debe ser la URL exacta de tu frontend en producción:

```bash
# ✅ CORRECTO
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app

# ❌ INCORRECTO (con / al final)
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app/

# ❌ INCORRECTO (localhost)
FRONTEND_URL=http://localhost:5173
```

### 5. Probar el endpoint manualmente

Después de configurar las variables, prueba el endpoint:

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

### 6. Verificar logs en Railway

1. Ve a tu proyecto en Railway
2. Click en "Deployments"
3. Click en el último deployment
4. Ve los logs en tiempo real

Busca errores como:
- `Error enviando email de restablecimiento`
- `SMTP connection failed`
- `Invalid login`

## Código del Backend (Ya está correcto)

El código del backend ya tiene todo lo necesario:

```typescript
// ✅ Decorador @Public() permite acceso sin autenticación
@Public()
@Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  // ... validaciones ...
  
  try {
    const rawToken = await this.usersService.generateResetToken(email);
    await this.emailService.sendResetPasswordEmail(
      email,
      rawToken,
      user.firstName,
      user.lastName,
    );
    return { message: 'Email de restablecimiento enviado' };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw new BadRequestException('Error al enviar el email. Inténtalo más tarde.');
  }
}
```

## Frontend - Cómo hacer la petición

```javascript
async function forgotPassword(email) {
  try {
    const response = await fetch('https://inspecciones-muni-santa-cruz-production.up.railway.app/users/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al enviar email');
    }

    const data = await response.json();
    alert(data.message); // "Email de restablecimiento enviado"
  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar el email. Inténtalo más tarde.');
  }
}
```

## Checklist de Diagnóstico

- [ ] Variables SMTP configuradas en Railway
- [ ] SMTP_PASS es una "contraseña de aplicación" (no la contraseña normal)
- [ ] FRONTEND_URL está configurado y sin "/" al final
- [ ] EMAIL_FROM tiene formato correcto: "Nombre <email@dominio.com>"
- [ ] El email existe en la base de datos
- [ ] El usuario no está bloqueado (isBlocked = false)
- [ ] Los logs de Railway no muestran errores SMTP

## Variables de Entorno Completas para Railway

```env
# Database (Railway MariaDB)
DB_HOST=monorail.proxy.rlwy.net
DB_PORT=30738
DB_USERNAME=root
DB_PASSWORD=tu_password_de_railway
DB_DATABASE=railway

# JWT
JWT_SECRET=tu_secret_super_secreto_y_largo
JWT_EXPIRATION=1d

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Contraseña de aplicación de Google

# Email
EMAIL_FROM="Inspecciones Santa Cruz <tu-email@gmail.com>"

# Frontend
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Port (Railway lo asigna automáticamente)
PORT=3000
```

## Solución Rápida (Si Gmail no funciona)

Si Gmail sigue sin funcionar, usa **Ethereal Email** para testing:

```bash
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=usuario@ethereal.email
SMTP_PASS=password_ethereal
```

Ve a https://ethereal.email/ para crear una cuenta de prueba gratuita.

## Contacto

Si después de seguir estos pasos el error persiste, contacta con:
- Logs completos de Railway
- Variables de entorno configuradas (sin mostrar contraseñas)
- Email que estás intentando usar

---

**IMPORTANTE:** Después de cambiar variables de entorno en Railway, el servicio se reinicia automáticamente. Espera 1-2 minutos antes de probar.
