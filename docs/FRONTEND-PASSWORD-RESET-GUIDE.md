# 🔐 Guía Frontend: Flujo Correcto de Reset Password

## 🚨 IMPORTANTE: Bug de Seguridad Corregido

Se detectó y corrigió un bug de seguridad donde usuarios podían acceder al sistema administrativo después de usar "Olvidé mi contraseña" **sin hacer login válido**.

---

## ✅ Flujo Correcto (Implementar en Frontend)

### **Paso 1: Página "Olvidé mi Contraseña"**

```typescript
// /pages/forgot-password.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Mostrar mensaje de éxito
        setMessage('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
        
        // Opcional: redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        // Mostrar error
        setMessage(data.message || 'Error al enviar el correo');
      }
    } catch (error) {
      setMessage('Error de conexión. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Recuperar Contraseña</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
```

---

### **Paso 2: Página de Reset Password (con token en URL)**

```typescript
// /pages/reset-password.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query; // Token desde la URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones locales
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!token) {
      setError('Token inválido o faltante');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token as string, 
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ CRÍTICO: NO guardar nada en localStorage
        // ✅ CRÍTICO: NO usar el token como JWT
        // ✅ CRÍTICO: Limpiar cualquier sesión previa
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.clear();

        // Mostrar mensaje de éxito
        alert(data.message || 'Contraseña actualizada. Por favor inicia sesión.');

        // ✅ OBLIGATORIO: Redirigir al login
        router.push('/login');
      } else {
        setError(data.message || 'Error al restablecer contraseña');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <h1>Nueva Contraseña</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit" disabled={loading || !token}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

### **Paso 3: Página de Login (debe funcionar con nueva contraseña)**

```typescript
// /pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Guardar el JWT válido
        localStorage.setItem('authToken', data.access_token);
        
        // Obtener datos del usuario
        const userResponse = await fetch('http://localhost:3000/users/me', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('user', JSON.stringify(userData));

          // Redirigir según el rol
          if (userData.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/inspector/dashboard');
          }
        }
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      
      <a href="/forgot-password" className="forgot-link">
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  );
}
```

---

## 🔒 Validaciones de Seguridad Backend

El backend ahora valida:

### 1. **En `/users/forgot-password`:**
- ✅ Email es requerido
- ✅ Formato de email válido
- ✅ Usuario existe en el sistema
- ✅ Usuario NO está bloqueado

### 2. **En `/users/reset-password`:**
- ✅ Token es requerido
- ✅ Nueva contraseña es requerida
- ✅ Contraseña mínimo 6 caracteres
- ✅ Token es válido y no expiró (20 minutos)
- ✅ Usuario NO está bloqueado
- ✅ Token se invalida después de usarse

### 3. **En todas las rutas protegidas:**
- ✅ JWT es válido
- ✅ Usuario NO está bloqueado (verificación en cada request)

---

## ❌ Errores Comunes a Evitar

### **❌ ERROR 1: Usar token de reset como JWT**

```typescript
// ❌ NO HACER ESTO
const handleResetPassword = async (token, newPassword) => {
  await fetch('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
  
  // ❌ ERROR: Usar el token de reset como si fuera un JWT
  localStorage.setItem('authToken', token);
  router.push('/admin/dashboard'); // ❌ Acceso indebido
}
```

### **❌ ERROR 2: No limpiar sesión**

```typescript
// ❌ NO HACER ESTO
const handleResetPassword = async (token, newPassword) => {
  await fetch('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
  
  // ❌ ERROR: No limpiar localStorage
  // La sesión antigua podría seguir activa
  router.push('/login');
}
```

### **❌ ERROR 3: Redirigir directamente al admin**

```typescript
// ❌ NO HACER ESTO
const handleResetPassword = async (token, newPassword) => {
  const response = await fetch('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
  
  if (response.ok) {
    // ❌ ERROR: Redirigir al admin sin login
    router.push('/admin/dashboard');
  }
}
```

---

## ✅ Flujo Visual Correcto

```
┌─────────────────────┐
│  Usuario olvida     │
│  su contraseña      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  /forgot-password   │
│  Ingresa email      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend envía      │
│  email con token    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Usuario recibe     │
│  link con token     │
│  /reset-password?   │
│  token=abc123       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  /reset-password    │
│  Nueva contraseña   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend valida y   │
│  actualiza password │
│  Invalida token     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ Limpiar         │
│  localStorage       │
│  ✅ Redirigir a     │
│  /login             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Usuario hace login │
│  con nueva password │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ✅ Recibe JWT      │
│  ✅ Acceso al admin │
└─────────────────────┘
```

---

## 🧪 Casos de Prueba

### **Test 1: Flujo Completo**
1. Ir a `/forgot-password`
2. Ingresar email válido
3. Verificar email recibido
4. Click en link del email
5. Ingresar nueva contraseña (mín. 6 chars)
6. Verificar redirección a `/login`
7. Login con nueva contraseña
8. ✅ Acceso exitoso

### **Test 2: Token Expirado**
1. Solicitar reset password
2. Esperar más de 20 minutos
3. Intentar usar el token
4. ❌ Debe mostrar "Token inválido o expirado"

### **Test 3: Usuario Bloqueado**
1. Admin bloquea usuario
2. Usuario intenta reset password
3. ❌ Debe mostrar "La cuenta está bloqueada"

### **Test 4: Contraseña Débil**
1. Ir a reset password
2. Ingresar contraseña de 5 caracteres
3. ❌ Debe mostrar "Mínimo 6 caracteres"

---

## 📞 Soporte

Si tienes dudas sobre esta implementación:
- **Backend:** Verificar `SECURITY-FIX-PASSWORD-RESET.md`
- **Tests:** 347/347 pasando ✅
- **Endpoint:** `POST /users/reset-password`

**Fecha de actualización:** Octubre 20, 2025  
**Versión Backend:** 1.1.0
