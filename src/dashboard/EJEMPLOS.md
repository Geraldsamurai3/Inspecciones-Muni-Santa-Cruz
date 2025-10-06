# 🚀 Ejemplos de Uso del Dashboard

## Ejemplos de Peticiones HTTP

### 1. Dashboard del Inspector

**Request:**
```bash
curl -X GET http://localhost:3000/dashboard/inspector \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response Ejemplo:**
```json
{
  "inspector": {
    "id": 3,
    "nombre": "María García López",
    "email": "maria.garcia@municipio.gob",
    "role": "inspector"
  },
  "resumen": {
    "totalInspecciones": 28,
    "tareasPendientes": 5,
    "completadasEsteMes": 8,
    "inspeccionesEsteMes": 12,
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
      "applicantType": "Persona Física",
      "createdAt": "2025-10-06T14:30:00.000Z"
    },
    {
      "id": 157,
      "procedureNumber": "INS-2025-0157",
      "inspectionDate": "2025-10-09",
      "status": "En proceso",
      "applicantType": "Persona Jurídica",
      "createdAt": "2025-10-07T09:15:00.000Z"
    }
  ],
  "ultimasInspecciones": [
    {
      "id": 158,
      "procedureNumber": "INS-2025-0158",
      "inspectionDate": "2025-10-07",
      "status": "Revisado",
      "applicantType": "Persona Física",
      "createdAt": "2025-10-07T16:45:00.000Z"
    }
  ]
}
```

---

### 2. Dashboard del Administrador

**Request:**
```bash
curl -X GET http://localhost:3000/dashboard/admin \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response Ejemplo (resumida):**
```json
{
  "miDashboard": {
    "inspector": {
      "id": 1,
      "nombre": "Carlos Rodríguez Admin",
      "email": "carlos.rodriguez@municipio.gob",
      "role": "admin"
    },
    "resumen": {
      "totalInspecciones": 15,
      "tareasPendientes": 2,
      "completadasEsteMes": 5,
      "inspeccionesEsteMes": 8,
      "inspeccionesEstaSemana": 1
    },
    "estadisticasPorEstado": {
      "nueva": 1,
      "enProgreso": 1,
      "revisada": 10,
      "archivada": 3
    },
    "tareasPendientes": [...],
    "ultimasInspecciones": [...]
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
      "totalInspeccionesArchivadas": 30,
      "promedioInspeccionesPorInspector": 30,
      "inspeccionesEsteMes": 48,
      "tasaCompletitud": 62
    },
    "estadisticasPorTipo": {
      "anonimo": 25,
      "personaFisica": 140,
      "personaJuridica": 78
    },
    "rendimientoPorInspector": [
      {
        "inspector": {
          "id": 3,
          "nombre": "María García López",
          "email": "maria.garcia@municipio.gob",
          "role": "inspector"
        },
        "totalInspecciones": 45,
        "completadas": 38,
        "pendientes": 7,
        "esteMes": 12
      },
      {
        "inspector": {
          "id": 5,
          "nombre": "Pedro Martínez Silva",
          "email": "pedro.martinez@municipio.gob",
          "role": "inspector"
        },
        "totalInspecciones": 42,
        "completadas": 35,
        "pendientes": 7,
        "esteMes": 10
      }
    ],
    "inspeccionesRecientes": [
      {
        "id": 243,
        "procedureNumber": "INS-2025-0243",
        "inspectionDate": "2025-10-07",
        "status": "Nuevo",
        "applicantType": "Persona Jurídica",
        "inspectores": ["María García López", "Pedro Martínez Silva"],
        "createdAt": "2025-10-07T15:30:00.000Z"
      }
    ]
  }
}
```

---

### 3. Estadísticas por Período

**Request:**
```bash
curl -X GET "http://localhost:3000/dashboard/stats/period?startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response Ejemplo:**
```json
{
  "periodo": {
    "inicio": "2025-09-01T00:00:00.000Z",
    "fin": "2025-09-30T23:59:59.999Z"
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

## Ejemplos de Integración Frontend

### React Hook Personalizado

```typescript
// hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface DashboardData {
  inspector?: any;
  resumen?: any;
  estadisticasPorEstado?: any;
  tareasPendientes?: any[];
  ultimasInspecciones?: any[];
  vistaAdministrativa?: any;
}

export const useDashboard = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const endpoint = user?.role === 'admin' 
          ? '/dashboard/admin' 
          : '/dashboard/inspector';

        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar el dashboard');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchDashboard();
    }
  }, [user, token]);

  return { data, loading, error };
};
```

### Componente Dashboard (React)

```typescript
// components/Dashboard.tsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { InspectorDashboard } from './InspectorDashboard';
import { AdminDashboard } from './AdminDashboard';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();

  if (loading) {
    return <Loader message="Cargando dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!data) {
    return <ErrorMessage message="No hay datos disponibles" />;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard - {data.inspector?.nombre || user?.name}</h1>
      
      {user?.role === 'admin' ? (
        <AdminDashboard 
          inspectorData={data.miDashboard} 
          adminData={data.vistaAdministrativa} 
        />
      ) : (
        <InspectorDashboard data={data} />
      )}
    </div>
  );
};
```

### Componente Inspector Dashboard

```typescript
// components/InspectorDashboard.tsx
import React from 'react';
import { StatsCard } from './StatsCard';
import { TaskList } from './TaskList';
import { InspectionList } from './InspectionList';
import { PieChart } from './charts/PieChart';

interface Props {
  data: any;
}

export const InspectorDashboard: React.FC<Props> = ({ data }) => {
  return (
    <div className="inspector-dashboard">
      {/* Resumen en Cards */}
      <div className="stats-grid">
        <StatsCard 
          title="Total Inspecciones" 
          value={data.resumen.totalInspecciones}
          icon="📋"
        />
        <StatsCard 
          title="Tareas Pendientes" 
          value={data.resumen.tareasPendientes}
          icon="⏳"
          variant="warning"
        />
        <StatsCard 
          title="Completadas Este Mes" 
          value={data.resumen.completadasEsteMes}
          icon="✅"
          variant="success"
        />
        <StatsCard 
          title="Esta Semana" 
          value={data.resumen.inspeccionesEstaSemana}
          icon="📅"
        />
      </div>

      {/* Gráfica de Estado */}
      <div className="chart-section">
        <h2>Estado de Inspecciones</h2>
        <PieChart 
          data={[
            { label: 'Nueva', value: data.estadisticasPorEstado.nueva, color: '#3498db' },
            { label: 'En Progreso', value: data.estadisticasPorEstado.enProgreso, color: '#f39c12' },
            { label: 'Revisada', value: data.estadisticasPorEstado.revisada, color: '#2ecc71' },
            { label: 'Archivada', value: data.estadisticasPorEstado.archivada, color: '#95a5a6' },
          ]}
        />
      </div>

      {/* Tareas Pendientes */}
      <div className="tasks-section">
        <h2>Tareas Pendientes ({data.tareasPendientes.length})</h2>
        <TaskList tasks={data.tareasPendientes} />
      </div>

      {/* Últimas Inspecciones */}
      <div className="recent-section">
        <h2>Últimas Inspecciones</h2>
        <InspectionList inspections={data.ultimasInspecciones} />
      </div>
    </div>
  );
};
```

### Componente Admin Dashboard

```typescript
// components/AdminDashboard.tsx
import React from 'react';
import { InspectorDashboard } from './InspectorDashboard';
import { StatsCard } from './StatsCard';
import { BarChart } from './charts/BarChart';
import { InspectorPerformanceTable } from './InspectorPerformanceTable';

interface Props {
  inspectorData: any;
  adminData: any;
}

export const AdminDashboard: React.FC<Props> = ({ inspectorData, adminData }) => {
  const { estadisticasGenerales, kpis, rendimientoPorInspector } = adminData;

  return (
    <div className="admin-dashboard">
      {/* Mi Dashboard Personal */}
      <section className="my-dashboard">
        <h2>Mi Dashboard Personal</h2>
        <InspectorDashboard data={inspectorData} />
      </section>

      <hr />

      {/* Vista Administrativa */}
      <section className="admin-view">
        <h2>Vista Administrativa</h2>

        {/* KPIs Principales */}
        <div className="kpis-grid">
          <StatsCard 
            title="Inspecciones Totales" 
            value={estadisticasGenerales.totalInspecciones}
            icon="📊"
          />
          <StatsCard 
            title="Inspectores Activos" 
            value={estadisticasGenerales.totalInspectores}
            icon="👥"
          />
          <StatsCard 
            title="Inspecciones Activas" 
            value={kpis.totalInspeccionesActivas}
            icon="🔥"
            variant="warning"
          />
          <StatsCard 
            title="Tasa de Completitud" 
            value={`${kpis.tasaCompletitud}%`}
            icon="🎯"
            variant="success"
          />
        </div>

        {/* Gráfica de Tipos de Aplicante */}
        <div className="chart-section">
          <h3>Distribución por Tipo de Aplicante</h3>
          <BarChart 
            data={[
              { label: 'Anónimo', value: adminData.estadisticasPorTipo.anonimo },
              { label: 'Persona Física', value: adminData.estadisticasPorTipo.personaFisica },
              { label: 'Persona Jurídica', value: adminData.estadisticasPorTipo.personaJuridica },
            ]}
          />
        </div>

        {/* Rendimiento por Inspector */}
        <div className="performance-section">
          <h3>Rendimiento por Inspector</h3>
          <InspectorPerformanceTable data={rendimientoPorInspector} />
        </div>
      </section>
    </div>
  );
};
```

---

## Ejemplos con Next.js (App Router)

### Página de Dashboard

```typescript
// app/dashboard/page.tsx
import { DashboardClient } from './DashboardClient';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <DashboardClient />;
}
```

### Cliente del Dashboard

```typescript
// app/dashboard/DashboardClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function DashboardClient() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      const endpoint = session?.user?.role === 'admin'
        ? '/api/dashboard/admin'
        : '/api/dashboard/inspector';

      const res = await fetch(endpoint);
      const data = await res.json();
      setDashboard(data);
    }

    if (session) {
      fetchDashboard();
    }
  }, [session]);

  // Render dashboard...
}
```

---

## Estadísticas por Período Personalizado

### Componente de Selector de Período

```typescript
// components/PeriodSelector.tsx
import React, { useState } from 'react';

export const PeriodSelector: React.FC = () => {
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-10-31');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/dashboard/stats/period?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="period-selector">
      <h2>Estadísticas por Período</h2>
      <div className="date-inputs">
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>hasta</span>
        <input 
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchStats} disabled={loading}>
          {loading ? 'Cargando...' : 'Consultar'}
        </button>
      </div>

      {stats && (
        <div className="stats-display">
          <h3>Total de Inspecciones: {stats.total}</h3>
          <div className="stats-breakdown">
            <h4>Por Estado:</h4>
            <ul>
              <li>Nueva: {stats.porEstado.nueva}</li>
              <li>En Progreso: {stats.porEstado.enProgreso}</li>
              <li>Revisada: {stats.porEstado.revisada}</li>
              <li>Archivada: {stats.porEstado.archivada}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Notas de Implementación

### Actualización en Tiempo Real (Opcional)

Para dashboards en tiempo real, considera usar WebSockets o Server-Sent Events:

```typescript
// Ejemplo con SSE
const eventSource = new EventSource('http://localhost:3000/dashboard/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setDashboard(data);
};
```

### Cache de Dashboard

Para mejorar el rendimiento, implementa caché:

```typescript
// Con React Query
import { useQuery } from '@tanstack/react-query';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
};
```
