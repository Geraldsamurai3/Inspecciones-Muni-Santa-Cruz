# ⚠️ Manejo de Errores

Guía completa para manejar errores del API

## 📋 Estructura de Errores

### Formato Estándar
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}
```

---

## 🔴 Errores Comunes

### 400 - Bad Request
**Causa:** Datos inválidos o faltantes en la petición

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
- Validar datos antes de enviar
- Revisar que todos los campos requeridos estén presentes
- Verificar formato de email, fechas, etc.

**Código Frontend:**
```typescript
try {
  await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
} catch (error) {
  if (error.statusCode === 400) {
    const messages = Array.isArray(error.message) 
      ? error.message 
      : [error.message];
    
    messages.forEach(msg => console.error('Validación:', msg));
  }
}
```

---

### 401 - Unauthorized
**Causa:** Token inválido, expirado o ausente

**Ejemplo:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Solución:**
- Verificar que el token esté en el header `Authorization`
- Refrescar token si expiró
- Redirigir a login si no hay token

**Código Frontend:**
```typescript
// Interceptor de errores
async function apiClient(endpoint, options) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expirado o inválido
      removeToken();
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
```

---

### 403 - Forbidden
**Causa:** Usuario autenticado pero sin permisos

**Ejemplo:**
```json
{
  "statusCode": 403,
  "message": "Solo administradores pueden realizar esta acción",
  "error": "Forbidden"
}
```

**Solución:**
- Verificar el rol del usuario
- Ocultar opciones para las que no tiene permisos
- Mostrar mensaje informativo

**Código Frontend:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function AdminButton() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return null; // No mostrar botón
  }

  return <button>Acción de Admin</button>;
}
```

---

### 404 - Not Found
**Causa:** Recurso no existe

**Ejemplo:**
```json
{
  "statusCode": 404,
  "message": "Inspección no encontrada",
  "error": "Not Found"
}
```

**Solución:**
- Verificar que el ID existe antes de hacer peticiones
- Manejar el caso cuando el recurso fue eliminado
- Mostrar página 404 apropiada

**Código Frontend:**
```typescript
import { useInspection } from '@/hooks/useInspections';

export default function InspectionDetail({ id }) {
  const { data, error, isLoading } = useInspection(id);

  if (isLoading) return <div>Cargando...</div>;
  
  if (error?.statusCode === 404) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-700">
          Inspección no encontrada
        </h2>
        <p className="mt-2 text-gray-600">
          La inspección que buscas no existe o fue eliminada.
        </p>
        <a href="/inspections" className="mt-4 text-blue-600">
          Ver todas las inspecciones
        </a>
      </div>
    );
  }

  return <div>{/* Contenido de inspección */}</div>;
}
```

---

### 422 - Unprocessable Entity
**Causa:** Validación de negocio falló

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

**Solución:**
- Usar el campo correcto en el DTO
- Verificar longitud de strings
- Revisar que campos requeridos según el tipo

**Ejemplo Real - Legal Entity Request:**
```typescript
// ❌ INCORRECTO
const data = {
  applicantType: 'Persona Jurídica',
  legalEntityRequest: {
    companyName: 'Mi Empresa SA',  // Campo incorrecto
    judicialNumber: '3-101-123456',
    representativeName: 'Juan Pérez',
    representativeCedula: '1-1111-1111',
    phone: '2222-3333'
  }
};

// ✅ CORRECTO
const data = {
  applicantType: 'Persona Jurídica',
  legalEntityRequest: {
    legalName: 'Mi Empresa SA',        // Campo correcto
    judicialNumber: '3-101-123456',
    representativeName: 'Juan Pérez',
    representativeCedula: '1-1111-1111',
    phone: '2222-3333'
  }
};
```

---

### 500 - Internal Server Error
**Causa:** Error del servidor

**Ejemplo:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

**Solución:**
- Reportar el error al equipo de backend
- Mostrar mensaje genérico al usuario
- Implementar retry con exponential backoff

**Código Frontend:**
```typescript
async function apiClientWithRetry(endpoint, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiClient(endpoint, options);
    } catch (error) {
      if (error.statusCode === 500 && i < maxRetries - 1) {
        // Esperar antes de reintentar (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }
      throw error;
    }
  }
}
```

---

## 🛠️ Error Handler Global

### React Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error capturado:', error, errorInfo);
    // Enviar a servicio de logging (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600">
              Algo salió mal
            </h1>
            <p className="mt-4 text-gray-600">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler Hook
```typescript
// src/hooks/useApiError.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/api';

interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const router = useRouter();

  const handleError = (error: any) => {
    setError(error);

    // Manejar errores específicos
    switch (error.statusCode) {
      case 401:
        // Sesión expirada
        removeToken();
        router.push('/login');
        break;

      case 403:
        // Sin permisos
        alert('No tienes permisos para realizar esta acción');
        break;

      case 404:
        // No encontrado
        console.error('Recurso no encontrado');
        break;

      case 422:
        // Validación
        const messages = Array.isArray(error.message)
          ? error.message.join(', ')
          : error.message;
        alert(`Error de validación: ${messages}`);
        break;

      case 500:
        // Error del servidor
        alert('Error del servidor. Por favor, intenta más tarde.');
        break;

      default:
        alert('Error desconocido');
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
```

### Uso del Hook
```typescript
import { useApiError } from '@/hooks/useApiError';
import { useCreateInspection } from '@/hooks/useInspections';

export default function CreateInspectionForm() {
  const { handleError } = useApiError();
  const createMutation = useCreateInspection();

  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      alert('Creado exitosamente');
    } catch (error) {
      handleError(error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

---

## 🎯 Toast Notifications

### Sistema de Notificaciones
```typescript
// src/components/Toast.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
}
```

### Uso con Errores
```typescript
import { useToast } from '@/components/Toast';
import { useApiError } from '@/hooks/useApiError';

export default function MyComponent() {
  const { showToast } = useToast();
  const { handleError } = useApiError();

  const handleAction = async () => {
    try {
      await someApiCall();
      showToast('Acción completada exitosamente', 'success');
    } catch (error) {
      handleError(error);
      showToast('Error al realizar la acción', 'error');
    }
  };

  return <button onClick={handleAction}>Hacer algo</button>;
}
```

---

## 📊 Logger de Errores

### Servicio de Logging
```typescript
// src/lib/logger.ts
interface LogData {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: any;
  timestamp: string;
  userId?: number;
}

class Logger {
  private logs: LogData[] = [];

  private log(level: LogData['level'], message: string, context?: any) {
    const logData: LogData = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    this.logs.push(logData);
    console[level](message, context);

    // Enviar a servicio externo (Sentry, LogRocket, etc.)
    if (level === 'error') {
      this.sendToExternalService(logData);
    }
  }

  private sendToExternalService(logData: LogData) {
    // Implementar integración con Sentry u otro servicio
    // Ejemplo: Sentry.captureException(logData);
  }

  info(message: string, context?: any) {
    this.log('info', message, context);
  }

  warn(message: string, context?: any) {
    this.log('warn', message, context);
  }

  error(message: string, context?: any) {
    this.log('error', message, context);
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = new Logger();
```

### Uso del Logger
```typescript
import { logger } from '@/lib/logger';

try {
  const result = await apiClient('/inspections');
  logger.info('Inspecciones cargadas', { count: result.length });
} catch (error) {
  logger.error('Error al cargar inspecciones', {
    error: error.message,
    statusCode: error.statusCode,
    endpoint: '/inspections'
  });
}
```

---

## 🔍 Debugging Tips

### 1. Revisar Network en DevTools
- Abrir DevTools (F12)
- Ir a pestaña Network
- Ver request/response completos
- Verificar headers, body, status code

### 2. Console Logs Estratégicos
```typescript
console.log('📤 Request:', endpoint, options);
console.log('📥 Response:', data);
console.error('❌ Error:', error);
```

### 3. React Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 4. Validar DTOs antes de enviar
```typescript
import { z } from 'zod';

const CreateInspectionSchema = z.object({
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  procedureNumber: z.string().min(1),
  applicantType: z.enum(['Anonimo', 'Persona Física', 'Persona Jurídica']),
  inspectorIds: z.array(z.number()).min(1),
});

// Validar antes de enviar
try {
  const validData = CreateInspectionSchema.parse(formData);
  await createInspection(validData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Errores de validación:', error.errors);
  }
}
```

---

## 📝 Checklist de Errores Comunes

### ✅ Antes de hacer una petición

- [ ] Token en el header `Authorization`
- [ ] `Content-Type: application/json` en headers
- [ ] Body serializado con `JSON.stringify()`
- [ ] URL correcta (sin `/` dobles)
- [ ] Método HTTP correcto (GET, POST, PATCH, DELETE)

### ✅ Campos específicos

**Persona Física:**
- [ ] `individualRequest.firstName` (no `name`)
- [ ] `individualRequest.lastName` (no `surname`)
- [ ] `individualRequest.cedula` formato X-XXXX-XXXX
- [ ] `individualRequest.phone` es requerido

**Persona Jurídica:**
- [ ] `legalEntityRequest.legalName` (no `companyName`)
- [ ] `legalEntityRequest.judicialNumber` (cédula jurídica)
- [ ] `legalEntityRequest.representativeName` (no `representative`)
- [ ] `legalEntityRequest.representativeCedula` (no `representativeId`)

**Fechas:**
- [ ] Formato `YYYY-MM-DD`
- [ ] No enviar `Date` objects, solo strings

**Arrays:**
- [ ] `inspectorIds` debe ser array de números
- [ ] No enviar array vacío si es requerido

---

Para más información sobre endpoints, consulta **API-REFERENCE.md**

Para tipos completos, consulta **TYPESCRIPT-INTERFACES.md**
