# 🎯 Guía Rápida: Implementar Modal con Papelera

## ✨ Cambios Implementados en Backend

### **Estados Disponibles:**
- ✅ **Nuevo** - Estado inicial
- ✅ **En Proceso** - Inspector trabajando
- ✅ **Revisado** - Admin revisó
- ✅ **Archivado** - Auto-archivado (7 días)
- 🗑️ **Papelera** - Soft delete

---

## 🚀 Endpoints para el Modal

### **1. Cambiar Estado (En Proceso / Revisado)**
```http
PATCH /inspections/:id/status
Content-Type: application/json

{
  "status": "En proceso"  // o "Revisado"
}
```

### **2. Mover a Papelera**
```http
PATCH /inspections/:id/trash
```

### **3. Restaurar desde Papelera**
```http
PATCH /inspections/:id/restore
```

---

## 💻 Código Frontend - Modal de Inspección

```typescript
// components/InspectionModal.tsx
import { useState } from 'react';
import { toast } from 'react-toastify';

interface InspectionModalProps {
  inspection: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function InspectionModal({
  inspection,
  isOpen,
  onClose,
  onUpdate
}: InspectionModalProps) {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  // Cambiar estado (En Proceso / Revisado)
  const handleChangeStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/inspections/${inspection.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        toast.success(`Estado cambiado a: ${newStatus}`);
        onUpdate(); // Recargar lista
        onClose();  // Cerrar modal
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al cambiar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Mover a papelera
  const handleMoveToTrash = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de mover esta inspección a la papelera?'
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/inspections/${inspection.id}/trash`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al mover a papelera');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Inspección #{inspection.procedureNumber}</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Estado Actual */}
          <div className="status-badge">
            <strong>Estado Actual:</strong>
            <span className={`badge badge-${inspection.status.toLowerCase()}`}>
              {inspection.status}
            </span>
          </div>

          {/* Información */}
          <div className="inspection-info">
            <p><strong>Fecha:</strong> {inspection.inspectionDate}</p>
            <p><strong>Inspectores:</strong> {
              inspection.inspectors?.map((i: any) => 
                `${i.firstName} ${i.lastName}`
              ).join(', ')
            }</p>
          </div>

          {/* Acciones */}
          <div className="modal-actions">
            <h3>Cambiar Estado:</h3>

            {/* Botón: En Proceso */}
            <button
              onClick={() => handleChangeStatus('En proceso')}
              disabled={loading || inspection.status === 'En proceso'}
              className="btn btn-primary"
            >
              📝 Marcar como En Proceso
            </button>

            {/* Botón: Revisado */}
            <button
              onClick={() => handleChangeStatus('Revisado')}
              disabled={loading || inspection.status === 'Revisado'}
              className="btn btn-success"
            >
              ✅ Marcar como Revisado
            </button>

            {/* Separador */}
            <hr />

            {/* Botón: Papelera */}
            <button
              onClick={handleMoveToTrash}
              disabled={loading}
              className="btn btn-danger"
            >
              🗑️ Mover a Papelera
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Estilos CSS del Modal

```css
/* modal.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.close-btn:hover {
  color: #111827;
}

.modal-body {
  padding: 20px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-nuevo {
  background: #dbeafe;
  color: #1e40af;
}

.badge-en.proceso {
  background: #fef3c7;
  color: #92400e;
}

.badge-revisado {
  background: #d1fae5;
  color: #065f46;
}

.inspection-info {
  margin-bottom: 20px;
}

.inspection-info p {
  margin: 8px 0;
}

.modal-actions {
  margin-top: 20px;
}

.modal-actions h3 {
  margin-bottom: 15px;
  font-size: 1.125rem;
}

.modal-actions hr {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.btn {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.modal-footer .btn {
  width: auto;
  padding: 8px 24px;
}
```

---

## 📋 Lista de Inspecciones (Uso del Modal)

```typescript
// pages/inspections.tsx
import { useState, useEffect } from 'react';
import InspectionModal from '@/components/InspectionModal';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadInspections = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/inspections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      setInspections(data);
    }
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const handleOpenModal = (inspection: any) => {
    setSelectedInspection(inspection);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInspection(null);
  };

  return (
    <div className="inspections-page">
      <h1>Inspecciones</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nº Trámite</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((inspection: any) => (
            <tr key={inspection.id}>
              <td>{inspection.id}</td>
              <td>{inspection.procedureNumber}</td>
              <td>{inspection.inspectionDate}</td>
              <td>
                <span className={`badge badge-${inspection.status.toLowerCase()}`}>
                  {inspection.status}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => handleOpenModal(inspection)}
                  className="btn-small btn-primary"
                >
                  Ver Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {selectedInspection && (
        <InspectionModal
          inspection={selectedInspection}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={loadInspections}
        />
      )}
    </div>
  );
}
```

---

## 🗑️ Página de Papelera

```typescript
// pages/trash.tsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function TrashPage() {
  const [trashedInspections, setTrashedInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('authToken');

  const loadTrash = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/inspections/trash/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTrashedInspections(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/inspections/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        loadTrash();
      }
    } catch (error) {
      toast.error('Error al restaurar');
    }
  };

  const handleDeletePermanently = async (id: number) => {
    const confirmed = window.confirm(
      '⚠️ ADVERTENCIA: Esta acción eliminará permanentemente la inspección. ¿Continuar?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/inspections/${id}/permanent`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Eliminado permanentemente');
        loadTrash();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="trash-page">
      <h1>🗑️ Papelera</h1>

      {trashedInspections.length === 0 ? (
        <div className="empty-state">
          <p>La papelera está vacía</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nº Trámite</th>
              <th>Fecha</th>
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
                    className="btn-small btn-success"
                  >
                    ↩️ Restaurar
                  </button>
                  <button
                    onClick={() => handleDeletePermanently(inspection.id)}
                    className="btn-small btn-danger"
                  >
                    ❌ Eliminar
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

## 📝 Resumen de Acciones

| Acción | Endpoint | Método |
|--------|----------|--------|
| Marcar En Proceso | `/inspections/:id/status` | PATCH |
| Marcar Revisado | `/inspections/:id/status` | PATCH |
| Mover a Papelera | `/inspections/:id/trash` | PATCH |
| Restaurar | `/inspections/:id/restore` | PATCH |
| Eliminar Permanente | `/inspections/:id/permanent` | DELETE |

---

## ✅ Checklist de Implementación

- [ ] Crear componente `InspectionModal.tsx`
- [ ] Agregar estilos CSS
- [ ] Integrar modal en lista de inspecciones
- [ ] Crear página de papelera
- [ ] Agregar enlace a papelera en menú
- [ ] Instalar `react-toastify` para notificaciones
- [ ] Probar cambio de estados
- [ ] Probar mover a papelera
- [ ] Probar restaurar
- [ ] Probar eliminar permanente

---

**¡Todo listo para implementar en el frontend!** 🚀
