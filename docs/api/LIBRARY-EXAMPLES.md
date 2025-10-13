# 📚 Ejemplos con Diferentes Librerías

Cómo usar el API con diferentes herramientas y librerías

---

## 🎯 Axios

### Instalación
```bash
npm install axios
```

### Cliente Base
```typescript
// src/lib/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
```

### Uso con React Query
```typescript
// src/hooks/useInspections.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosClient from '@/lib/axiosClient';
import type { InspectionResponse } from '@/types/api';

export function useInspections() {
  return useQuery({
    queryKey: ['inspections'],
    queryFn: async () => {
      const { data } = await axiosClient.get<InspectionResponse[]>('/inspections');
      return data;
    },
  });
}

export function useCreateInspection() {
  return useMutation({
    mutationFn: async (dto: any) => {
      const { data } = await axiosClient.post('/inspections', dto);
      return data;
    },
  });
}
```

### Ejemplos Directos
```typescript
// Login
const login = async (email: string, password: string) => {
  const { data } = await axiosClient.post('/auth/login', {
    email,
    password,
  });
  localStorage.setItem('auth_token', data.access_token);
  return data;
};

// Obtener inspecciones
const getInspections = async () => {
  const { data } = await axiosClient.get('/inspections');
  return data;
};

// Crear inspección
const createInspection = async (dto: any) => {
  const { data } = await axiosClient.post('/inspections', dto);
  return data;
};

// Actualizar inspección
const updateInspection = async (id: number, dto: any) => {
  const { data } = await axiosClient.patch(`/inspections/${id}`, dto);
  return data;
};

// Eliminar inspección
const deleteInspection = async (id: number) => {
  await axiosClient.delete(`/inspections/${id}`);
};

// Upload con FormData
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axiosClient.post('/cloudinary/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};
```

---

## 🔄 React Query

### Instalación
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Setup Completo
```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Hooks Avanzados
```typescript
// src/hooks/useInspections.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import axiosClient from '@/lib/axiosClient';

// Query básica
export function useInspections() {
  return useQuery({
    queryKey: ['inspections'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/inspections');
      return data;
    },
  });
}

// Query con parámetros
export function useInspection(id: number) {
  return useQuery({
    queryKey: ['inspections', id],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/inspections/${id}`);
      return data;
    },
    enabled: !!id, // Solo ejecutar si hay ID
  });
}

// Query con filtros
export function useFilteredInspections(filters: {
  status?: string;
  inspectorId?: number;
}) {
  return useQuery({
    queryKey: ['inspections', 'filtered', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/inspections', {
        params: filters,
      });
      return data;
    },
  });
}

// Infinite Query (paginación)
export function useInfiniteInspections() {
  return useInfiniteQuery({
    queryKey: ['inspections', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axiosClient.get('/inspections', {
        params: { page: pageParam, limit: 10 },
      });
      return data;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

// Mutation con optimistic update
export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axiosClient.patch(`/inspections/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['inspections', id] });

      // Guardar estado anterior
      const previousInspection = queryClient.getQueryData(['inspections', id]);

      // Optimistic update
      queryClient.setQueryData(['inspections', id], (old: any) => ({
        ...old,
        ...data,
      }));

      return { previousInspection };
    },
    onError: (err, variables, context) => {
      // Revertir en caso de error
      if (context?.previousInspection) {
        queryClient.setQueryData(
          ['inspections', variables.id],
          context.previousInspection
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refrescar después de mutación
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', variables.id] });
    },
  });
}
```

### Prefetching
```typescript
// Prefetch para mejorar UX
export function usePrefetchInspection() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: ['inspections', id],
      queryFn: async () => {
        const { data } = await axiosClient.get(`/inspections/${id}`);
        return data;
      },
    });
  };
}

// Uso en lista
function InspectionsList() {
  const { data } = useInspections();
  const prefetch = usePrefetchInspection();

  return (
    <div>
      {data?.map((inspection) => (
        <div
          key={inspection.id}
          onMouseEnter={() => prefetch(inspection.id)} // Prefetch al hover
        >
          {inspection.procedureNumber}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎣 SWR (stale-while-revalidate)

### Instalación
```bash
npm install swr
```

### Setup
```typescript
// src/lib/fetcher.ts
export const fetcher = async (url: string) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error en la petición');
  }

  return response.json();
};
```

### Provider Global
```typescript
// src/app/providers.tsx
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

export function Providers({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

### Hooks con SWR
```typescript
// src/hooks/useInspections.ts
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import axiosClient from '@/lib/axiosClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET
export function useInspections() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_URL}/inspections`
  );

  return {
    inspections: data,
    isLoading,
    error,
    refresh: mutate,
  };
}

// GET con ID
export function useInspection(id: number) {
  const { data, error, isLoading } = useSWR(
    id ? `${API_URL}/inspections/${id}` : null
  );

  return {
    inspection: data,
    isLoading,
    error,
  };
}

// POST/PATCH/DELETE
export function useCreateInspection() {
  const { trigger, isMutating } = useSWRMutation(
    `${API_URL}/inspections`,
    async (url, { arg }: { arg: any }) => {
      const { data } = await axiosClient.post(url, arg);
      return data;
    }
  );

  return { create: trigger, isCreating: isMutating };
}

export function useUpdateInspection(id: number) {
  const { trigger } = useSWRMutation(
    `${API_URL}/inspections/${id}`,
    async (url, { arg }: { arg: any }) => {
      const { data } = await axiosClient.patch(url, arg);
      return data;
    },
    {
      // Revalidar después de actualizar
      onSuccess: () => {
        mutate(`${API_URL}/inspections`);
        mutate(`${API_URL}/inspections/${id}`);
      },
    }
  );

  return { update: trigger };
}
```

### Uso en Componentes
```typescript
function InspectionsList() {
  const { inspections, isLoading, error, refresh } = useInspections();

  if (error) return <div>Error al cargar</div>;
  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <button onClick={() => refresh()}>Refrescar</button>
      {inspections.map((i) => (
        <div key={i.id}>{i.procedureNumber}</div>
      ))}
    </div>
  );
}
```

---

## 🧪 Testing con MSW (Mock Service Worker)

### Instalación
```bash
npm install -D msw
```

### Setup
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000';

export const handlers = [
  // Login
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      access_token: 'mock-token-12345',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'inspector',
      },
    });
  }),

  // Get inspections
  http.get(`${API_URL}/inspections`, () => {
    return HttpResponse.json([
      {
        id: 1,
        procedureNumber: 'INS-2025-001',
        inspectionDate: '2025-10-15',
        status: 'Nuevo',
        applicantType: 'Persona Física',
      },
      {
        id: 2,
        procedureNumber: 'INS-2025-002',
        inspectionDate: '2025-10-16',
        status: 'En proceso',
        applicantType: 'Persona Jurídica',
      },
    ]);
  }),

  // Get inspection by ID
  http.get(`${API_URL}/inspections/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      procedureNumber: 'INS-2025-001',
      inspectionDate: '2025-10-15',
      status: 'Nuevo',
      applicantType: 'Persona Física',
    });
  }),

  // Create inspection
  http.post(`${API_URL}/inspections`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 999,
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Error 401
  http.get(`${API_URL}/users`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json([
      { id: 1, email: 'user1@example.com', firstName: 'User', lastName: 'One' },
    ]);
  }),
];
```

### Browser Setup
```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

### Inicializar en desarrollo
```typescript
// src/app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass',
        });
      });
    }
  }, []);

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

### Testing
```typescript
// src/__tests__/inspections.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InspectionsList from '@/components/InspectionsList';

// Setup MSW para tests
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('muestra lista de inspecciones', async () => {
  const queryClient = new QueryClient();

  render(
    <QueryClientProvider client={queryClient}>
      <InspectionsList />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('INS-2025-001')).toBeInTheDocument();
    expect(screen.getByText('INS-2025-002')).toBeInTheDocument();
  });
});
```

---

## 🔐 Zod para Validación

### Instalación
```bash
npm install zod
```

### Schemas
```typescript
// src/schemas/inspection.schema.ts
import { z } from 'zod';

export const CreateInspectionSchema = z.object({
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Formato de fecha debe ser YYYY-MM-DD',
  }),
  procedureNumber: z.string().min(1, 'Número de procedimiento es requerido'),
  applicantType: z.enum(['Anonimo', 'Persona Física', 'Persona Jurídica']),
  inspectorIds: z.array(z.number()).min(1, 'Debe haber al menos un inspector'),

  individualRequest: z
    .object({
      firstName: z.string().min(1).max(50),
      lastName: z.string().min(1).max(50),
      cedula: z.string().regex(/^\d-\d{4}-\d{4}$/),
      phone: z.string().min(1),
    })
    .optional(),

  legalEntityRequest: z
    .object({
      legalName: z.string().min(1).max(150),
      judicialNumber: z.string(),
      representativeName: z.string(),
      representativeCedula: z.string(),
      phone: z.string(),
    })
    .optional(),
});

export type CreateInspectionInput = z.infer<typeof CreateInspectionSchema>;
```

### Uso en Formulario
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateInspectionSchema } from '@/schemas/inspection.schema';

export default function CreateInspectionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateInspectionSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      await createInspection(data);
      alert('Creado exitosamente');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('procedureNumber')} />
      {errors.procedureNumber && (
        <p className="text-red-600">{errors.procedureNumber.message}</p>
      )}

      <input type="date" {...register('inspectionDate')} />
      {errors.inspectionDate && (
        <p className="text-red-600">{errors.inspectionDate.message}</p>
      )}

      <button type="submit">Crear</button>
    </form>
  );
}
```

---

## 📦 Resumen de Librerías

| Librería | Propósito | Instalación |
|----------|-----------|-------------|
| **Axios** | Cliente HTTP con interceptors | `npm install axios` |
| **React Query** | Cache y estado asíncrono | `npm install @tanstack/react-query` |
| **SWR** | Fetching con revalidación | `npm install swr` |
| **MSW** | Mocking para testing | `npm install -D msw` |
| **Zod** | Validación de esquemas | `npm install zod` |
| **React Hook Form** | Manejo de formularios | `npm install react-hook-form` |

---

Para más información sobre endpoints, consulta **API-REFERENCE.md**

Para tipos TypeScript, consulta **TYPESCRIPT-INTERFACES.md**
