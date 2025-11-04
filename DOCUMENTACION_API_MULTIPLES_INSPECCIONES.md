# Documentación de API - Manejo de Múltiples Inspecciones

## Problema Resuelto
Ahora el sistema maneja correctamente casos donde existen múltiples inspecciones con el mismo número de trámite, permitiendo seleccionar cuál inspección específica usar.

---

## Endpoints Disponibles

### 1. Buscar Inspecciones por Número de Trámite
**Endpoint:** `GET /reports/inspections?procedureNumber={numero}`

**Descripción:** Retorna TODAS las inspecciones que tienen el mismo número de trámite.

**Ejemplo Request:**
```
GET http://localhost:3000/reports/inspections?procedureNumber=3333333
```

**Respuesta cuando hay UNA sola inspección:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 5,
      "procedureNumber": "3333333",
      "inspectionDate": "2025-10-15",
      "status": "Completada",
      "applicantType": "Persona Física",
      "inspectors": [...],
      "construction": {...},
      "location": {...}
    }
  ]
}
```

**Respuesta cuando hay MÚLTIPLES inspecciones:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 5,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-29",
      ...
    },
    {
      "id": 3,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-20",
      ...
    },
    {
      "id": 1,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-15",
      ...
    }
  ],
  "message": "Se encontraron 3 inspecciones con este número de trámite. Use el ID específico para operaciones individuales."
}
```

---

### 2. Buscar Inspección Específica por ID
**Endpoint:** `GET /reports/inspections/by-id/{id}`

**Descripción:** Obtiene una inspección específica usando su ID único.

**Ejemplo Request:**
```
GET http://localhost:3000/reports/inspections/by-id/5
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "procedureNumber": "3333333",
    "inspectionDate": "2025-10-15",
    "status": "Completada"
  }
}
```

---

### 3. Generar PDF por Número de Trámite
**Endpoint:** `GET /reports/inspections/{procedureNumber}/pdf`

**Descripción:** Genera PDF de la inspección. Si hay múltiples inspecciones con ese número, devuelve error con lista de opciones.

**Caso 1 - Una sola inspección:**
```
GET http://localhost:3000/reports/inspections/3333333/pdf
```
**Respuesta:** Descarga el PDF directamente

---

**Caso 2 - Múltiples inspecciones:**
```
GET http://localhost:3000/reports/inspections/3333333/pdf
```

**Respuesta (HTTP 409 Conflict):**
```json
{
  "message": "Se encontraron 3 inspecciones con este número de trámite",
  "count": 3,
  "inspections": [
    {
      "id": 5,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-29T10:30:00.000Z",
      "inspectionDate": "2025-10-29",
      "status": "Completada",
      "applicantType": "Persona Física"
    },
    {
      "id": 3,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-20T14:15:00.000Z",
      "inspectionDate": "2025-10-20",
      "status": "En Proceso",
      "applicantType": "Persona Física"
    },
    {
      "id": 1,
      "procedureNumber": "3333333",
      "createdAt": "2025-10-15T09:00:00.000Z",
      "inspectionDate": "2025-10-15",
      "status": "Completada",
      "applicantType": "Anónimo"
    }
  ],
  "suggestion": "Use /reports/inspections/by-id/:id/pdf para generar PDF de una inspección específica"
}
```

---

### 4. Generar PDF por ID Específico
**Endpoint:** `GET /reports/inspections/by-id/{id}/pdf`

**Descripción:** Genera PDF de una inspección específica usando su ID único.

**Ejemplo Request:**
```
GET http://localhost:3000/reports/inspections/by-id/5/pdf
```

**Respuesta:** Descarga el PDF con nombre `inspeccion_3333333_id5_2025-10-29.pdf`

---

## Flujo Recomendado en el Frontend

### Opción A: Búsqueda Simple
```javascript
// 1. Usuario ingresa número de trámite
const procedureNumber = "3333333";

// 2. Buscar inspecciones
const response = await fetch(`/reports/inspections?procedureNumber=${procedureNumber}`);
const result = await response.json();

// 3. Verificar cantidad
if (result.count === 1) {
  // Solo una inspección, mostrar directamente
  mostrarInspeccion(result.data[0]);
} else if (result.count > 1) {
  // Múltiples inspecciones, mostrar selector
  mostrarSelectorInspecciones(result.data);
}
```

### Opción B: Generar PDF Directo
```javascript
// 1. Intentar generar PDF por número de trámite
const response = await fetch(`/reports/inspections/${procedureNumber}/pdf`);

// 2. Verificar respuesta
if (response.ok) {
  // PDF generado exitosamente
  descargarPDF(response);
} else if (response.status === 409) {
  // Múltiples inspecciones encontradas
  const data = await response.json();
  
  // Mostrar modal/selector con las opciones
  mostrarModalSeleccion(data.inspections);
  
  // Cuando usuario seleccione uno:
  const idSeleccionado = 5;
  window.open(`/reports/inspections/by-id/${idSeleccionado}/pdf`);
}
```

---

## Componente de Ejemplo (React/Vue)

```javascript
// Ejemplo en React
const InspeccionSelector = ({ procedureNumber }) => {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarInspecciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/inspections?procedureNumber=${procedureNumber}`);
      const data = await res.json();
      
      if (data.count === 1) {
        // Ir directo a la inspección
        navegarA(`/inspeccion/${data.data[0].id}`);
      } else {
        // Mostrar selector
        setInspecciones(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = (id) => {
    window.open(`/api/reports/inspections/by-id/${id}/pdf`, '_blank');
  };

  return (
    <div>
      {inspecciones.length > 1 && (
        <div className="selector">
          <h3>Se encontraron {inspecciones.length} inspecciones</h3>
          <p>Seleccione la inspección que desea ver:</p>
          <ul>
            {inspecciones.map(insp => (
              <li key={insp.id}>
                <div>
                  <strong>ID: {insp.id}</strong>
                  <p>Fecha: {insp.inspectionDate}</p>
                  <p>Estado: {insp.status}</p>
                  <p>Tipo: {insp.applicantType}</p>
                </div>
                <button onClick={() => descargarPDF(insp.id)}>
                  Descargar PDF
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

## Resumen de Cambios

✅ **Nuevo:** Endpoint para buscar todas las inspecciones por número (`GET /reports/inspections?procedureNumber=XXX`)

✅ **Nuevo:** Endpoint para buscar por ID específico (`GET /reports/inspections/by-id/:id`)

✅ **Nuevo:** Endpoint para generar PDF por ID (`GET /reports/inspections/by-id/:id/pdf`)

✅ **Modificado:** El endpoint de PDF por número ahora retorna HTTP 409 si hay múltiples inspecciones, con lista de opciones

✅ **Orden:** Todas las búsquedas ordenan por fecha de creación descendente (más recientes primero)

---

## Notas Importantes

1. **Backward Compatibility:** Si solo hay UNA inspección con un número de trámite, todo funciona como antes (sin cambios necesarios en frontend)

2. **Ordenamiento:** Las inspecciones siempre se retornan ordenadas de más reciente a más antigua

3. **Códigos HTTP:**
   - `200 OK`: Operación exitosa
   - `404 NOT FOUND`: No se encontró inspección
   - `409 CONFLICT`: Múltiples inspecciones encontradas (requiere selección)

4. **Nombres de Archivo PDF:** Ahora incluyen el ID cuando se genera por ID específico:
   - Por número: `inspeccion_3333333_2025-10-29.pdf`
   - Por ID: `inspeccion_3333333_id5_2025-10-29.pdf`

---

## Contacto
Para cualquier duda o aclaración, contactar al equipo de backend.
