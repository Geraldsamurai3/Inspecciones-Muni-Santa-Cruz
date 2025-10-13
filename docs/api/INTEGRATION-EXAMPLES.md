# ⚛️ Ejemplos de Integración Frontend

Ejemplos prácticos con React, Next.js, y diferentes librerías

## 📦 Configuración Inicial

### 1. Variables de Entorno (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. Cliente API Base (src/lib/api.ts)
```typescript
import type { AuthResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Almacenar token en localStorage
export const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// Cliente HTTP base
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }

  return response.json();
}
```

---

## 🔐 Autenticación

### Login Component (React)
```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { apiClient, setToken } from '@/lib/api';
import type { AuthResponse, LoginDto } from '@/types/api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password } as LoginDto),
      });

      setToken(data.access_token);
      
      // Guardar usuario en contexto/estado
      console.log('Usuario autenticado:', data.user);
      
      // Redirigir a dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Cargando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### Auth Context (React Context API)
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getToken, setToken, removeToken } from '@/lib/api';
import type { UserResponse, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token al cargar
    const token = getToken();
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiClient<UserResponse>('/users/me');
      setUser(userData);
    } catch (error) {
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

---

## 📋 CRUD de Inspecciones

### Lista de Inspecciones con React Query
```typescript
// src/hooks/useInspections.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { 
  InspectionResponse, 
  CreateInspectionDto,
  UpdateInspectionDto 
} from '@/types/api';

export function useInspections() {
  return useQuery({
    queryKey: ['inspections'],
    queryFn: () => apiClient<InspectionResponse[]>('/inspections'),
  });
}

export function useInspection(id: number) {
  return useQuery({
    queryKey: ['inspections', id],
    queryFn: () => apiClient<InspectionResponse>(`/inspections/${id}`),
    enabled: !!id,
  });
}

export function useCreateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInspectionDto) =>
      apiClient<InspectionResponse>('/inspections', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      // Invalidar cache para refrescar lista
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
}

export function useUpdateInspection(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateInspectionDto) =>
      apiClient<InspectionResponse>(`/inspections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', id] });
    },
  });
}

export function useDeleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient(`/inspections/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });
}
```

### Componente Lista de Inspecciones
```typescript
// src/components/InspectionsList.tsx
import { useInspections, useDeleteInspection } from '@/hooks/useInspections';

export default function InspectionsList() {
  const { data: inspections, isLoading, error } = useInspections();
  const deleteMutation = useDeleteInspection();

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta inspección?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) return <div>Cargando inspecciones...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Inspecciones</h2>

      <div className="grid gap-4">
        {inspections?.map((inspection) => (
          <div
            key={inspection.id}
            className="p-4 border rounded-lg shadow hover:shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {inspection.procedureNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Fecha: {inspection.inspectionDate}
                </p>
                <p className="text-sm text-gray-600">
                  Tipo: {inspection.applicantType}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                    inspection.status === 'Nuevo'
                      ? 'bg-blue-100 text-blue-800'
                      : inspection.status === 'En proceso'
                      ? 'bg-yellow-100 text-yellow-800'
                      : inspection.status === 'Revisado'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {inspection.status}
                </span>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => console.log('Ver', inspection.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  Ver
                </button>
                <button
                  onClick={() => handleDelete(inspection.id)}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {inspection.inspectors && inspection.inspectors.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Inspectores:{' '}
                {inspection.inspectors
                  .map((i) => `${i.firstName} ${i.lastName}`)
                  .join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Formulario Crear Inspección
```typescript
// src/components/CreateInspectionForm.tsx
import { useState } from 'react';
import { useCreateInspection } from '@/hooks/useInspections';
import type { CreateInspectionDto } from '@/types/api';

export default function CreateInspectionForm() {
  const createMutation = useCreateInspection();
  
  const [formData, setFormData] = useState<CreateInspectionDto>({
    inspectionDate: '',
    procedureNumber: '',
    applicantType: 'Persona Física',
    inspectorIds: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync(formData);
      alert('Inspección creada exitosamente');
      // Reset form o redirigir
    } catch (error) {
      alert('Error al crear inspección');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Nueva Inspección</h2>

      <div>
        <label className="block text-sm font-medium mb-1">
          Número de Procedimiento
        </label>
        <input
          type="text"
          required
          value={formData.procedureNumber}
          onChange={(e) =>
            setFormData({ ...formData, procedureNumber: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de Inspección
        </label>
        <input
          type="date"
          required
          value={formData.inspectionDate}
          onChange={(e) =>
            setFormData({ ...formData, inspectionDate: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Tipo de Solicitante
        </label>
        <select
          value={formData.applicantType}
          onChange={(e) =>
            setFormData({
              ...formData,
              applicantType: e.target.value as any,
            })
          }
          className="w-full px-3 py-2 border rounded"
        >
          <option value="Anonimo">Anónimo</option>
          <option value="Persona Física">Persona Física</option>
          <option value="Persona Jurídica">Persona Jurídica</option>
        </select>
      </div>

      {/* Campos condicionales según tipo */}
      {formData.applicantType === 'Persona Física' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Datos del Solicitante</h3>
          
          <input
            type="text"
            placeholder="Nombre"
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                individualRequest: {
                  ...formData.individualRequest,
                  firstName: e.target.value,
                  lastName: formData.individualRequest?.lastName || '',
                  cedula: formData.individualRequest?.cedula || '',
                  phone: formData.individualRequest?.phone || '',
                },
              })
            }
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="text"
            placeholder="Apellido"
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                individualRequest: {
                  ...formData.individualRequest,
                  firstName: formData.individualRequest?.firstName || '',
                  lastName: e.target.value,
                  cedula: formData.individualRequest?.cedula || '',
                  phone: formData.individualRequest?.phone || '',
                },
              })
            }
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="text"
            placeholder="Cédula (X-XXXX-XXXX)"
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                individualRequest: {
                  ...formData.individualRequest,
                  firstName: formData.individualRequest?.firstName || '',
                  lastName: formData.individualRequest?.lastName || '',
                  cedula: e.target.value,
                  phone: formData.individualRequest?.phone || '',
                },
              })
            }
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                individualRequest: {
                  ...formData.individualRequest,
                  firstName: formData.individualRequest?.firstName || '',
                  lastName: formData.individualRequest?.lastName || '',
                  cedula: formData.individualRequest?.cedula || '',
                  phone: e.target.value,
                },
              })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {createMutation.isPending ? 'Creando...' : 'Crear Inspección'}
      </button>
    </form>
  );
}
```

---

## 📊 Dashboard Component

### Hook para Dashboard
```typescript
// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { InspectorDashboardResponse } from '@/types/api';

export function useInspectorDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'inspector'],
    queryFn: () =>
      apiClient<InspectorDashboardResponse>('/dashboard/inspector'),
  });
}
```

### Dashboard Inspector Component
```typescript
// src/components/InspectorDashboard.tsx
import { useInspectorDashboard } from '@/hooks/useDashboard';

export default function InspectorDashboard() {
  const { data, isLoading } = useInspectorDashboard();

  if (isLoading) return <div>Cargando dashboard...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Bienvenido, {data.inspector.nombre}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="text-sm text-gray-600">Total Inspecciones</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.resumen.totalInspecciones}
          </p>
        </div>

        <div className="p-6 bg-yellow-50 rounded-lg">
          <h3 className="text-sm text-gray-600">Tareas Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {data.resumen.tareasPendientes}
          </p>
        </div>

        <div className="p-6 bg-green-50 rounded-lg">
          <h3 className="text-sm text-gray-600">Completadas este mes</h3>
          <p className="text-3xl font-bold text-green-600">
            {data.resumen.completadasEsteMes}
          </p>
        </div>

        <div className="p-6 bg-purple-50 rounded-lg">
          <h3 className="text-sm text-gray-600">Esta semana</h3>
          <p className="text-3xl font-bold text-purple-600">
            {data.resumen.inspeccionesEstaSemana}
          </p>
        </div>
      </div>

      {/* Estado Distribution */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Por Estado</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">
              {data.estadisticasPorEstado.nueva}
            </div>
            <div className="text-sm text-gray-600">Nueva</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.estadisticasPorEstado.enProgreso}
            </div>
            <div className="text-sm text-gray-600">En Progreso</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.estadisticasPorEstado.revisada}
            </div>
            <div className="text-sm text-gray-600">Revisada</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.estadisticasPorEstado.archivada}
            </div>
            <div className="text-sm text-gray-600">Archivada</div>
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Tareas Pendientes</h2>
        <div className="space-y-2">
          {data.tareasPendientes.map((task) => (
            <div
              key={task.id}
              className="p-3 border rounded hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <span className="font-medium">{task.procedureNumber}</span>
                <span className="text-sm text-gray-600">
                  {task.inspectionDate}
                </span>
              </div>
              <div className="text-sm text-gray-600">{task.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ☁️ Upload de Imágenes

### Hook para Cloudinary
```typescript
// src/hooks/useCloudinary.ts
import { useMutation } from '@tanstack/react-query';
import { getToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/cloudinary/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir imagen');
      
      return response.json();
    },
  });
}
```

### Componente Image Uploader
```typescript
// src/components/ImageUploader.tsx
import { useState } from 'react';
import { useUploadImage } from '@/hooks/useCloudinary';

export default function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const uploadMutation = useUploadImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload a Cloudinary
    try {
      const result = await uploadMutation.mutateAsync(file);
      console.log('Imagen subida:', result.url);
      alert('Imagen subida exitosamente!');
    } catch (error) {
      alert('Error al subir imagen');
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm"
      />

      {uploadMutation.isPending && <div>Subiendo imagen...</div>}

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="max-w-md rounded shadow"
        />
      )}

      {uploadMutation.data && (
        <div className="p-3 bg-green-50 rounded">
          <p className="text-sm">URL: {uploadMutation.data.url}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Setup Completo de React Query

```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

```typescript
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🛡️ Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requireAdmin && user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, requireAdmin, router]);

  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated) return null;
  if (requireAdmin && user?.role !== 'admin') return null;

  return <>{children}</>;
}
```

---

Para más detalles sobre los endpoints, consulta **API-REFERENCE.md**

Para tipos TypeScript completos, consulta **TYPESCRIPT-INTERFACES.md**
