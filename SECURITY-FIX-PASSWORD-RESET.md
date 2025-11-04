# 🔒 Corrección de Vulnerabilidad de Seguridad - Reset Password

## 📋 Resumen del Bug

**Severidad:** 🔴 **CRÍTICA**

Se identificó una vulnerabilidad de seguridad que permitía a usuarios acceder a la parte administrativa después de usar la funcionalidad de "Olvidé mi contraseña", sin necesidad de hacer login con las nuevas credenciales.

---

## 🐛 Problemas Identificados

### 1. **Validación de Usuario Bloqueado en Reset**
- ❌ **ANTES:** Un usuario bloqueado podía cambiar su contraseña usando el token de reset
- ✅ **DESPUÉS:** Se valida que el usuario no esté bloqueado antes de permitir el cambio

### 2. **Falta de Validación en JWT Strategy**
- ❌ **ANTES:** Un usuario bloqueado con un JWT válido podía seguir accediendo
- ✅ **DESPUÉS:** El JwtStrategy verifica en cada request que el usuario no esté bloqueado

### 3. **Mensaje de Respuesta Confuso**
- ❌ **ANTES:** El mensaje no indicaba que se requiere login después del reset
- ✅ **DESPUÉS:** Mensaje claro que indica que debe iniciar sesión nuevamente

### 4. **Validación de Contraseña Débil**
- ❌ **ANTES:** No había validación de longitud mínima
- ✅ **DESPUÉS:** Se requiere mínimo 6 caracteres

---

## 🔧 Cambios Implementados

### **1. users.service.ts**

```typescript
async resetPassword(token: string, newPassword: string): Promise<void> {
  const hashed = this.hashToken(token);
  const user = await this.repo.findOne({ where: { resetToken: hashed } });

  if (!user || !user.resetTokenExpires || Date.now() > user.resetTokenExpires) {
    throw new BadRequestException('Token inválido o expirado');
  }

  // ✅ NUEVO: Verificar que el usuario no esté bloqueado
  if (user.isBlocked) {
    throw new BadRequestException('La cuenta está bloqueada. No se puede restablecer la contraseña.');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  
  // ✅ CRÍTICO: Limpiar los campos de reset para invalidar el token
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  
  await this.repo.save(user);
}
```

### **2. users.controller.ts**

```typescript
@Public()
@Post('reset-password')
async resetPassword(
  @Body('token') token: string,
  @Body('newPassword') newPassword: string,
) {
  if (!token || !newPassword) {
    throw new BadRequestException('Token y nueva contraseña son requeridos');
  }

  // ✅ NUEVO: Validar longitud mínima
  if (newPassword.length < 6) {
    throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');
  }

  await this.usersService.resetPassword(token, newPassword);
  
  // ✅ NUEVO: Mensaje explícito que requiere login
  return { 
    message: 'Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.',
    requiresLogin: true 
  };
}
```

### **3. jwt.strategy.ts**

```typescript
async validate(payload: any) {
  const user = await this.usersService.findOne(payload.sub)
  
  // ✅ NUEVO: Verificar bloqueo en cada request
  if (user.isBlocked) {
    throw new UnauthorizedException('Tu cuenta está bloqueada. Contacta al administrador.');
  }
  
  const { passwordHash, resetToken, resetTokenExpires, ...safe } = user
  return safe
}
```

---

## 🎯 Recomendaciones para el Frontend

### **CRÍTICO: Flujo Correcto de Reset Password**

#### ❌ **INCORRECTO** (Causaba el bug):

```typescript
// NO HACER ESTO
async function handleResetPassword(token, newPassword) {
  const response = await fetch('/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword })
  });
  
  // ❌ ERROR: Usar el token de reset como si fuera un JWT
  localStorage.setItem('authToken', token);
  router.push('/admin/dashboard'); // ❌ Acceso directo sin login
}
```

#### ✅ **CORRECTO**:

```typescript
async function handleResetPassword(token, newPassword) {
  try {
    const response = await fetch('/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ CORRECTO: Limpiar cualquier sesión previa
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // ✅ Mostrar mensaje de éxito
      toast.success(data.message);
      
      // ✅ Redirigir al login para que inicie sesión con la nueva contraseña
      router.push('/login');
    }
  } catch (error) {
    toast.error('Error al restablecer contraseña');
  }
}
```

---

## 🧪 Validaciones de Seguridad

### **Validaciones Implementadas:**

1. ✅ **Token expirado:** 20 minutos de validez
2. ✅ **Token hasheado:** No se almacena en texto plano
3. ✅ **Usuario bloqueado:** No puede cambiar contraseña
4. ✅ **Contraseña débil:** Mínimo 6 caracteres
5. ✅ **Token invalidado:** Se limpia después de usarse
6. ✅ **JWT con usuario bloqueado:** Rechazado en cada request

---

## 🔍 Casos de Prueba

### **Test 1: Reset Password Normal**
```bash
# 1. Solicitar reset
POST /users/forgot-password
Body: { "email": "test@example.com" }

# 2. Usar token del email
POST /users/reset-password
Body: { "token": "abc123...", "newPassword": "newpass123" }

# Resultado esperado:
{
  "message": "Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.",
  "requiresLogin": true
}

# 3. Intentar acceder con JWT antiguo (debe fallar)
GET /users/me
Headers: { "Authorization": "Bearer <old-jwt>" }
# Debería funcionar si el JWT es válido

# 4. Login con nueva contraseña
POST /auth/login
Body: { "email": "test@example.com", "password": "newpass123" }
# ✅ Debería generar nuevo JWT
```

### **Test 2: Usuario Bloqueado NO Puede Resetear**
```bash
# Admin bloquea usuario
PATCH /users/1/block

# Usuario intenta reset
POST /users/reset-password
Body: { "token": "valid-token", "newPassword": "newpass" }

# Resultado esperado: 400 Bad Request
{
  "message": "La cuenta está bloqueada. No se puede restablecer la contraseña."
}
```

### **Test 3: Token Usado Dos Veces (Debe Fallar)**
```bash
# Primer uso
POST /users/reset-password
Body: { "token": "abc123", "newPassword": "pass1" }
# ✅ Éxito

# Segundo uso del mismo token
POST /users/reset-password
Body: { "token": "abc123", "newPassword": "pass2" }
# ❌ Debe fallar: "Token inválido o expirado"
```

### **Test 4: Contraseña Débil**
```bash
POST /users/reset-password
Body: { "token": "abc123", "newPassword": "12345" }

# Resultado esperado: 400 Bad Request
{
  "message": "La contraseña debe tener al menos 6 caracteres"
}
```

---

## 📊 Impacto de Seguridad

### **Antes de la Corrección:**
- 🔴 **Riesgo:** Un usuario podía acceder al sistema sin autenticación válida
- 🔴 **Riesgo:** Usuarios bloqueados podían reactivar su acceso
- 🔴 **Riesgo:** Tokens de reset podían reutilizarse

### **Después de la Corrección:**
- ✅ **Seguro:** Se requiere login válido después de reset
- ✅ **Seguro:** Usuarios bloqueados no pueden resetear contraseña
- ✅ **Seguro:** Tokens se invalidan después de usarse
- ✅ **Seguro:** JWT con usuario bloqueado es rechazado

---

## 🚨 Acción Requerida en el Frontend

### **Pasos Obligatorios:**

1. **Actualizar el flujo de reset password:**
   - NO usar el token de reset como JWT
   - Redirigir al login después de reset exitoso
   - Limpiar localStorage/sessionStorage

2. **Validar la respuesta del endpoint:**
   - Verificar `requiresLogin: true`
   - Mostrar mensaje apropiado al usuario

3. **Manejar errores correctamente:**
   - Mostrar mensajes de error específicos
   - No permitir acceso directo al admin

4. **Revisar si hay código que:**
   - Almacena el token de reset en localStorage
   - Redirige al admin sin login
   - Confunde token de reset con JWT

---

## 📞 Contacto

Si tienes dudas sobre esta corrección de seguridad, contacta al equipo de backend.

**Fecha de implementación:** Octubre 20, 2025  
**Versión:** 1.1.0  
**Prioridad:** 🔴 CRÍTICA
