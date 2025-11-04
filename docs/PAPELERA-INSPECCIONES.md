# 🗑️ Sistema de Papelera para Inspecciones

## 📋 Descripción

Se ha implementado un sistema de **papelera (soft delete)** para las inspecciones, permitiendo:
- Mover inspecciones a la papelera
- Restaurar inspecciones desde la papelera
- Eliminar permanentemente inspecciones desde la papelera
- Cambiar estados: **Nuevo** → **En Proceso** → **Revisado** → **Papelera**

---

## 🎯 Estados de Inspección

```typescript
enum InspectionStatus {
  NEW         = 'Nuevo',        // Estado inicial
  IN_PROGRESS = 'En proceso',   // Inspector trabajando
  REVIEWED    = 'Revisado',     // Admin revisó
  ARCHIVED    = 'Archivado',    // Auto-archivado después de 7 días
  TRASHED     = 'Papelera'      // ✨ NUEVO: Soft delete
}
```

---

## 🔄 Flujo de Estados

```
┌─────────────┐
│    Nuevo    │ (Estado inicial)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ En Proceso  │ (Inspector trabajando)
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────┐
│  Revisado   │  │ Papelera │ (Soft delete)
└──────┬──────┘  └────┬─────┘
       │              │
       │              ├─────► Restaurar → Nuevo
       │              │
       ▼              ▼
   Archivado    Eliminar Permanente
  (Automático)    (No reversible)
```

---

## 🚀 Endpoints Disponibles

### **1. Listar Inspecciones Activas**
```http
GET /inspections
```

**Descripción:** Devuelve todas las inspecciones **excepto** las que están en papelera.

**Response:**
```json
[
  {
    "id": 1,
    "status": "Nuevo",
    "procedureNumber": "INSP-001",
    "inspectionDate": "2025-10-20",
    "deletedAt": null,
    ...
  }
]
```

---

### **2. Listar Inspecciones en Papelera**
```http
GET /inspections/trash/list
```

**Descripción:** Devuelve **solo** las inspecciones que están en la papelera.

**Response:**
```json
[
  {
    "id": 5,
    "status": "Papelera",
    "procedureNumber": "INSP-005",
    "deletedAt": "2025-10-20T10:30:00.000Z",
    ...
  }
]
```

---

### **3. Cambiar Estado de Inspección**
```http
PATCH /inspections/:id/status
Content-Type: application/json

{
  "status": "En proceso"  // o "Revisado"
}
```

**Valores permitidos:**
- `"Nuevo"`
- `"En proceso"`
- `"Revisado"`
- ❌ `"Archivado"` - Solo el sistema puede asignarlo
- ❌ `"Papelera"` - Usar endpoint específico

**Response:**
```json
{
  "id": 1,
  "status": "En proceso",
  "reviewedAt": null,
  ...
}
```

**Ejemplo Frontend:**
```typescript
const changeStatus = async (inspectionId: number, newStatus: string) => {
  const response = await fetch(`/inspections/${inspectionId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: newStatus })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Estado actualizado:', data.status);
  }
};

// Uso
changeStatus(1, 'En proceso');
changeStatus(1, 'Revisado');
```

---

### **4. Mover a Papelera**
```http
PATCH /inspections/:id/trash
```

**Descripción:** Mueve la inspección a la papelera (soft delete).

**Response:**
```json
{
  "message": "Inspección movida a la papelera",
  "id": 1,
  "deletedAt": "2025-10-20T10:30:00.000Z"
}
```

**Ejemplo Frontend:**
```typescript
const moveToTrash = async (inspectionId: number) => {
  const confirmed = confirm('¿Mover esta inspección a la papelera?');
  
  if (!confirmed) return;

  const response = await fetch(`/inspections/${inspectionId}/trash`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    alert(data.message);
    // Recargar lista
    loadInspections();
  }
};
```

---

### **5. Restaurar desde Papelera**
```http
PATCH /inspections/:id/restore
```

**Descripción:** Restaura la inspección desde la papelera al estado "Nuevo".

**Response:**
```json
{
  "message": "Inspección restaurada desde la papelera",
  "id": 1,
  "status": "Nuevo"
}
```

**Ejemplo Frontend:**
```typescript
const restoreFromTrash = async (inspectionId: number) => {
  const response = await fetch(`/inspections/${inspectionId}/restore`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    alert(data.message);
    // Recargar papelera
    loadTrash();
  }
};
```

---

### **6. Eliminar Permanentemente**
```http
DELETE /inspections/:id/permanent
```

**Descripción:** Elimina **permanentemente** la inspección. Solo funciona si está en papelera.

**⚠️ ADVERTENCIA:** Esta acción **NO es reversible**.

**Response:**
```
204 No Content
```

**Ejemplo Frontend:**
```typescript
const deletePermanently = async (inspectionId: number) => {
  const confirmed = confirm(
    '⚠️ ADVERTENCIA: Esta acción eliminará permanentemente la inspección y NO se podrá recuperar. ¿Continuar?'
  );
  
  if (!confirmed) return;

  const doubleCheck = confirm('¿Estás COMPLETAMENTE seguro?');
  
  if (!doubleCheck) return;

  const response = await fetch(`/inspections/${inspectionId}/permanent`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    alert('Inspección eliminada permanentemente');
    loadTrash();
  }
};
```

---

## 🎨 Componente Modal de Inspección (Ejemplo)

```typescript
// components/InspectionModal.tsx
import { useState } from 'react';

interface InspectionModalProps {
  inspection: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function InspectionModal({ 
  inspection, 
  onClose, 
  onUpdate 
}: InspectionModalProps) {
  const [loading, setLoading] = useState(false);

  const handleChangeStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inspections/${inspection.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Estado cambiado a: ${newStatus}`);
        onUpdate();
        onClose();
      }
    } catch (error) {
      alert('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToTrash = async () => {
    const confirmed = confirm('¿Mover a papelera?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/inspections/${inspection.id}/trash`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Movido a papelera');
        onUpdate();
        onClose();
      }
    } catch (error) {
      alert('Error al mover a papelera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Inspección #{inspection.procedureNumber}</h2>
        
        <div className="current-status">
          <strong>Estado Actual:</strong> {inspection.status}
        </div>

        <div className="actions">
          <h3>Cambiar Estado:</h3>
          
          <button 
            onClick={() => handleChangeStatus('En proceso')}
            disabled={loading || inspection.status === 'En proceso'}
            className="btn-primary"
          >
            📝 Marcar En Proceso
          </button>

          <button 
            onClick={() => handleChangeStatus('Revisado')}
            disabled={loading || inspection.status === 'Revisado'}
            className="btn-success"
          >
            ✅ Marcar como Revisado
          </button>

          <button 
            onClick={handleMoveToTrash}
            disabled={loading}
            className="btn-danger"
          >
            🗑️ Mover a Papelera
          </button>
        </div>

        <button onClick={onClose} className="btn-cancel">
          Cerrar
        </button>
      </div>
    </div>
  );
}
```

---

## 📱 Componente de Papelera

```typescript
// pages/trash.tsx
import { useState, useEffect } from 'react';

export default function TrashPage() {
  const [trashedInspections, setTrashedInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inspections/trash/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrashedInspections(data);
      }
    } catch (error) {
      console.error('Error al cargar papelera:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const response = await fetch(`/api/inspections/${id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Inspección restaurada');
        loadTrash();
      }
    } catch (error) {
      alert('Error al restaurar');
    }
  };

  const handleDeletePermanently = async (id: number) => {
    const confirmed = confirm(
      '⚠️ Esta acción NO se puede deshacer. ¿Eliminar permanentemente?'
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/inspections/${id}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('Eliminado permanentemente');
        loadTrash();
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="trash-page">
      <h1>🗑️ Papelera de Inspecciones</h1>
      
      {trashedInspections.length === 0 ? (
        <p>La papelera está vacía</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nº Trámite</th>
              <th>Fecha Inspección</th>
              <th>Eliminado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trashedInspections.map((inspection: any) => (
              <tr key={inspection.id}>
                <td>{inspection.id}</td>
                <td>{inspection.procedureNumber}</td>
                <td>{inspection.inspectionDate}</td>
                <td>{new Date(inspection.deletedAt).toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => handleRestore(inspection.id)}
                    className="btn-success"
                  >
                    ↩️ Restaurar
                  </button>
                  <button 
                    onClick={() => handleDeletePermanently(inspection.id)}
                    className="btn-danger"
                  >
                    ❌ Eliminar Permanente
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 🔒 Validaciones de Seguridad

### **Backend valida:**

1. ✅ **No se puede mover a papelera si ya está en papelera**
2. ✅ **No se puede restaurar si no está en papelera**
3. ✅ **Solo se puede eliminar permanentemente si está en papelera**
4. ✅ **No se puede cambiar estado a "Papelera" desde endpoint de estado**
5. ✅ **"Archivado" solo lo asigna el sistema automáticamente**

---

## 📊 Base de Datos

### **Campos Agregados:**

```typescript
// Entity: Inspection
@Column({ type: 'timestamp', nullable: true })
deletedAt?: Date | null;  // ✨ NUEVO: Timestamp de eliminación
```

### **Migración SQL:**

```sql
ALTER TABLE inspections 
ADD COLUMN deletedAt TIMESTAMP NULL;

-- Actualizar enum de status
ALTER TABLE inspections 
MODIFY COLUMN status ENUM('Nuevo', 'En proceso', 'Revisado', 'Archivado', 'Papelera') 
DEFAULT 'Nuevo';
```

---

## 🧪 Casos de Prueba

### **Test 1: Mover a Papelera**
```bash
PATCH /inspections/1/trash

# Resultado esperado:
{
  "message": "Inspección movida a la papelera",
  "id": 1,
  "deletedAt": "2025-10-20T10:30:00.000Z"
}

# Verificar:
GET /inspections
# No debe incluir inspección con id=1

GET /inspections/trash/list
# Debe incluir inspección con id=1
```

### **Test 2: Restaurar**
```bash
PATCH /inspections/1/restore

# Resultado esperado:
{
  "message": "Inspección restaurada desde la papelera",
  "id": 1,
  "status": "Nuevo"
}

# Verificar:
GET /inspections
# Debe incluir inspección con id=1
```

### **Test 3: Eliminar Permanentemente**
```bash
DELETE /inspections/1/permanent

# Resultado esperado: 204 No Content

# Verificar:
GET /inspections/1
# 404 Not Found
```

---

## 📝 Notas Importantes

1. **Soft Delete:** Las inspecciones en papelera NO se eliminan de la base de datos
2. **Restauración:** Al restaurar, el estado vuelve a "Nuevo"
3. **Eliminación Permanente:** Solo desde papelera, no es reversible
4. **Lista Principal:** `GET /inspections` excluye papelera automáticamente
5. **Estado Archivado:** Sigue funcionando automáticamente después de 7 días de revisado

---

## 🎯 Resumen de URLs

| Acción | Método | Endpoint |
|--------|--------|----------|
| Listar activas | GET | `/inspections` |
| Listar papelera | GET | `/inspections/trash/list` |
| Cambiar estado | PATCH | `/inspections/:id/status` |
| Mover a papelera | PATCH | `/inspections/:id/trash` |
| Restaurar | PATCH | `/inspections/:id/restore` |
| Eliminar permanente | DELETE | `/inspections/:id/permanent` |

---

**Fecha de implementación:** Octubre 20, 2025  
**Versión:** 1.2.0
