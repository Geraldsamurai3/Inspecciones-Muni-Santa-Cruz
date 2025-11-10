# API Endpoints - Referencia Completa

## Índice
1. [Configuración General](#configuración-general)
2. [Autenticación](#autenticación)
3. [Usuarios](#usuarios)
4. [Inspecciones](#inspecciones)
5. [Dashboard](#dashboard)
6. [Estadísticas](#estadísticas)
7. [Reportes](#reportes)
8. [Cloudinary](#cloudinary)
9. [Email](#email)

---

## Configuración General

### Base URL

**Desarrollo:**
```
http://localhost:3000
```

**Producción:**
```
https://inspecciones-muni-santa-cruz-production.up.railway.app
```

### Autenticación

Todas las rutas están protegidas por defecto con JWT, excepto las marcadas con `@Public()`.

**Header requerido:**
```http
Authorization: Bearer <token>
```

### CORS

Frontend permitido:
```
http://localhost:5174 (desarrollo)
https://inspecciones-front-santa-cruz.vercel.app (producción)
```

### Validación Global

Todos los endpoints validan automáticamente con:
- `ValidationPipe` (class-validator)
- `whitelist: true` (elimina campos no definidos)
- `forbidNonWhitelisted: true` (rechaza campos desconocidos)

### Respuestas de Error

```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["email must be an email", "password is required"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Tu cuenta está bloqueada",
  "error": "Forbidden"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Inspection with ID 123 not found",
  "error": "Not Found"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Autenticación

### POST /auth/register

Registrar nuevo usuario.

**Acceso:** `@Public()` (sin autenticación)

**Request Body:**
```json
{
  "email": "inspector@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "secondLastName": "González",
  "cedula": "1-2345-6789",
  "phone": "8888-8888",
  "role": "inspector"
}
```

**Validaciones:**
- `email`: válido, único
- `password`: mínimo 6 caracteres
- `firstName`, `lastName`: requeridos, máximo 100 caracteres
- `cedula`: requerido, único, máximo 20 caracteres
- `role`: "admin" | "inspector"

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "secondLastName": "González",
  "cedula": "1-2345-6789",
  "phone": "8888-8888",
  "role": "inspector",
  "isBlocked": false,
  "createdAt": "2025-01-10T10:00:00.000Z"
}
```

**Notas:**
- Envía email de bienvenida automáticamente
- Contraseña hasheada con bcrypt (factor 10)
- `passwordHash` no se devuelve

---

### POST /auth/login

Iniciar sesión.

**Acceso:** `@Public()`

**Request Body:**
```json
{
  "email": "inspector@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Payload:**
```json
{
  "sub": 1,
  "role": "inspector",
  "iat": 1704888000,
  "exp": 1704891600
}
```

**Validaciones:**
- Email debe existir
- Contraseña correcta
- Usuario no bloqueado (`isBlocked === false`)

**Errores:**
- `401`: Credenciales inválidas
- `403`: Cuenta bloqueada

---

## Usuarios

### GET /users

Obtener todos los usuarios.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "Principal",
    "cedula": "1-1111-1111",
    "role": "admin",
    "isBlocked": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "email": "inspector@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "cedula": "1-2345-6789",
    "role": "inspector",
    "isBlocked": false,
    "createdAt": "2025-01-10T10:00:00.000Z"
  }
]
```

---

### GET /users/me

Obtener perfil del usuario autenticado.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "secondLastName": "González",
  "cedula": "1-2345-6789",
  "phone": "8888-8888",
  "role": "inspector",
  "isBlocked": false,
  "createdAt": "2025-01-10T10:00:00.000Z"
}
```

**Nota:** Extrae datos del JWT token, no hace query a BD

---

### GET /users/:id

Obtener usuario por ID.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "id": 2,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "cedula": "1-2345-6789",
  "role": "inspector",
  "isBlocked": false,
  "createdAt": "2025-01-10T10:00:00.000Z"
}
```

**Errores:**
- `404`: Usuario no encontrado

---

### POST /users

Crear nuevo usuario (sin email de bienvenida).

**Acceso:** Requiere JWT

**Request Body:** Igual que `/auth/register`

**Response (201 Created):** Usuario creado

---

### PATCH /users/:id

Actualizar usuario.

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "firstName": "Juan Carlos",
  "phone": "8888-9999",
  "password": "newpassword123"
}
```

**Campos Opcionales:**
- `firstName`, `lastName`, `secondLastName`
- `phone`
- `password` (se hashea automáticamente)
- `role`

**Response (200 OK):** Usuario actualizado

---

### DELETE /users/:id

Eliminar usuario.

**Acceso:** Requiere JWT

**Response (200 OK):** Usuario eliminado

---

### POST /users/forgot-password

Solicitar restablecimiento de contraseña.

**Acceso:** `@Public()`

**Request Body:**
```json
{
  "email": "inspector@example.com"
}
```

**Response (201 Created):**
```json
{
  "message": "Email de restablecimiento enviado"
}
```

**Proceso:**
1. Genera token aleatorio (32 bytes hex)
2. Hashea con SHA-256 y guarda en BD
3. Envía email con link: `{FRONTEND_URL}/admin/reset-password?token={rawToken}`
4. Token expira en 20 minutos

**Validaciones:**
- Email debe existir
- Usuario no bloqueado

**Errores:**
- `400`: Email no registrado
- `400`: Cuenta bloqueada
- `400`: Error enviando email (timeout SMTP)

---

### POST /users/reset-password

Restablecer contraseña con token.

**Acceso:** `@Public()`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "newpassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.",
  "requiresLogin": true
}
```

**Validaciones:**
- Token válido (SHA-256 match en BD)
- Token no expirado (<20 minutos)
- Nueva contraseña mínimo 6 caracteres
- Usuario no bloqueado

**Errores:**
- `400`: Token inválido o expirado
- `400`: Cuenta bloqueada

**Nota:** Limpia `resetToken` y `resetTokenExpires` después de usar

---

### PATCH /users/:id/block

Bloquear/desbloquear usuario (toggle).

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "id": 2,
  "isBlocked": true,
  "message": "Usuario bloqueado"
}
```

**Nota:** Alterna entre `isBlocked: true/false`

---

## Inspecciones

### POST /inspections

Crear inspección.

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "procedureNumber": "2025-001",
  "inspectionDate": "2025-01-10",
  "applicantType": "Persona Física",
  "inspectorIds": [1, 2],
  
  "individualRequest": {
    "physicalId": "1-2345-6789",
    "firstName": "Carlos",
    "lastName1": "Rodríguez",
    "lastName2": "Mora",
    "phone": "8888-8888",
    "email": "carlos@example.com"
  },
  
  "construction": {
    "landUseType": "Residencial",
    "matchesLocation": true,
    "recommended": true,
    "observations": "Construcción cumple con normativas",
    "propertyNumber": "F-12345",
    "photos": []
  },
  
  "location": {
    "district": "Santa Cruz",
    "exactAddress": "50m norte de la iglesia",
    "latitude": 10.2644,
    "longitude": -85.5853
  },
  
  "landUse": {
    "observations": "Uso de suelo aprobado"
  },
  
  "antiquity": {
    "observations": "Construcción con más de 10 años"
  }
}
```

**Campos Requeridos:**
- `procedureNumber`
- `inspectionDate` (YYYY-MM-DD)
- `applicantType`: "Anonimo" | "Persona Física" | "Persona Jurídica"
- `inspectorIds`: Array de IDs de usuarios

**Campos Opcionales (según tipo):**
- `individualRequest` (si applicantType = "Persona Física")
- `legalEntityRequest` (si applicantType = "Persona Jurídica")
- Subdependencias: `construction`, `location`, `landUse`, `antiquity`, etc.

**Response (201 Created):**
```json
{
  "id": 1,
  "procedureNumber": "2025-001",
  "inspectionDate": "2025-01-10",
  "applicantType": "Persona Física",
  "status": "Nuevo",
  "reviewedAt": null,
  "deletedAt": null,
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z",
  "inspectors": [
    {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "inspector"
    }
  ],
  "individualRequest": {
    "id": 1,
    "physicalId": "1-2345-6789",
    "firstName": "Carlos",
    "lastName1": "Rodríguez"
  },
  "construction": {
    "id": 1,
    "landUseType": "Residencial",
    "matchesLocation": true,
    "recommended": true
  }
  // ... otras subdependencias
}
```

**Nota:** 
- Estado inicial siempre es "Nuevo"
- Cascade guarda todas las subdependencias automáticamente
- `inspectorIds` se resuelven a entidades User
- Datos sensibles de inspectores se sanitizan (sin passwordHash, resetToken, etc.)

---

### GET /inspections

Obtener todas las inspecciones (excepto papelera).

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "procedureNumber": "2025-001",
    "inspectionDate": "2025-01-10",
    "applicantType": "Persona Física",
    "status": "Nuevo",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "inspectors": [
      {
        "id": 1,
        "firstName": "Juan",
        "lastName": "Pérez"
      }
    ],
    "individualRequest": { "id": 1, "firstName": "Carlos" },
    "construction": { "id": 1, "landUseType": "Residencial" }
  }
]
```

**Query:** `WHERE deletedAt IS NULL`

---

### GET /inspections/trash/list

Obtener inspecciones en papelera.

**Acceso:** Requiere JWT

**Response (200 OK):** Array de inspecciones con `status: "Papelera"`

---

### GET /inspections/:id

Obtener inspección por ID.

**Acceso:** Requiere JWT

**Response (200 OK):** Inspección completa con todas las relaciones

**Errores:**
- `404`: Inspección no encontrada

---

### PUT /inspections/:id

Actualizar inspección completa (reemplaza todos los campos).

**Acceso:** Requiere JWT

**Request Body:** Misma estructura que POST

**Response (200 OK):** Inspección actualizada

**Notas:**
- Bloquea cambio directo a estado "Archivado" (solo via CRON)
- Bloquea cambio directo a estado "Papelera" (usar endpoint específico)
- Si cambia a "Revisado", marca `reviewedAt`
- Si sale de "Revisado", limpia `reviewedAt`

---

### PATCH /inspections/:id

Actualizar inspección parcialmente.

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "status": "En proceso",
  "construction": {
    "observations": "Actualización de observaciones"
  }
}
```

**Response (200 OK):** Inspección actualizada

---

### PATCH /inspections/:id/status

Actualizar solo el estado.

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "status": "Revisado"
}
```

**Estados Válidos:**
- "Nuevo"
- "En proceso"
- "Revisado"
- "Archivado" (solo CRON automático)
- "Papelera" (usar endpoint específico)

**Response (200 OK):**
```json
{
  "id": 1,
  "status": "Revisado",
  "reviewedAt": "2025-01-10T15:00:00.000Z"
}
```

---

### PATCH /inspections/:id/trash

Mover inspección a papelera (soft delete).

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "message": "Inspección movida a la papelera",
  "id": 1,
  "deletedAt": "2025-01-10T16:00:00.000Z"
}
```

**Cambios:**
- `status` → "Papelera"
- `deletedAt` → timestamp actual

---

### PATCH /inspections/:id/restore

Restaurar inspección desde papelera.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "message": "Inspección restaurada desde la papelera",
  "id": 1,
  "status": "Nuevo"
}
```

**Cambios:**
- `status` → "Nuevo"
- `deletedAt` → null

**Errores:**
- `400`: Inspección no está en papelera

---

### DELETE /inspections/:id

Eliminar inspección permanentemente.

**Acceso:** Requiere JWT

**⚠️ ADVERTENCIA:** Elimina físicamente de la BD (no recomendado)

**Recomendación:** Usar `PATCH /inspections/:id/trash` en su lugar

---

### POST /inspections/:id/photos

Subir fotos a subdependencia específica.

**Acceso:** Requiere JWT

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Array de archivos (File[])

**Query Parameter:**
- `section`: Sección de fotos
  - "antiguedadPhotos"
  - "pcCancellationPhotos"
  - "generalInspectionPhotos"
  - "workReceiptPhotos"
  - "mayorOfficePhotos"
  - "constructionPhotos"
  - "concessionPhotos"

**Response (201 Created):**
```json
{
  "message": "Uploaded 3 photos, 0 failed",
  "urls": [
    "https://res.cloudinary.com/da84etlav/image/upload/v123/file1.jpg",
    "https://res.cloudinary.com/da84etlav/image/upload/v123/file2.jpg",
    "https://res.cloudinary.com/da84etlav/image/upload/v123/file3.jpg"
  ],
  "created": true
}
```

**Proceso:**
1. Sube archivos a Cloudinary
2. Obtiene URLs
3. Actualiza campo `photos` de la subdependencia
4. Agrega nuevas URLs (no reemplaza)

**Errores:**
- `400`: No se proporcionaron archivos
- `404`: Inspección no encontrada
- `400`: Sección desconocida

---

## Dashboard

### GET /dashboard/inspector

Dashboard personalizado para inspectores.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "inspector": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "role": "inspector"
  },
  "resumen": {
    "totalInspecciones": 45,
    "tareasPendientes": 12,
    "completadasEsteMes": 8,
    "inspeccionesEsteMes": 10,
    "inspeccionesEstaSemana": 3
  },
  "estadisticasPorEstado": {
    "nueva": 5,
    "enProgreso": 7,
    "revisada": 30,
    "archivada": 3
  },
  "tareasPendientes": [
    {
      "id": 1,
      "procedureNumber": "2025-001",
      "inspectionDate": "2025-01-10",
      "status": "Nuevo",
      "applicantType": "Persona Física",
      "createdAt": "2025-01-10T10:00:00.000Z"
    }
  ],
  "ultimasInspecciones": [
    // ... 10 inspecciones más recientes
  ]
}
```

**Nota:** Filtra solo inspecciones donde el usuario autenticado es inspector

---

### GET /dashboard/admin

Dashboard administrativo completo.

**Acceso:** Requiere JWT (rol admin recomendado)

**Response (200 OK):**
```json
{
  "miDashboard": {
    // Dashboard personal del admin (igual que /dashboard/inspector)
  },
  "vistaAdministrativa": {
    "estadisticasGenerales": {
      "totalInspecciones": 150,
      "totalInspectores": 8,
      "nueva": 20,
      "enProgreso": 35,
      "revisada": 80,
      "archivada": 15
    },
    "kpis": {
      "totalInspeccionesActivas": 55,
      "totalInspeccionesRevisadas": 80,
      "totalInspeccionesArchivadas": 15,
      "promedioInspeccionesPorInspector": 19,
      "inspeccionesEsteMes": 25,
      "tasaCompletitud": 53
    },
    "estadisticasPorTipo": {
      "anonimo": 10,
      "personaFisica": 90,
      "personaJuridica": 50
    },
    "rendimientoPorInspector": [
      {
        "inspector": {
          "id": 1,
          "nombre": "Juan Pérez",
          "email": "juan@example.com",
          "role": "inspector"
        },
        "totalInspecciones": 45,
        "completadas": 30,
        "pendientes": 15,
        "esteMes": 10
      }
    ],
    "inspeccionesRecientes": [
      // ... 10 inspecciones más recientes del sistema
    ]
  }
}
```

---

### GET /dashboard/stats/period

Estadísticas de un período específico.

**Acceso:** Requiere JWT

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD

**Response (200 OK):**
```json
{
  "periodo": {
    "inicio": "2025-01-01T00:00:00.000Z",
    "fin": "2025-01-31T23:59:59.000Z"
  },
  "total": 25,
  "porEstado": {
    "nueva": 5,
    "enProgreso": 8,
    "revisada": 10,
    "archivada": 2
  },
  "porTipo": {
    "anonimo": 2,
    "personaFisica": 15,
    "personaJuridica": 8
  }
}
```

---

### GET /dashboard/dependencies

Estadísticas por dependencia.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "totalInspecciones": 150,
  "dependencias": {
    "construccion": {
      "total": 120,
      "porcentaje": 80,
      "subdependencias": {
        "usoSuelo": {
          "total": 100,
          "porcentaje": 67
        },
        "antiguedad": {
          "total": 80,
          "porcentaje": 53
        },
        "anulacionPC": {
          "total": 20,
          "porcentaje": 13
        },
        "inspeccionGeneral": {
          "total": 110,
          "porcentaje": 73
        },
        "recibidoObra": {
          "total": 60,
          "porcentaje": 40
        }
      }
    },
    "tramiteFiscal": {
      "total": 50,
      "porcentaje": 33
    },
    "alcaldia": {
      "total": 30,
      "porcentaje": 20
    },
    "concesionZMT": {
      "total": 15,
      "porcentaje": 10
    },
    "cobranza": {
      "total": 25,
      "porcentaje": 17
    },
    "patenteRenta": {
      "total": 20,
      "porcentaje": 13
    },
    "cierreObra": {
      "total": 18,
      "porcentaje": 12
    },
    "plataformaServicio": {
      "total": 12,
      "porcentaje": 8
    }
  }
}
```

**Nota:** Una inspección puede tener múltiples dependencias, por eso los porcentajes no suman 100%

---

### GET /dashboard/dependencies/flat

Estadísticas de dependencias en formato plano (ideal para gráficos).

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
[
  {
    "nombre": "Construcción",
    "icono": "🏗️",
    "total": 120,
    "porcentaje": 80
  },
  {
    "nombre": "Uso de Suelo",
    "icono": "📐",
    "total": 100,
    "porcentaje": 67,
    "esSubdependencia": true,
    "padre": "Construcción"
  },
  {
    "nombre": "Antigüedad",
    "icono": "⏰",
    "total": 80,
    "porcentaje": 53,
    "esSubdependencia": true,
    "padre": "Construcción"
  }
  // ... etc
]
```

---

## Estadísticas

### GET /stats/inspections

Estadísticas generales de inspecciones.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "total": 150,
  "byStatus": {
    "nuevo": 20,
    "enProceso": 35,
    "revisado": 80,
    "archivado": 15
  },
  "byMonth": [
    {
      "month": "2025-01",
      "count": 25
    },
    {
      "month": "2024-12",
      "count": 30
    }
  ],
  "recent": 15
}
```

**Nota:** `recent` = últimos 7 días

---

### GET /stats/inspectors

Estadísticas por inspector.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
[
  {
    "inspectorId": 1,
    "inspectorName": "Juan Pérez",
    "totalInspections": 45,
    "byStatus": {
      "nuevo": 5,
      "enProceso": 10,
      "revisado": 25,
      "archivado": 5
    },
    "thisMonth": 8,
    "avgPerMonth": 7.5
  }
]
```

---

### GET /stats/detailed

Estadísticas detalladas del sistema.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "overview": {
    "totalInspections": 150,
    "activeInspectors": 8,
    "completionRate": 63.33
  },
  "byInspector": [
    // ... array de estadísticas por inspector
  ],
  "trends": {
    "thisMonth": 25,
    "lastMonth": 30,
    "growth": -16.67
  }
}
```

---

### GET /stats/dashboard

Estadísticas para dashboard principal.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
{
  "inspections": {
    "total": 150,
    "byStatus": { /* ... */ },
    "byMonth": [ /* ... */ ],
    "recent": 15
  },
  "trends": {
    "thisMonth": 25,
    "lastMonth": 30,
    "percentageChange": -16.67
  }
}
```

---

### GET /stats/dependencies

Estadísticas por dependencia con filtros de período.

**Acceso:** Requiere JWT

**Query Parameters:**
- `period`: "7days" | "1week" | "15days" | "1month" | "custom"
- `startDate`: YYYY-MM-DD (si period="custom")
- `endDate`: YYYY-MM-DD (si period="custom")

**Response (200 OK):**
```json
{
  "period": "Últimos 7 días",
  "startDate": "2025-01-03",
  "endDate": "2025-01-10",
  "total": 25,
  "byDependency": [
    {
      "dependency": "Construcción",
      "total": 20,
      "byStatus": {
        "nuevo": 5,
        "enProceso": 8,
        "revisado": 6,
        "archivado": 1
      },
      "percentage": 80.0
    },
    {
      "dependency": "Alcaldía",
      "total": 10,
      "byStatus": { /* ... */ },
      "percentage": 40.0
    }
  ]
}
```

---

### GET /stats/inspector-performance

Rendimiento de inspectores por período.

**Acceso:** Requiere JWT

**Query Parameters:**
- `period`: "7days" | "1week" | "15days" | "1month" | "custom"
- `startDate`: YYYY-MM-DD (si period="custom")
- `endDate`: YYYY-MM-DD (si period="custom")

**Response (200 OK):**
```json
{
  "period": "Último mes",
  "startDate": "2024-12-10",
  "endDate": "2025-01-10",
  "inspectors": [
    {
      "inspectorId": 1,
      "inspectorName": "Juan Pérez",
      "totalInspections": 15,
      "byStatus": {
        "nuevo": 2,
        "enProceso": 5,
        "revisado": 7,
        "archivado": 1
      },
      "byDependency": [
        {
          "dependency": "Construcción",
          "count": 12
        },
        {
          "dependency": "Alcaldía",
          "count": 5
        }
      ],
      "completionRate": 53.33,
      "thisMonth": 8,
      "avgPerMonth": 7.5
    }
  ]
}
```

---

## Reportes

### GET /reports/procedure/:procedureNumber

Buscar todas las inspecciones por número de trámite.

**Acceso:** Requiere JWT

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "procedureNumber": "2025-001",
    "inspectionDate": "2025-01-10",
    "status": "Revisado",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "inspectors": [
      {
        "id": 1,
        "firstName": "Juan",
        "lastName": "Pérez",
        "role": "inspector"
      }
    ]
    // ... relaciones completas
  },
  {
    "id": 5,
    "procedureNumber": "2025-001",
    "inspectionDate": "2025-01-15",
    "status": "Nuevo",
    "createdAt": "2025-01-15T14:00:00.000Z"
    // ... segunda inspección con mismo número
  }
]
```

**Nota:** Ordenado por `createdAt DESC`

---

### GET /reports/id/:id

Buscar inspección específica por ID.

**Acceso:** Requiere JWT

**Response (200 OK):** Inspección completa

**Errores:**
- `404`: Inspección no encontrada

---

### GET /reports/csv/:procedureNumber

Generar reporte CSV de inspección.

**Acceso:** Requiere JWT

**Response (200 OK):**
```csv
ID,Número de Trámite,Fecha de Inspección,Estado,Tipo de Solicitante,Inspectores,Solicitante Nombre,...
1,2025-001,2025-01-10,Revisado,Persona Física,"Juan Pérez, María López","Carlos Rodríguez Mora",...
```

**Headers:**
```http
Content-Type: text/csv
Content-Disposition: attachment; filename="inspection-2025-001.csv"
```

**Campos Incluidos:**
- ID, Número de Trámite, Fecha
- Estado, Tipo de Solicitante
- Inspectores (nombres concatenados)
- Solicitante (nombre completo, cédula)
- Empresa (nombre, cédula jurídica)
- Construcción (tipo, ubicación, recomendado)
- Subdependencias (uso suelo, antigüedad, etc.)
- Ubicación (distrito, dirección)
- Otras dependencias (trámite fiscal, alcaldía, etc.)
- Fechas (creación, actualización, revisión)
- Observaciones

---

### GET /reports/pdf/:procedureNumber

Generar reporte PDF oficial de inspección (formato de 3 páginas).

**Acceso:** Requiere JWT

**Response (200 OK):** Buffer PDF

**Headers:**
```http
Content-Type: application/pdf
Content-Disposition: inline; filename="inspection-2025-001.pdf"
```

**Formato del PDF:**

**Página 1:**
- Logo de la municipalidad
- Título "REPORTE DE INSPECCIÓN"
- Información general:
  - Número de trámite
  - Fecha de inspección
  - Estado
  - Tipo de solicitante
  - Inspectores
- Datos del solicitante (persona física o jurídica)

**Página 2:**
- Dependencia: Construcción
  - Tipo de uso de suelo
  - Coincide con ubicación
  - Recomendado
  - Observaciones
  - Fotos (si existen, descargadas de Cloudinary)
- Subdependencias:
  - Uso de Suelo
  - Antigüedad
  - Anulación PC
  - Inspección General
  - Recibido de Obra

**Página 3:**
- Otras dependencias:
  - Ubicación (distrito, dirección, coordenadas)
  - Trámite Fiscal
  - Alcaldía
  - Concesión ZMT (con parcelas)
  - Cobranza
  - Patente de Renta
  - Cierre de Obra
  - Plataforma y Servicios
- Observaciones generales
- Firmas (si existen en Cloudinary)

**Proceso:**
1. Query inspección con todas las relaciones
2. Descarga imágenes de Cloudinary
3. Genera PDF con pdfkit
4. Formatea en 3 páginas
5. Devuelve buffer

**Errores:**
- `404`: Inspección no encontrada
- `500`: Error generando PDF (timeout descarga Cloudinary)

---

### GET /reports/pdf/id/:id

Generar PDF por ID específico de inspección.

**Acceso:** Requiere JWT

**Response (200 OK):** Buffer PDF (mismo formato que `/reports/pdf/:procedureNumber`)

---

## Cloudinary

### POST /cloudinary/upload

Subir imagen a Cloudinary.

**Acceso:** Requiere JWT

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Archivo de imagen (File)

**Query Parameters:**
- `folder`: Carpeta de destino (opcional, default: raíz)

**Ejemplo:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/cloudinary/upload?folder=inspections/signatures', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response (201 Created):**
```json
{
  "public_id": "inspections/signatures/abc123",
  "secure_url": "https://res.cloudinary.com/da84etlav/image/upload/v1704888000/inspections/signatures/abc123.jpg",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "bytes": 245678,
  "created_at": "2025-01-10T10:00:00Z"
}
```

**Formatos Soportados:**
- JPG, PNG, GIF, WebP, TIFF, BMP
- Tamaño máximo: configurado en Cloudinary (default 10MB)

**Nota:** Usa `FileInterceptor('file')` de Multer con almacenamiento en memoria

---

### DELETE /cloudinary/destroy

Eliminar imagen de Cloudinary.

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "publicId": "inspections/signatures/abc123"
}
```

**Response (200 OK):**
```json
{
  "result": "ok"
}
```

**Errores:**
- `400`: publicId no proporcionado
- `500`: Error eliminando de Cloudinary

---

## Email

### POST /email/welcome

Enviar email de bienvenida (manual).

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "to": "user@example.com",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response (201 Created):**
```json
{
  "messageId": "<abc123@example.com>"
}
```

**Plantilla:** `welcome.hbs`

**Nota:** Se envía automáticamente en `/auth/register`

---

### POST /email/reset-password

Enviar email de restablecimiento (manual).

**Acceso:** Requiere JWT

**Request Body:**
```json
{
  "to": "user@example.com",
  "token": "a1b2c3d4e5f6...",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response (201 Created):**
```json
{
  "messageId": "<def456@example.com>"
}
```

**Plantilla:** `reset-password.hbs`

**Contenido:**
- Link de reset: `{FRONTEND_URL}/admin/reset-password?token={token}`
- Expiración: 20 minutos
- Nombre del usuario
- Instrucciones

**Nota:** Se envía automáticamente en `/users/forgot-password`

---

## Tareas Automáticas (CRON)

### Archivado Automático de Inspecciones

**Schedule:** Cada 5 horas (0 0 */5 * * *)

**Zona Horaria:** America/Costa_Rica

**Proceso:**
1. Busca inspecciones con:
   - `status = "Revisado"`
   - `reviewedAt < (now - 7 días)`
2. Cambia `status` a "Archivado"
3. Log: "✅ Cron completado. X inspecciones archivadas."

**Implementación:**
```typescript
@Cron('0 0 */5 * * *', { timeZone: 'America/Costa_Rica' })
async archiveReviewedOlderThan7Days() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const result = await this.inspectionRepo.update(
    { status: InspectionStatus.REVIEWED, reviewedAt: LessThan(cutoff) },
    { status: InspectionStatus.ARCHIVED },
  );

  console.log(`✅ ${result.affected || 0} inspecciones archivadas.`);
}
```

---

## Códigos de Estado HTTP

### Éxito (2xx)

- **200 OK**: Operación exitosa (GET, PUT, PATCH, DELETE)
- **201 Created**: Recurso creado (POST)
- **204 No Content**: Operación exitosa sin cuerpo de respuesta

### Redirección (3xx)

- **304 Not Modified**: Recurso no modificado (cache)

### Error del Cliente (4xx)

- **400 Bad Request**: Datos inválidos o faltantes
- **401 Unauthorized**: Sin token JWT o token inválido
- **403 Forbidden**: Usuario bloqueado o sin permisos
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: email duplicado)
- **422 Unprocessable Entity**: Validación fallida

### Error del Servidor (5xx)

- **500 Internal Server Error**: Error inesperado
- **503 Service Unavailable**: Servicio temporalmente no disponible

---

## Rate Limiting

**⏳ No implementado actualmente**

**Recomendación para producción:**
```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,      // 60 segundos
  limit: 100,   // 100 requests por ventana
})
```

---

## Versionado de API

**Versión Actual:** v1 (implícita, sin prefijo)

**URL Base:** `/` (sin versionado)

**Futura Implementación:**
```typescript
app.setGlobalPrefix('api/v1');
```

**URLs futuras:**
- `http://localhost:3000/api/v1/auth/login`
- `http://localhost:3000/api/v1/inspections`

---

## WebSockets

**⏳ No implementado**

**Casos de uso futuro:**
- Notificaciones en tiempo real
- Actualización de dashboards en vivo
- Chat entre inspectores

---

## Documentación Interactiva (Swagger)

**⏳ No implementado**

**Implementación Recomendada:**
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('API Inspecciones Santa Cruz')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

**URL:** `http://localhost:3000/api`

---

**Próximo Documento:** [05-AUTENTICACION-SEGURIDAD.md](./05-AUTENTICACION-SEGURIDAD.md)
