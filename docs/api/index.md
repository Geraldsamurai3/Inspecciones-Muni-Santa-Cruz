# 📚 Documentación API - Inspecciones Municipales Santa Cruz

Bienvenido a la documentación completa de la API. Esta guía está diseñada para que el equipo de frontend pueda integrar todos los servicios del backend de manera rápida y eficiente.

## 🚀 Inicio Rápido

### Configuración Base

```typescript
// config/api.ts
export const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Obtener token JWT
const token = localStorage.getItem('token');
const authHeaders = {
  'Authorization': `Bearer ${token}`
};
```

### Primera Petición

```typescript
// Ejemplo: Login
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
```

## 📖 Estructura de la Documentación

| Archivo | Descripción |
|---------|-------------|
| **API-REFERENCE.md** | Referencia completa de todos los endpoints (60+) |
| **TYPESCRIPT-INTERFACES.md** | Interfaces y tipos TypeScript (50+) |
| **INTEGRATION-EXAMPLES.md** | Ejemplos de integración con React/Next.js |
| **ERROR-HANDLING.md** | Manejo de errores y casos especiales |
| **HTTP-STATUS-CODES.md** | Códigos HTTP y su significado |
| **LIBRARY-EXAMPLES.md** | Ejemplos con diferentes librerías |

## 🎯 Módulos Disponibles

### 1. **Autenticación** (`/auth`)
- Login
- Registro
- Recuperación de contraseña
- Reset de contraseña

### 2. **Usuarios** (`/users`)
- CRUD completo
- Perfil de usuario
- Bloquear/Desbloquear
- Mis inspecciones

### 3. **Inspecciones** (`/inspections`)
- CRUD completo
- Cambio de estado
- Asignación de inspectores
- Subir fotos
- 15 sub-módulos especializados

### 4. **Dashboard** (`/dashboard`)
- Dashboard para inspectores
- Dashboard para administradores
- Estadísticas por período

### 5. **Estadísticas** (`/stats`)
- Estadísticas generales
- Por inspector
- Por período
- Dashboard metrics

### 6. **Cloudinary** (`/cloudinary`)
- Upload de imágenes
- Eliminación de imágenes

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`, `/auth/register`, `/auth/forgot-password`) requieren autenticación JWT.

```typescript
// Agregar token a las peticiones
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

## 📊 Tipos de Datos Principales

### Usuario
```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  cedula: string;
  phone?: string;
  role: 'admin' | 'inspector';
  createdAt: string;
}
```

### Inspección
```typescript
interface Inspection {
  id: number;
  inspectionDate: string; // YYYY-MM-DD
  procedureNumber: string;
  applicantType: 'Anonimo' | 'Persona Física' | 'Persona Jurídica';
  status: 'Nuevo' | 'En proceso' | 'Revisado' | 'Archivado';
  inspectors: User[];
  createdAt: string;
  updatedAt: string;
  // Relaciones según tipo
  construction?: Construction;
  mayorOffice?: MayorOffice;
  // ... otros
}
```

## ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| **401 Unauthorized** | Token inválido o expirado | Renovar token o hacer login |
| **403 Forbidden** | Sin permisos | Verificar rol de usuario |
| **404 Not Found** | Recurso no existe | Verificar ID |
| **422 Validation Error** | Datos inválidos | Verificar formato de datos |

## 🛠️ Herramientas Recomendadas

### Para Testing
- **Postman** o **Thunder Client**: Testing manual de APIs
- **Jest**: Testing automatizado
- **MSW**: Mock Service Worker para tests

### Para Integración Frontend
- **Axios**: Cliente HTTP robusto
- **React Query**: Cache y sincronización de datos
- **SWR**: Alternative ligera a React Query
- **Zod**: Validación de datos TypeScript

## 📝 Ejemplos Rápidos

### Login y Guardar Token
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const { access_token, user } = await response.json();
  localStorage.setItem('token', access_token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { access_token, user };
};
```

### Obtener Inspecciones con Autenticación
```typescript
const getInspections = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/inspections`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado, redirigir a login
      window.location.href = '/login';
    }
    throw new Error('Failed to fetch');
  }
  
  return await response.json();
};
```

### Crear Inspección
```typescript
const createInspection = async (data: CreateInspectionDto) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/inspections`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create');
  }
  
  return await response.json();
};
```

### Upload de Imagen
```typescript
const uploadImage = async (file: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/cloudinary/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // NO incluir Content-Type, el browser lo agrega automáticamente
    },
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  
  return await response.json(); // { url, publicId }
};
```

## 🎨 Estructura de Proyecto Frontend Recomendada

```
src/
├── api/
│   ├── client.ts          # Configuración de Axios/Fetch
│   ├── auth.ts            # Endpoints de autenticación
│   ├── users.ts           # Endpoints de usuarios
│   ├── inspections.ts     # Endpoints de inspecciones
│   └── stats.ts           # Endpoints de estadísticas
├── hooks/
│   ├── useAuth.ts         # Hook de autenticación
│   ├── useInspections.ts  # Hook de inspecciones
│   └── useUsers.ts        # Hook de usuarios
├── types/
│   ├── user.ts            # Tipos de usuario
│   ├── inspection.ts      # Tipos de inspección
│   └── api.ts             # Tipos de respuestas API
├── contexts/
│   └── AuthContext.tsx    # Context de autenticación
└── utils/
    ├── api-error.ts       # Manejo de errores
    └── validators.ts      # Validaciones

```

## 🔗 Enlaces Útiles

- **Base URL**: `http://localhost:3000`
- **Swagger UI** (si está habilitado): `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000`

## 📞 Soporte

Si encuentras algún error en la documentación o necesitas aclarar algo:
1. Revisa la sección de **ERROR-HANDLING.md**
2. Consulta los ejemplos en **INTEGRATION-EXAMPLES.md**
3. Contacta al equipo de backend

## 🚦 Estado de la API

- ✅ **Auth Module**: Completo y testeado
- ✅ **Users Module**: Completo y testeado
- ✅ **Inspections Module**: Completo y testeado (15 sub-módulos)
- ✅ **Dashboard Module**: Completo y testeado
- ✅ **Stats Module**: Completo y testeado
- ✅ **Cloudinary Module**: Completo y testeado
- ✅ **Email Module**: Completo y testeado

**Total**: 60+ endpoints | 346 tests pasando | 0 vulnerabilidades

---

**Última actualización**: Octubre 2025
**Versión del Backend**: 1.0.0
**Cobertura de Tests**: 78.95%
