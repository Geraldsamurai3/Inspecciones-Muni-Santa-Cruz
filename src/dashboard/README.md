# 📊 Dashboard Module

Módulo de dashboard para el sistema de inspecciones municipales de Santa Cruz. Proporciona vistas diferenciadas para inspectores y administradores.

## 🎯 Funcionalidades

### Para Inspectores
- Vista de sus propias inspecciones asignadas
- Estadísticas personales de productividad
- Lista de tareas pendientes
- Resumen de actividad semanal y mensual

### Para Administradores
- Todo lo anterior (como inspector)
- Vista general del sistema completo
- Rendimiento por inspector
- KPIs del sistema
- Estadísticas generales

## 📡 Endpoints

### 1. Dashboard del Inspector
```http
GET /dashboard/inspector
Authorization: Bearer <token>
```

**Respuesta:**
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
    "tareasPendientes": 8,
    "completadasEsteMes": 12,
    "inspeccionesEsteMes": 15,
    "inspeccionesEstaSemana": 3
  },
  "estadisticasPorEstado": {
    "nueva": 5,
    "enProgreso": 3,
    "revisada": 32,
    "archivada": 5
  },
  "tareasPendientes": [
    {
      "id": 123,
      "procedureNumber": "INS-2025-001",
      "inspectionDate": "2025-10-10",
      "status": "Nuevo",
      "applicantType": "Persona Física",
      "createdAt": "2025-10-06T10:00:00.000Z"
    }
  ],
  "ultimasInspecciones": [...]
}
```

### 2. Dashboard del Administrador
```http
GET /dashboard/admin
Authorization: Bearer <token>
```

**Requisito:** Usuario debe tener `role: "admin"`

**Respuesta:**
```json
{
  "miDashboard": {
    // ... mismo formato que dashboard del inspector
  },
  "vistaAdministrativa": {
    "estadisticasGenerales": {
      "totalInspecciones": 250,
      "totalInspectores": 10,
      "nueva": 45,
      "enProgreso": 30,
      "revisada": 150,
      "archivada": 25
    },
    "kpis": {
      "totalInspeccionesActivas": 75,
      "totalInspeccionesRevisadas": 150,
      "totalInspeccionesArchivadas": 25,
      "promedioInspeccionesPorInspector": 25,
      "inspeccionesEsteMes": 45,
      "tasaCompletitud": 60
    },
    "estadisticasPorTipo": {
      "anonimo": 20,
      "personaFisica": 150,
      "personaJuridica": 80
    },
    "rendimientoPorInspector": [
      {
        "inspector": {
          "id": 2,
          "nombre": "María López",
          "email": "maria@example.com",
          "role": "inspector"
        },
        "totalInspecciones": 35,
        "completadas": 28,
        "pendientes": 7,
        "esteMes": 8
      }
    ],
    "inspeccionesRecientes": [...]
  }
}
```

### 3. Estadísticas por Período
```http
GET /dashboard/stats/period?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (required): Fecha de inicio en formato YYYY-MM-DD
- `endDate` (required): Fecha de fin en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "periodo": {
    "inicio": "2025-10-01T00:00:00.000Z",
    "fin": "2025-10-31T23:59:59.999Z"
  },
  "total": 45,
  "porEstado": {
    "nueva": 8,
    "enProgreso": 5,
    "revisada": 28,
    "archivada": 4
  },
  "porTipo": {
    "anonimo": 5,
    "personaFisica": 25,
    "personaJuridica": 15
  }
}
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT Bearer token.

El endpoint `/dashboard/admin` además valida que el usuario tenga `role: "admin"`.

## 📊 KPIs Incluidos

### Para Inspectores
- **Total de Inspecciones**: Número total de inspecciones asignadas
- **Tareas Pendientes**: Inspecciones en estado "Nuevo" o "En proceso"
- **Productividad del Mes**: Inspecciones revisadas este mes
- **Actividad Semanal**: Inspecciones de la semana actual

### Para Administradores
- **Inspecciones Activas**: Nuevas + En proceso
- **Tasa de Completitud**: % de inspecciones revisadas
- **Promedio por Inspector**: Total de inspecciones / número de inspectores
- **Rendimiento del Equipo**: Ranking de inspectores por completitud

## 🎨 Uso desde el Frontend

### Ejemplo con React/Next.js
```typescript
// Hook personalizado para dashboard
const useDashboard = (role: 'inspector' | 'admin') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const endpoint = role === 'admin' ? '/dashboard/admin' : '/dashboard/inspector';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setData(data);
      setLoading(false);
    };

    fetchDashboard();
  }, [role]);

  return { data, loading };
};

// Componente Dashboard
const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading } = useDashboard(user.role);

  if (loading) return <Loader />;

  if (user.role === 'admin') {
    return (
      <div>
        <InspectorSection data={data.miDashboard} />
        <AdminSection data={data.vistaAdministrativa} />
      </div>
    );
  }

  return <InspectorSection data={data} />;
};
```

## 🧪 Testing

```bash
# Ejecutar tests del módulo dashboard
npm test -- dashboard

# Con cobertura
npm run test:cov -- dashboard
```

## 📈 Métricas de Rendimiento

El dashboard está optimizado para:
- Respuesta rápida con queries eficientes
- Cálculos en memoria para estadísticas
- Uso de relaciones eager cuando es necesario

## 🔄 Actualizaciones Futuras

Posibles mejoras:
- [ ] Cache de estadísticas (Redis)
- [ ] Gráficas de tendencias temporales
- [ ] Exportación de reportes PDF
- [ ] Notificaciones de alertas
- [ ] Dashboard en tiempo real con WebSockets
- [ ] Comparativas año vs año
- [ ] Filtros avanzados por zona/tipo

## 📝 Notas Técnicas

- Los estados de inspección son: `Nuevo`, `En proceso`, `Revisado`, `Archivado`
- Los tipos de aplicante son: `Anonimo`, `Persona Física`, `Persona Jurídica`
- Las fechas se manejan en formato ISO 8601
- Los cálculos de "este mes" y "esta semana" usan la zona horaria del servidor
