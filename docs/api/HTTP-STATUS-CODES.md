# 📊 HTTP Status Codes Reference

Referencia completa de códigos de estado HTTP usados en el API

---

## ✅ 2xx Success

### 200 OK
**Descripción:** La petición fue exitosa

**Usado en:**
- GET /auth/me
- GET /users
- GET /users/:id
- GET /inspections
- GET /inspections/:id
- GET /dashboard/inspector
- GET /dashboard/admin
- GET /dashboard/stats/period
- GET /stats/*
- PATCH /users/:id
- PATCH /users/:id/block
- PATCH /users/:id/unblock
- PATCH /inspections/:id
- DELETE /inspections/:id
- DELETE /cloudinary/delete/:publicId
- POST /auth/login
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /cloudinary/upload

**Ejemplo:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

---

### 201 Created
**Descripción:** Recurso creado exitosamente

**Usado en:**
- POST /auth/register
- POST /inspections

**Ejemplo:**
```json
{
  "id": 1,
  "email": "nuevo@example.com",
  "firstName": "María",
  "createdAt": "2025-10-06T10:00:00.000Z"
}
```

---

## ❌ 4xx Client Errors

### 400 Bad Request
**Descripción:** La petición contiene datos inválidos o mal formateados

**Causas comunes:**
- Email inválido
- Password muy corto
- JSON mal formateado
- Tipo de dato incorrecto
- Campo requerido faltante

**Ejemplo:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**Solución:**
- Validar datos en el frontend antes de enviar
- Verificar formato de email, fechas, etc.
- Asegurar que todos los campos requeridos estén presentes

---

### 401 Unauthorized
**Descripción:** No autenticado o token inválido

**Causas comunes:**
- Token ausente en header `Authorization`
- Token expirado
- Token inválido o corrupto
- Formato incorrecto del token

**Ejemplo:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Solución:**
- Incluir header: `Authorization: Bearer {token}`
- Verificar que el token sea válido
- Refrescar token si expiró
- Redirigir a login

**Código Frontend:**
```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  'Content-Type': 'application/json'
}
```

---

### 403 Forbidden
**Descripción:** Autenticado pero sin permisos suficientes

**Causas comunes:**
- Usuario inspector intentando acción de admin
- Usuario bloqueado
- Intentando acceder a recurso de otro usuario

**Ejemplo:**
```json
{
  "statusCode": 403,
  "message": "Solo administradores pueden realizar esta acción",
  "error": "Forbidden"
}
```

**Acciones que requieren rol admin:**
- GET /users (ver todos los usuarios)
- PATCH /users/:id/block
- PATCH /users/:id/unblock
- DELETE /inspections/:id
- GET /dashboard/admin

**Solución:**
- Verificar rol del usuario antes de mostrar opciones
- Ocultar botones/menús según permisos
- Mostrar mensaje informativo al usuario

---

### 404 Not Found
**Descripción:** Recurso no encontrado

**Causas comunes:**
- ID no existe en la base de datos
- Recurso fue eliminado
- URL incorrecta
- Typo en el endpoint

**Ejemplo:**
```json
{
  "statusCode": 404,
  "message": "Usuario no encontrado",
  "error": "Not Found"
}
```

**Recursos que pueden generar 404:**
- GET /users/:id (usuario no existe)
- GET /inspections/:id (inspección no existe)
- PATCH /users/:id (usuario no existe)
- PATCH /inspections/:id (inspección no existe)

**Solución:**
- Verificar que el ID sea válido antes de hacer peticiones
- Manejar el caso de recurso eliminado
- Mostrar página 404 amigable
- Proporcionar link para volver a la lista

---

### 422 Unprocessable Entity
**Descripción:** Validación de datos falló (más específico que 400)

**Causas comunes:**
- Campo con nombre incorrecto en el DTO
- Valor fuera de rango permitido
- Relación de datos inválida
- String muy largo o muy corto
- Enum con valor no permitido

**Ejemplo:**
```json
{
  "statusCode": 422,
  "message": [
    "legalName must be between 1 and 150 characters",
    "legalName is required"
  ],
  "error": "Unprocessable Entity"
}
```

**Casos específicos:**

**1. Legal Entity Request - Campo incorrecto:**
```typescript
// ❌ Error 422
{
  legalEntityRequest: {
    companyName: 'Mi Empresa' // Campo incorrecto
  }
}

// ✅ Correcto
{
  legalEntityRequest: {
    legalName: 'Mi Empresa' // Campo correcto
  }
}
```

**2. Individual Request - Campo faltante:**
```typescript
// ❌ Error 422
{
  individualRequest: {
    firstName: 'Juan',
    lastName: 'Pérez'
    // Falta 'phone' que es requerido
  }
}

// ✅ Correcto
{
  individualRequest: {
    firstName: 'Juan',
    lastName: 'Pérez',
    cedula: '1-1111-1111',
    phone: '2222-3333' // Requerido
  }
}
```

**3. Fecha inválida:**
```typescript
// ❌ Error 422
{
  inspectionDate: '2025/10/15' // Formato incorrecto
}

// ✅ Correcto
{
  inspectionDate: '2025-10-15' // Formato YYYY-MM-DD
}
```

**Solución:**
- Consultar **TYPESCRIPT-INTERFACES.md** para nombres correctos
- Validar formato de datos antes de enviar
- Usar esquemas de validación (Zod, Yup)
- Revisar logs de validación en el error

---

## ⚠️ 5xx Server Errors

### 500 Internal Server Error
**Descripción:** Error no manejado del servidor

**Causas comunes:**
- Error en la lógica del backend
- Problema con la base de datos
- Servicio externo no disponible (Cloudinary, email)
- Exception no capturada

**Ejemplo:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Solución:**
- Implementar retry con exponential backoff
- Reportar error al equipo de backend
- Mostrar mensaje genérico al usuario
- No exponer detalles técnicos

**Código de retry:**
```typescript
async function apiWithRetry(endpoint, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiClient(endpoint, options);
    } catch (error) {
      if (error.statusCode === 500 && i < maxRetries - 1) {
        // Esperar antes de reintentar
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

## 📊 Tabla Resumen

| Código | Nombre | Significado | Acción Recomendada |
|--------|--------|-------------|---------------------|
| **200** | OK | Éxito | Procesar respuesta |
| **201** | Created | Recurso creado | Mostrar confirmación |
| **400** | Bad Request | Datos inválidos | Validar y corregir datos |
| **401** | Unauthorized | No autenticado | Redirigir a login |
| **403** | Forbidden | Sin permisos | Ocultar opción/mostrar mensaje |
| **404** | Not Found | No encontrado | Mostrar página 404 |
| **422** | Unprocessable Entity | Validación falló | Revisar nombres de campos |
| **500** | Internal Server Error | Error del servidor | Reintentar/reportar |

---

## 🎯 Best Practices

### 1. Manejar todos los códigos
```typescript
switch (response.status) {
  case 200:
  case 201:
    // Éxito
    break;
  case 400:
  case 422:
    // Validación
    showValidationErrors(error.message);
    break;
  case 401:
    // No autenticado
    redirectToLogin();
    break;
  case 403:
    // Sin permisos
    showPermissionError();
    break;
  case 404:
    // No encontrado
    show404Page();
    break;
  case 500:
    // Error del servidor
    retryOrShowError();
    break;
  default:
    showGenericError();
}
```

### 2. Mostrar mensajes amigables
```typescript
const ERROR_MESSAGES = {
  400: 'Por favor verifica que todos los datos sean correctos',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  403: 'No tienes permisos para realizar esta acción',
  404: 'El recurso que buscas no existe',
  422: 'Algunos datos son inválidos. Revisa el formulario',
  500: 'Ocurrió un error. Por favor intenta más tarde',
};

function getUserFriendlyMessage(statusCode: number): string {
  return ERROR_MESSAGES[statusCode] || 'Ocurrió un error desconocido';
}
```

### 3. Logging apropiado
```typescript
function logError(error: any) {
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
  
  console[logLevel]('API Error:', {
    statusCode: error.statusCode,
    message: error.message,
    endpoint: error.path,
    timestamp: new Date().toISOString()
  });

  // Enviar a servicio de logging si es error 5xx
  if (error.statusCode >= 500) {
    sendToSentry(error);
  }
}
```

### 4. Feedback visual al usuario
```typescript
function handleApiError(error: any) {
  const { statusCode, message } = error;
  
  // Color según severidad
  const toastType = statusCode >= 500 ? 'error'
    : statusCode >= 400 ? 'warning'
    : 'info';
  
  showToast(getUserFriendlyMessage(statusCode), toastType);
}
```

---

## 🔍 Debugging

### Ver código de estado en DevTools
1. Abrir DevTools (F12)
2. Ir a pestaña **Network**
3. Hacer la petición
4. Ver columna **Status**
5. Click en la petición para ver detalles

### Headers importantes
```
Status Code: 401 Unauthorized
WWW-Authenticate: Bearer
Content-Type: application/json
```

### Response body típico
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "path": "/api/inspections"
}
```

---

Para más detalles sobre errores, consulta **ERROR-HANDLING.md**

Para endpoints completos, consulta **API-REFERENCE.md**
