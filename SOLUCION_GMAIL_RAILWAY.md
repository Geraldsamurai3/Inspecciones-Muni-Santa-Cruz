# 🚨 Solución: Gmail Bloqueando Conexiones desde Railway

## Problema Identificado

Gmail está **bloqueando o rechazando** las conexiones SMTP desde los servidores de Railway, causando:
- ⏱️ Timeout después de 1+ minuto
- ❌ Error "Error al enviar el email"
- ✅ Funciona perfectamente en localhost

## ¿Por qué sucede esto?

Gmail tiene protecciones de seguridad que bloquean conexiones desde:
- Servidores cloud (AWS, Railway, Heroku, etc.)
- IPs que no son de confianza
- Ubicaciones geográficas sospechosas

---

## 🎯 Solución 1: Usar SendGrid (RECOMENDADO)

SendGrid es **100% compatible con Railway** y ofrece 100 emails/día gratis.

### Paso 1: Crear cuenta en SendGrid

1. Ve a https://sendgrid.com/
2. Click en **"Start for Free"**
3. Completa el registro
4. Verifica tu email

### Paso 2: Crear API Key

1. Una vez dentro, ve a **Settings** → **API Keys**
2. Click en **"Create API Key"**
3. Nombre: "Railway Production"
4. Permisos: **"Mail Send"** (full access)
5. Click en **"Create & View"**
6. **COPIA la API Key** (empieza con `SG.`)
   - ⚠️ Solo la verás una vez, guárdala bien

### Paso 3: Configurar en Railway

Ve a tu proyecto en Railway → Variables y **REEMPLAZA** las variables SMTP:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Inspecciones Santa Cruz <noreply@yourdomain.com>"
FRONTEND_URL=https://inspecciones-front-santa-cruz.vercel.app
```

⚠️ **IMPORTANTE:** 
- `SMTP_USER` debe ser exactamente `apikey` (no cambies esto)
- `SMTP_PASS` es tu API Key de SendGrid (SG.xxx...)

### Paso 4: Verificar Dominio (Opcional pero recomendado)

Para mejor deliverability:
1. Ve a SendGrid → Settings → **Sender Authentication**
2. **Single Sender Verification** → Verifica tu email
3. O **Domain Authentication** → Verifica tu dominio completo

---

## 🎯 Solución 2: Usar Resend (Moderno y Simple)

Resend es una alternativa moderna, muy fácil de usar.

### Paso 1: Crear cuenta

1. Ve a https://resend.com/
2. Crea una cuenta gratuita (3,000 emails/mes)

### Paso 2: Obtener API Key

1. Dashboard → **API Keys**
2. Create API Key
3. Copia la key

### Paso 3: Instalar paquete

```bash
npm install resend
```

### Paso 4: Modificar email.service.ts

```typescript
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'));
  }

  async sendResetPasswordEmail(
    to: string,
    token: string,
    firstName?: string,
    lastName?: string,
  ) {
    const frontendRaw = this.config.get<string>('FRONTEND_URL');
    const frontend = frontendRaw.replace(/\/$/, '');
    const resetLink = `${frontend}/admin/reset-password?token=${token}`;

    const { data, error } = await this.resend.emails.send({
      from: 'Inspecciones Santa Cruz <onboarding@resend.dev>',
      to: [to],
      subject: 'Restablece tu contraseña',
      html: `
        <h2>Hola ${firstName}</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <a href="${resetLink}">Restablecer contraseña</a>
        <p>Este enlace expirará en 20 minutos.</p>
      `,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { messageId: data.id };
  }
}
```

---

## 🎯 Solución 3: Gmail con App Password + OAuth2

Si insistes en usar Gmail, necesitas OAuth2 (más complejo):

### Paso 1: Habilitar OAuth2 en Gmail

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto
3. Habilita Gmail API
4. Crea credenciales OAuth2
5. Obtén Client ID, Client Secret, Refresh Token

### Paso 2: Configurar nodemailer con OAuth2

```typescript
this.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: this.config.get<string>('GMAIL_USER'),
    clientId: this.config.get<string>('GMAIL_CLIENT_ID'),
    clientSecret: this.config.get<string>('GMAIL_CLIENT_SECRET'),
    refreshToken: this.config.get<string>('GMAIL_REFRESH_TOKEN'),
  },
});
```

⚠️ **Esto es más complejo** y no lo recomiendo a menos que sea absolutamente necesario.

---

## 🎯 Solución 4: Mailgun (Alternativa Profesional)

Mailgun es otra excelente opción para producción.

### Configuración Railway:

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@sandbox-xxx.mailgun.org
SMTP_PASS=tu_password_de_mailgun
EMAIL_FROM="Inspecciones Santa Cruz <noreply@sandbox-xxx.mailgun.org>"
```

---

## 📊 Comparación de Opciones

| Servicio   | Emails Gratis/Mes | Configuración | Confiabilidad | Recomendación |
|------------|-------------------|---------------|---------------|---------------|
| SendGrid   | 3,000 (100/día)   | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐         | ✅ MEJOR      |
| Resend     | 3,000             | ⭐⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐         | ✅ MEJOR      |
| Mailgun    | 5,000             | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐         | ✅ Buena      |
| Gmail OAuth| Ilimitado         | ⭐⭐           | ⭐⭐⭐⭐          | ⚠️ Complejo   |
| Gmail SMTP | Ilimitado         | ⭐⭐⭐⭐⭐        | ⭐⭐            | ❌ NO Railway |

---

## ✅ Mi Recomendación: SendGrid

**SendGrid es la mejor opción porque:**
- ✅ 100% compatible con Railway
- ✅ Configuración en 5 minutos
- ✅ No requiere cambios de código
- ✅ Solo cambias variables de entorno
- ✅ 100 emails/día gratis (suficiente para resets)
- ✅ Excelente deliverability
- ✅ Logs y estadísticas

---

## 🚀 Pasos Rápidos con SendGrid

1. **Crear cuenta SendGrid**: https://sendgrid.com/
2. **Crear API Key**: Settings → API Keys → Create
3. **Copiar API Key**: `SG.xxxxxxxx...`
4. **Ir a Railway**: Tu proyecto → Variables
5. **Cambiar variables**:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxx...
   ```
6. **Esperar 1 minuto** (Railway reinicia automáticamente)
7. **Probar**: El forgot-password funcionará inmediatamente

---

## 🔍 Verificar que Funciona

Después de configurar SendGrid, los logs en Railway mostrarán:

```
📧 Intentando enviar email a: andreylanza3@gmail.com
📧 Configuración SMTP: {
  host: 'smtp.sendgrid.net',
  port: 587,
  user: 'apikey',
  from: 'Inspecciones Santa Cruz <noreply@yourdomain.com>'
}
✅ Email enviado exitosamente. MessageId: <xxxxx>
```

---

## ⚠️ Errores Comunes

### Error: "Invalid API Key"
- Verifica que copiaste la API Key completa (empieza con `SG.`)
- Asegúrate que `SMTP_USER=apikey` (literal)

### Error: "From email not verified"
- Ve a SendGrid → Sender Authentication
- Verifica tu email como "Single Sender"

### Error: "Timeout"
- Verifica que `SMTP_HOST=smtp.sendgrid.net` (sin http://)
- Verifica que `SMTP_PORT=587` (no 465)

---

## 📞 Necesitas Ayuda?

Si tienes problemas:
1. Comparte los logs de Railway (con la configuración SMTP visible)
2. Dime qué servicio elegiste (SendGrid/Resend/Mailgun)
3. Muéstrame las variables de entorno (oculta las contraseñas)

---

**Tiempo estimado con SendGrid: 10 minutos** ⏱️
