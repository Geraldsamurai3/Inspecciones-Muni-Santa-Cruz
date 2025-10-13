# 📡 API Reference - Endpoints Completos

URL Base: `http://localhost:3000`

## 📑 Índice Rápido

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Inspecciones](#inspecciones)
- [Dashboard](#dashboard)
- [Estadísticas](#estadísticas)
- [Cloudinary](#cloudinary)

---

## 🔐 Autenticación

### POST /auth/register
Registrar nuevo usuario

**Request:**
```typescript
POST /auth/register
Content-Type: application/json

{
  "email": "inspector@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "secondLastName": "González", // opcional
  "cedula": "1-2345-6789",
  "phone": "2222-3333", // opcional
  "role": "inspector" // opcional, default: "inspector"
}
```

**Response 201:**
```typescript
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "cedula": "1-2345-6789",
  "role": "inspector",
  "createdAt": "2025-10-06T10:00:00.000Z"
}
```

---

### POST /auth/login
Iniciar sesión

**Request:**
```typescript
POST /auth/login
Content-Type: application/json

{
  "email": "inspector@example.com",
  "password": "password123"
}
```

**Response 200:**
```typescript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "inspector@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "inspector"
  }
}
```

---

### POST /auth/forgot-password
Solicitar reset de contraseña

**Request:**
```typescript
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "inspector@example.com"
}
```

**Response 200:**
```typescript
{
  "message": "Email de recuperación enviado"
}
```

---

### POST /auth/reset-password
Resetear contraseña con token

**Request:**
```typescript
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz789...",
  "newPassword": "newPassword123"
}
```

**Response 200:**
```typescript
{
  "message": "Contraseña actualizada correctamente"
}
```

---

## 👤 Usuarios

### GET /users
Obtener todos los usuarios (Solo Admin)

**Request:**
```typescript
GET /users
Authorization: Bearer {token}
```

**Response 200:**
```typescript
[
  {
    "id": 1,
    "email": "inspector@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "cedula": "1-2345-6789",
    "phone": "2222-3333",
    "role": "inspector",
    "isBlocked": false,
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
]
```

---

### GET /users/:id
Obtener usuario por ID

**Request:**
```typescript
GET /users/1
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "cedula": "1-2345-6789",
  "role": "inspector",
  "createdAt": "2025-10-01T10:00:00.000Z"
}
```

---

### GET /users/me
Obtener perfil del usuario actual

**Request:**
```typescript
GET /users/me
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "inspector"
}
```

---

### PATCH /users/:id
Actualizar usuario

**Request:**
```typescript
PATCH /users/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Juan Carlos",
  "phone": "2222-4444"
}
```

**Response 200:**
```typescript
{
  "id": 1,
  "email": "inspector@example.com",
  "firstName": "Juan Carlos",
  "phone": "2222-4444",
  "role": "inspector"
}
```

---

### PATCH /users/:id/block
Bloquear usuario (Solo Admin)

**Request:**
```typescript
PATCH /users/1/block
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "message": "Usuario bloqueado correctamente"
}
```

---

### PATCH /users/:id/unblock
Desbloquear usuario (Solo Admin)

**Request:**
```typescript
PATCH /users/1/unblock
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "message": "Usuario desbloqueado correctamente"
}
```

---

## 📋 Inspecciones

### GET /inspections
Obtener todas las inspecciones

**Request:**
```typescript
GET /inspections
Authorization: Bearer {token}
```

**Response 200:**
```typescript
[
  {
    "id": 1,
    "inspectionDate": "2025-10-15",
    "procedureNumber": "INS-2025-001",
    "applicantType": "Persona Física",
    "status": "Nuevo",
    "inspectors": [
      {
        "id": 1,
        "firstName": "Juan",
        "lastName": "Pérez"
      }
    ],
    "createdAt": "2025-10-06T10:00:00.000Z",
    "construction": {
      "id": 1,
      "description": "Construcción de vivienda"
    }
  }
]
```

---

### GET /inspections/:id
Obtener inspección por ID

**Request:**
```typescript
GET /inspections/1
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "id": 1,
  "inspectionDate": "2025-10-15",
  "procedureNumber": "INS-2025-001",
  "applicantType": "Persona Física",
  "status": "Nuevo",
  "inspectors": [...],
  "individualRequest": {
    "firstName": "Carlos",
    "lastName": "Ramírez",
    "cedula": "1-1111-1111",
    "phone": "8888-9999"
  },
  "construction": {...},
  "createdAt": "2025-10-06T10:00:00.000Z",
  "updatedAt": "2025-10-06T10:00:00.000Z"
}
```

---

### POST /inspections
Crear nueva inspección

**Request:**
```typescript
POST /inspections
Authorization: Bearer {token}
Content-Type: application/json

{
  "inspectionDate": "2025-10-20",
  "procedureNumber": "INS-2025-002",
  "applicantType": "Persona Física",
  "inspectorIds": [1, 2],
  "individualRequest": {
    "firstName": "María",
    "lastName": "González",
    "cedula": "2-2222-2222",
    "phone": "7777-8888",
    "address": "San José, Escazú"
  },
  "construction": {
    "propertyNumber": "12345",
    "district": "Escazú",
    "propertyArea": 500.50,
    "buildingArea": 200.00
  }
}
```

**Response 201:**
```typescript
{
  "id": 2,
  "inspectionDate": "2025-10-20",
  "procedureNumber": "INS-2025-002",
  "status": "Nuevo",
  "applicantType": "Persona Física",
  "inspectors": [...],
  "createdAt": "2025-10-06T11:00:00.000Z"
}
```

---

### PATCH /inspections/:id/status
Cambiar estado de inspección

**Request:**
```typescript
PATCH /inspections/1/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "En proceso"
}
```

**Response 200:**
```typescript
{
  "id": 1,
  "status": "En proceso",
  "updatedAt": "2025-10-06T12:00:00.000Z"
}
```

**Estados válidos:**
- `Nuevo`
- `En proceso`
- `Revisado`
- `Archivado`

---

### DELETE /inspections/:id
Eliminar inspección (Solo Admin)

**Request:**
```typescript
DELETE /inspections/1
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "message": "Inspección eliminada correctamente"
}
```

---

## 📊 Dashboard

### GET /dashboard/inspector
Dashboard para inspectores

**Request:**
```typescript
GET /dashboard/inspector
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "inspector": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "role": "inspector"
  },
  "resumen": {
    "totalInspecciones": 28,
    "tareasPendientes": 5,
    "completadasEsteMes": 12,
    "inspeccionesEsteMes": 15,
    "inspeccionesEstaSemana": 3
  },
  "estadisticasPorEstado": {
    "nueva": 3,
    "enProgreso": 2,
    "revisada": 20,
    "archivada": 3
  },
  "tareasPendientes": [
    {
      "id": 156,
      "procedureNumber": "INS-2025-0156",
      "inspectionDate": "2025-10-08",
      "status": "Nuevo",
      "applicantType": "Persona Física"
    }
  ]
}
```

---

### GET /dashboard/admin
Dashboard para administradores

**Request:**
```typescript
GET /dashboard/admin
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "miDashboard": {
    // ... mismo formato que dashboard/inspector
  },
  "vistaAdministrativa": {
    "estadisticasGenerales": {
      "totalInspecciones": 243,
      "totalInspectores": 8,
      "nueva": 35,
      "enProgreso": 28,
      "revisada": 150,
      "archivada": 30
    },
    "kpis": {
      "totalInspeccionesActivas": 63,
      "totalInspeccionesRevisadas": 150,
      "promedioInspeccionesPorInspector": 30,
      "inspeccionesEsteMes": 48,
      "tasaCompletitud": 62
    },
    "rendimientoPorInspector": [
      {
        "inspector": {
          "id": 3,
          "nombre": "María García",
          "email": "maria@example.com"
        },
        "totalInspecciones": 45,
        "completadas": 38,
        "pendientes": 7,
        "esteMes": 12
      }
    ]
  }
}
```

---

### GET /dashboard/stats/period
Estadísticas por período

**Request:**
```typescript
GET /dashboard/stats/period?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "periodo": {
    "inicio": "2025-10-01T00:00:00.000Z",
    "fin": "2025-10-31T23:59:59.999Z"
  },
  "total": 52,
  "porEstado": {
    "nueva": 8,
    "enProgreso": 5,
    "revisada": 35,
    "archivada": 4
  },
  "porTipo": {
    "anonimo": 6,
    "personaFisica": 30,
    "personaJuridica": 16
  }
}
```

---

## 📈 Estadísticas

### GET /stats/dashboard
Estadísticas del dashboard

**Request:**
```typescript
GET /stats/dashboard
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "totalInspections": 243,
  "byStatus": {
    "nuevo": 35,
    "enProceso": 28,
    "revisado": 150,
    "archivado": 30
  },
  "byMonth": {
    "2025-09": 45,
    "2025-10": 52
  },
  "topInspectors": [
    {
      "inspector": "María García",
      "count": 45
    }
  ]
}
```

---

### GET /stats/inspections
Estadísticas de inspecciones

**Request:**
```typescript
GET /stats/inspections
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "total": 243,
  "byStatus": {
    "nuevo": 35,
    "enProceso": 28,
    "revisado": 150,
    "archivado": 30
  },
  "recent": [
    {
      "id": 243,
      "procedureNumber": "INS-2025-0243",
      "status": "Nuevo",
      "createdAt": "2025-10-07T15:30:00.000Z"
    }
  ]
}
```

---

## ☁️ Cloudinary

### POST /cloudinary/upload
Subir imagen

**Request:**
```typescript
POST /cloudinary/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData {
  file: File
}
```

**Response 200:**
```typescript
{
  "url": "https://res.cloudinary.com/..../image.jpg",
  "publicId": "inspections/abc123xyz",
  "format": "jpg",
  "width": 1920,
  "height": 1080
}
```

---

### DELETE /cloudinary/delete/:publicId
Eliminar imagen

**Request:**
```typescript
DELETE /cloudinary/delete/inspections%2Fabc123xyz
Authorization: Bearer {token}
```

**Response 200:**
```typescript
{
  "message": "Imagen eliminada correctamente"
}
```

---

## 🚨 Códigos de Respuesta

| Código | Significado | Descripción |
|--------|-------------|-------------|
| **200** | OK | Petición exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos en la petición |
| **401** | Unauthorized | Token inválido o ausente |
| **403** | Forbidden | Sin permisos para esta acción |
| **404** | Not Found | Recurso no encontrado |
| **422** | Unprocessable Entity | Validación de datos falló |
| **500** | Internal Server Error | Error del servidor |

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints requieren JWT excepto `/auth/login`, `/auth/register`, `/auth/forgot-password`

2. **Formato de Fechas**: Usar formato `YYYY-MM-DD` para fechas

3. **IDs**: Todos los IDs son números enteros positivos

4. **Roles**: 
   - `admin`: Acceso completo
   - `inspector`: Acceso limitado a sus inspecciones

5. **Estados de Inspección**:
   - `Nuevo`: Recién creada
   - `En proceso`: Inspector trabajando
   - `Revisado`: Completada y revisada
   - `Archivado`: Archivada después de 7 días

6. **Tipos de Aplicante**:
   - `Anonimo`: Sin información del solicitante
   - `Persona Física`: Persona individual
   - `Persona Jurídica`: Empresa/entidad legal

---

Para más detalles sobre tipos TypeScript, consulta **TYPESCRIPT-INTERFACES.md**

Para ejemplos de integración, consulta **INTEGRATION-EXAMPLES.md**
