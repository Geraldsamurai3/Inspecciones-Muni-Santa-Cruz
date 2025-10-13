# 🆕 Nuevas Funcionalidades para Frontend

## 📋 Resumen Ejecutivo

Se han agregado **3 nuevos tipos de inspecciones** al sistema que requieren implementación en el frontend:

1. **Collection** (Cobros/Notificaciones)
2. **Revenue Patent** (Patentes de Ingresos)
3. **Work Closure** (Cierres de Obra)

---

## 🎯 Endpoint Principal

Todas estas nuevas funcionalidades se envían al mismo endpoint de inspecciones:

```
POST /inspections
```

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 1️⃣ Collection (Cobros/Notificaciones)

### 📝 Descripción
Sistema para registrar intentos de cobro/notificación con diferentes estados (nadie presente, dirección incorrecta, etc.)

### 🔧 Campo en la Inspección
```typescript
collection?: Collection
```

### 📊 Estructura TypeScript

```typescript
interface Collection {
  // Firma del notificador (puede ser URL de imagen o data URI)
  notifierSignatureUrl?: string;        // Máximo 500 caracteres
  
  // ⚠️ IMPORTANTE: Estos campos son checkboxes
  // Enviar "X" cuando está marcado, omitir o null cuando no está marcado
  nobodyPresent?: "X";                  // "No había nadie"
  wrongAddress?: "X";                   // "Dirección incorrecta"
  movedAddress?: "X";                   // "Cambió domicilio"
  refusedToSign?: "X";                  // "No quiso firmar"
  notLocated?: "X";                     // "No se localiza"
  
  // Campo de texto libre
  other?: string;                       // Máximo 300 caracteres
}
```

### 📤 Ejemplo de Request

```json
{
  "type": "collection",
  "inspectorIds": [1],
  "collection": {
    "notifierSignatureUrl": "https://cloudinary.com/signatures/firma123.png",
    "nobodyPresent": "X",
    "wrongAddress": null,
    "movedAddress": null,
    "refusedToSign": null,
    "notLocated": null,
    "other": "El vecino mencionó que regresa el lunes"
  }
}
```

### ✅ Validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `notifierSignatureUrl` | string | No | Máximo 500 caracteres |
| `nobodyPresent` | string | No | Solo acepta "X" o "x" |
| `wrongAddress` | string | No | Solo acepta "X" o "x" |
| `movedAddress` | string | No | Solo acepta "X" o "x" |
| `refusedToSign` | string | No | Solo acepta "X" o "x" |
| `notLocated` | string | No | Solo acepta "X" o "x" |
| `other` | string | No | Máximo 300 caracteres |

### 🎨 Componente React Sugerido

```tsx
import React, { useState } from 'react';

interface CollectionFormProps {
  onChange: (data: Collection) => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ onChange }) => {
  const [data, setData] = useState<Collection>({});

  const handleCheckboxChange = (field: string, checked: boolean) => {
    const newData = {
      ...data,
      [field]: checked ? "X" : undefined
    };
    setData(newData);
    onChange(newData);
  };

  return (
    <div className="collection-form">
      {/* Firma del notificador */}
      <div className="form-group">
        <label>Firma del Notificador</label>
        <input 
          type="text"
          placeholder="URL de la firma"
          maxLength={500}
          value={data.notifierSignatureUrl || ''}
          onChange={(e) => {
            const newData = { ...data, notifierSignatureUrl: e.target.value };
            setData(newData);
            onChange(newData);
          }}
        />
      </div>

      {/* Checkboxes */}
      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={data.nobodyPresent === "X"}
            onChange={(e) => handleCheckboxChange('nobodyPresent', e.target.checked)}
          />
          No había nadie
        </label>
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={data.wrongAddress === "X"}
            onChange={(e) => handleCheckboxChange('wrongAddress', e.target.checked)}
          />
          Dirección incorrecta
        </label>
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={data.movedAddress === "X"}
            onChange={(e) => handleCheckboxChange('movedAddress', e.target.checked)}
          />
          Cambió domicilio
        </label>
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={data.refusedToSign === "X"}
            onChange={(e) => handleCheckboxChange('refusedToSign', e.target.checked)}
          />
          No quiso firmar
        </label>
      </div>

      <div className="form-group">
        <label>
          <input 
            type="checkbox"
            checked={data.notLocated === "X"}
            onChange={(e) => handleCheckboxChange('notLocated', e.target.checked)}
          />
          No se localiza
        </label>
      </div>

      {/* Campo "Otro" */}
      <div className="form-group">
        <label>Otro</label>
        <textarea
          maxLength={300}
          value={data.other || ''}
          onChange={(e) => {
            const newData = { ...data, other: e.target.value };
            setData(newData);
            onChange(newData);
          }}
          placeholder="Observaciones adicionales..."
        />
      </div>
    </div>
  );
};

export default CollectionForm;
```

---

## 2️⃣ Revenue Patent (Patentes de Ingresos)

### 📝 Descripción
Gestión de patentes comerciales y licencias de licores con información de zonificación y distancias a centros sensibles.

### 🔧 Campo en la Inspección
```typescript
revenuePatent?: RevenuePatent
```

### 📊 Estructura TypeScript

```typescript
// Enums necesarios
enum LicenseType {
  LIQUOR_LICENSE = 'licencia_licores',      // Licencia de licores
  COMMERCIAL_LICENSE = 'licencia_comercial' // Licencia comercial
}

enum ZoneDemarcationOption {
  ACCORDING_TO_LAND_USE = 'segun_uso_suelo',           // Según uso de suelo
  ACCORDING_TO_REGULATORY_PLAN = 'segun_plan_regulatorio' // Según plan regulador
}

enum RegulatoryPlanConformityOption {
  ACCORDING_TO_REGULATORY_PLAN = 'segun_plan_regulatorio', // Según plan regulador
  NOT_APPLICABLE = 'no_aplicable'                          // No aplicable
}

interface RevenuePatent {
  // Información básica (REQUERIDO)
  tradeName: string;                      // Nombre comercial (máx 200 caracteres)
  licenseType: LicenseType;               // Tipo de licencia (REQUERIDO)
  
  // Identificadores de propiedad (OPCIONALES)
  propertyNumber?: string;                // Número de finca (máx 50)
  cadastralNumber?: string;               // Número de catastro (máx 50)
  landUseReference?: string;              // Referencia de uso de suelo (máx 50)
  
  // Distancias a centros sensibles (OPCIONALES)
  // ⚠️ FORMATO: "123m" o "123 m" (número + espacio opcional + 'm')
  educationalCenters?: string;            // Centros educativos (máx 16)
  childNutritionCenters?: string;         // CEN (Centros de Nutrición Infantil) (máx 16)
  religiousFacilities?: string;           // Centros religiosos (máx 16)
  elderCareCenters?: string;              // Centros de cuido de adultos mayores (máx 16)
  hospitals?: string;                     // Hospitales (máx 16)
  clinics?: string;                       // Clínicas (máx 16)
  ebais?: string;                         // EBAIS (máx 16)
  
  // Demarcación de zona (OPCIONAL)
  zoneDemarcation?: ZoneDemarcationOption;
  zoneDemarcationObservation?: string;    // Máximo 400 caracteres
  
  // Conformidad con plan regulador (OPCIONAL)
  regulatoryPlanConformity?: RegulatoryPlanConformityOption;
  regulatoryPlanObservation?: string;     // Máximo 400 caracteres
  
  // Observaciones y fotos (OPCIONALES)
  observations?: string;                  // Sin límite
  photoUrls?: string[];                   // Array de URLs
}
```

### 📤 Ejemplo de Request

```json
{
  "type": "revenue_patent",
  "inspectorIds": [1, 2],
  "revenuePatent": {
    "tradeName": "Bar El Amanecer",
    "licenseType": "licencia_licores",
    "propertyNumber": "12345",
    "cadastralNumber": "SC-001-2025",
    "landUseReference": "REF-USO-001",
    "educationalCenters": "500m",
    "childNutritionCenters": "750m",
    "religiousFacilities": "300m",
    "elderCareCenters": "1000m",
    "hospitals": "2000m",
    "clinics": "150m",
    "ebais": "800m",
    "zoneDemarcation": "segun_uso_suelo",
    "zoneDemarcationObservation": "Zona comercial permitida",
    "regulatoryPlanConformity": "segun_plan_regulatorio",
    "regulatoryPlanObservation": "Cumple con requisitos del artículo 45",
    "observations": "El establecimiento cuenta con todas las medidas de seguridad requeridas",
    "photoUrls": [
      "https://cloudinary.com/photos/fachada.jpg",
      "https://cloudinary.com/photos/interior.jpg"
    ]
  }
}
```

### ✅ Validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `tradeName` | string | **Sí** | Máximo 200 caracteres |
| `licenseType` | enum | **Sí** | `licencia_licores` o `licencia_comercial` |
| `propertyNumber` | string | No | Máximo 50 caracteres |
| `cadastralNumber` | string | No | Máximo 50 caracteres |
| `landUseReference` | string | No | Máximo 50 caracteres |
| `educationalCenters` | string | No | Formato: `\d+\s?m` (ej: "500m" o "500 m") |
| `childNutritionCenters` | string | No | Formato: `\d+\s?m` |
| `religiousFacilities` | string | No | Formato: `\d+\s?m` |
| `elderCareCenters` | string | No | Formato: `\d+\s?m` |
| `hospitals` | string | No | Formato: `\d+\s?m` |
| `clinics` | string | No | Formato: `\d+\s?m` |
| `ebais` | string | No | Formato: `\d+\s?m` |
| `zoneDemarcation` | enum | No | Ver enum ZoneDemarcationOption |
| `zoneDemarcationObservation` | string | No | Máximo 400 caracteres |
| `regulatoryPlanConformity` | enum | No | Ver enum RegulatoryPlanConformityOption |
| `regulatoryPlanObservation` | string | No | Máximo 400 caracteres |
| `observations` | string | No | Sin límite |
| `photoUrls` | string[] | No | Array de strings (URLs) |

### 🎨 Componente React Sugerido

```tsx
import React, { useState } from 'react';

interface RevenuePatentFormProps {
  onChange: (data: RevenuePatent) => void;
}

const RevenuePatentForm: React.FC<RevenuePatentFormProps> = ({ onChange }) => {
  const [data, setData] = useState<RevenuePatent>({
    tradeName: '',
    licenseType: 'licencia_comercial',
    zoneDemarcation: 'segun_uso_suelo',
    regulatoryPlanConformity: 'segun_plan_regulatorio'
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const validateDistance = (value: string): boolean => {
    return /^\d+\s?m$/i.test(value);
  };

  return (
    <div className="revenue-patent-form">
      {/* Información básica */}
      <section>
        <h3>Información Básica</h3>
        
        <div className="form-group">
          <label>Nombre Comercial *</label>
          <input 
            type="text"
            required
            maxLength={200}
            value={data.tradeName}
            onChange={(e) => updateData('tradeName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Tipo de Licencia *</label>
          <select 
            required
            value={data.licenseType}
            onChange={(e) => updateData('licenseType', e.target.value)}
          >
            <option value="licencia_comercial">Licencia Comercial</option>
            <option value="licencia_licores">Licencia de Licores</option>
          </select>
        </div>

        <div className="form-group">
          <label>Número de Finca</label>
          <input 
            type="text"
            maxLength={50}
            value={data.propertyNumber || ''}
            onChange={(e) => updateData('propertyNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Número de Catastro</label>
          <input 
            type="text"
            maxLength={50}
            value={data.cadastralNumber || ''}
            onChange={(e) => updateData('cadastralNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Referencia de Uso de Suelo</label>
          <input 
            type="text"
            maxLength={50}
            value={data.landUseReference || ''}
            onChange={(e) => updateData('landUseReference', e.target.value)}
          />
        </div>
      </section>

      {/* Distancias a centros sensibles */}
      <section>
        <h3>Distancias a Centros Sensibles</h3>
        <p className="hint">Formato: número + "m" (ejemplo: 500m o 500 m)</p>

        <div className="form-group">
          <label>Centros Educativos</label>
          <input 
            type="text"
            placeholder="500m"
            value={data.educationalCenters || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('educationalCenters', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>CEN (Centros de Nutrición Infantil)</label>
          <input 
            type="text"
            placeholder="750m"
            value={data.childNutritionCenters || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('childNutritionCenters', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>Centros Religiosos</label>
          <input 
            type="text"
            placeholder="300m"
            value={data.religiousFacilities || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('religiousFacilities', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>Centros de Cuido de Adultos Mayores</label>
          <input 
            type="text"
            placeholder="1000m"
            value={data.elderCareCenters || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('elderCareCenters', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>Hospitales</label>
          <input 
            type="text"
            placeholder="2000m"
            value={data.hospitals || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('hospitals', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>Clínicas</label>
          <input 
            type="text"
            placeholder="150m"
            value={data.clinics || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('clinics', value);
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>EBAIS</label>
          <input 
            type="text"
            placeholder="800m"
            value={data.ebais || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (!value || validateDistance(value)) {
                updateData('ebais', value);
              }
            }}
          />
        </div>
      </section>

      {/* Demarcación de zona */}
      <section>
        <h3>Demarcación de Zona</h3>

        <div className="form-group">
          <label>Demarcación</label>
          <select 
            value={data.zoneDemarcation}
            onChange={(e) => updateData('zoneDemarcation', e.target.value)}
          >
            <option value="segun_uso_suelo">Según uso de suelo</option>
            <option value="segun_plan_regulatorio">Según plan regulador</option>
          </select>
        </div>

        <div className="form-group">
          <label>Observación de Demarcación</label>
          <textarea
            maxLength={400}
            value={data.zoneDemarcationObservation || ''}
            onChange={(e) => updateData('zoneDemarcationObservation', e.target.value)}
          />
        </div>
      </section>

      {/* Conformidad con plan regulador */}
      <section>
        <h3>Conformidad con Plan Regulador</h3>

        <div className="form-group">
          <label>Conformidad</label>
          <select 
            value={data.regulatoryPlanConformity}
            onChange={(e) => updateData('regulatoryPlanConformity', e.target.value)}
          >
            <option value="segun_plan_regulatorio">Según plan regulador</option>
            <option value="no_aplicable">No aplicable</option>
          </select>
        </div>

        <div className="form-group">
          <label>Observación de Conformidad</label>
          <textarea
            maxLength={400}
            value={data.regulatoryPlanObservation || ''}
            onChange={(e) => updateData('regulatoryPlanObservation', e.target.value)}
          />
        </div>
      </section>

      {/* Observaciones y fotos */}
      <section>
        <h3>Observaciones y Fotos</h3>

        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            value={data.observations || ''}
            onChange={(e) => updateData('observations', e.target.value)}
            placeholder="Observaciones generales..."
          />
        </div>

        <div className="form-group">
          <label>Fotos</label>
          {/* Aquí iría tu componente de carga de fotos */}
          {/* Por ahora, un input simple de URLs */}
          <input 
            type="text"
            placeholder="URLs de fotos (separadas por coma)"
            onChange={(e) => {
              const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              updateData('photoUrls', urls);
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default RevenuePatentForm;
```

---

## 3️⃣ Work Closure (Cierre de Obra)

### 📝 Descripción
Registro de cierres de obra con información de visitas, áreas y recibos.

### 🔧 Campo en la Inspección
```typescript
workClosure?: WorkClosure
```

### 📊 Estructura TypeScript

```typescript
// Enum necesario
enum VisitNumber {
  VISIT_1 = 'visita_1',
  VISIT_2 = 'visita_2',
  VISIT_3 = 'visita_3'
}

interface WorkClosure {
  // Identificadores de propiedad (OPCIONALES)
  propertyNumber?: string;        // Número de finca (máx 50)
  cadastralNumber?: string;       // Número de catastro (máx 50)
  contractNumber?: string;        // Número de contrato (máx 50)
  permitNumber?: string;          // Número de permiso (máx 50)
  
  // Áreas (OPCIONALES, guardadas como strings ej: "120 m²")
  assessedArea?: string;          // Área tasada (máx 24)
  builtArea?: string;             // Área construida (máx 24)
  
  // Número de visita (OPCIONAL)
  visitNumber?: VisitNumber;      // Enum: visita_1, visita_2, visita_3
  
  // Recibo de obra (REQUERIDO)
  workReceipt: boolean;           // true/false
  
  // Información adicional (OPCIONALES)
  actions?: string;               // Acciones tomadas (máx 500)
  observations?: string;          // Observaciones (máx 500)
  
  // Fotos (OPCIONAL)
  photoUrls?: string[];           // Array de URLs
}
```

### 📤 Ejemplo de Request

```json
{
  "type": "work_closure",
  "inspectorIds": [1],
  "workClosure": {
    "propertyNumber": "FINCA-2025-001",
    "cadastralNumber": "CAT-SC-12345",
    "contractNumber": "CONT-2025-456",
    "permitNumber": "PERM-789",
    "assessedArea": "150 m²",
    "builtArea": "140 m²",
    "visitNumber": "visita_2",
    "workReceipt": true,
    "actions": "Se verificó el cumplimiento de planos. Se solicitó corrección en rampa de acceso.",
    "observations": "Obra en buen estado general. Falta pintura exterior.",
    "photoUrls": [
      "https://cloudinary.com/photos/obra-frontal.jpg",
      "https://cloudinary.com/photos/obra-interior.jpg"
    ]
  }
}
```

### ✅ Validaciones

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `propertyNumber` | string | No | Máximo 50 caracteres |
| `cadastralNumber` | string | No | Máximo 50 caracteres |
| `contractNumber` | string | No | Máximo 50 caracteres |
| `permitNumber` | string | No | Máximo 50 caracteres |
| `assessedArea` | string | No | Máximo 24 caracteres |
| `builtArea` | string | No | Máximo 24 caracteres |
| `visitNumber` | enum | No | `visita_1`, `visita_2` o `visita_3` |
| `workReceipt` | boolean | **Sí** | true o false |
| `actions` | string | No | Máximo 500 caracteres |
| `observations` | string | No | Máximo 500 caracteres |
| `photoUrls` | string[] | No | Array de strings (URLs) |

### 🎨 Componente React Sugerido

```tsx
import React, { useState } from 'react';

interface WorkClosureFormProps {
  onChange: (data: WorkClosure) => void;
}

const WorkClosureForm: React.FC<WorkClosureFormProps> = ({ onChange }) => {
  const [data, setData] = useState<WorkClosure>({
    workReceipt: false
  });

  const updateData = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  return (
    <div className="work-closure-form">
      {/* Identificadores */}
      <section>
        <h3>Identificadores de Propiedad</h3>

        <div className="form-group">
          <label>Número de Finca</label>
          <input 
            type="text"
            maxLength={50}
            placeholder="FINCA-2025-001"
            value={data.propertyNumber || ''}
            onChange={(e) => updateData('propertyNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Número de Catastro</label>
          <input 
            type="text"
            maxLength={50}
            placeholder="CAT-SC-12345"
            value={data.cadastralNumber || ''}
            onChange={(e) => updateData('cadastralNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Número de Contrato</label>
          <input 
            type="text"
            maxLength={50}
            placeholder="CONT-2025-456"
            value={data.contractNumber || ''}
            onChange={(e) => updateData('contractNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Número de Permiso</label>
          <input 
            type="text"
            maxLength={50}
            placeholder="PERM-789"
            value={data.permitNumber || ''}
            onChange={(e) => updateData('permitNumber', e.target.value)}
          />
        </div>
      </section>

      {/* Áreas */}
      <section>
        <h3>Áreas</h3>

        <div className="form-group">
          <label>Área Tasada</label>
          <input 
            type="text"
            maxLength={24}
            placeholder="150 m²"
            value={data.assessedArea || ''}
            onChange={(e) => updateData('assessedArea', e.target.value)}
          />
          <small>Ejemplo: 150 m² o 150m2</small>
        </div>

        <div className="form-group">
          <label>Área Construida</label>
          <input 
            type="text"
            maxLength={24}
            placeholder="140 m²"
            value={data.builtArea || ''}
            onChange={(e) => updateData('builtArea', e.target.value)}
          />
          <small>Ejemplo: 140 m² o 140m2</small>
        </div>
      </section>

      {/* Número de visita */}
      <section>
        <h3>Información de Visita</h3>

        <div className="form-group">
          <label>Número de Visita</label>
          <select 
            value={data.visitNumber || ''}
            onChange={(e) => updateData('visitNumber', e.target.value || undefined)}
          >
            <option value="">Seleccionar...</option>
            <option value="visita_1">Visita 1</option>
            <option value="visita_2">Visita 2</option>
            <option value="visita_3">Visita 3</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <input 
              type="checkbox"
              checked={data.workReceipt}
              onChange={(e) => updateData('workReceipt', e.target.checked)}
            />
            <strong>Recibo de Obra *</strong>
          </label>
          <small>Campo requerido</small>
        </div>
      </section>

      {/* Acciones y observaciones */}
      <section>
        <h3>Acciones y Observaciones</h3>

        <div className="form-group">
          <label>Acciones Tomadas</label>
          <textarea
            maxLength={500}
            value={data.actions || ''}
            onChange={(e) => updateData('actions', e.target.value)}
            placeholder="Describa las acciones tomadas durante la inspección..."
            rows={4}
          />
          <small>{(data.actions || '').length}/500 caracteres</small>
        </div>

        <div className="form-group">
          <label>Observaciones</label>
          <textarea
            maxLength={500}
            value={data.observations || ''}
            onChange={(e) => updateData('observations', e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={4}
          />
          <small>{(data.observations || '').length}/500 caracteres</small>
        </div>
      </section>

      {/* Fotos */}
      <section>
        <h3>Fotografías</h3>

        <div className="form-group">
          <label>URLs de Fotos</label>
          {/* Aquí iría tu componente de carga de fotos */}
          <input 
            type="text"
            placeholder="URLs de fotos (separadas por coma)"
            onChange={(e) => {
              const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              updateData('photoUrls', urls);
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default WorkClosureForm;
```

---

## 📝 Integración Completa

### Ejemplo de Request Completo

```typescript
// POST /inspections
const createInspection = async (type: string, formData: any) => {
  const payload = {
    type: type, // "collection", "revenue_patent", o "work_closure"
    inspectorIds: [currentUserId],
    [type]: formData // El objeto específico según el tipo
  };

  const response = await fetch('https://tu-api.com/inspections', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

### Manejo de Errores

```typescript
// Errores comunes
const errorMessages = {
  // Collection
  'nobodyPresent must be "X" when provided': 
    'El campo solo acepta "X" cuando está marcado',
  
  // Revenue Patent
  'tradeName must be shorter than or equal to 200 characters': 
    'El nombre comercial no puede exceder 200 caracteres',
  'educationalCenters must look like "000m" or "000 m"': 
    'La distancia debe tener formato "123m" o "123 m"',
  'licenseType must be a valid enum value': 
    'El tipo de licencia debe ser "licencia_licores" o "licencia_comercial"',
  
  // Work Closure
  'workReceipt must be a boolean value': 
    'El campo "Recibo de Obra" es requerido (true/false)',
  'visitNumber must be a valid enum value': 
    'El número de visita debe ser visita_1, visita_2 o visita_3'
};
```

---

## 🎯 Tipos para InspectionType

Actualizar el enum de tipos de inspección:

```typescript
enum InspectionType {
  // ... tipos existentes ...
  COLLECTION = 'collection',
  REVENUE_PATENT = 'revenue_patent',
  WORK_CLOSURE = 'work_closure'
}
```

---

## 📊 Response Esperado

Cuando la inspección se crea correctamente, recibirás:

```json
{
  "id": 123,
  "type": "collection",
  "status": "new",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "inspectors": [
    {
      "id": 1,
      "name": "Juan Pérez"
    }
  ],
  "collection": {
    "id": 456,
    "notifierSignatureUrl": "https://...",
    "nobodyPresent": "X",
    "wrongAddress": null,
    // ... resto de campos
  }
}
```

---

## ✅ Checklist de Implementación

### Collection
- [ ] Crear formulario con checkboxes
- [ ] Validar que checkboxes envíen "X" o null
- [ ] Implementar campo de firma (URL o upload)
- [ ] Validar longitud de campos
- [ ] Integrar con endpoint POST /inspections
- [ ] Probar creación y visualización

### Revenue Patent
- [ ] Crear formulario con todos los campos
- [ ] Implementar validación de distancias (formato "123m")
- [ ] Crear selectores para los enums
- [ ] Validar campos requeridos (tradeName, licenseType)
- [ ] Implementar upload de fotos
- [ ] Integrar con endpoint POST /inspections
- [ ] Probar creación y visualización

### Work Closure
- [ ] Crear formulario con identificadores
- [ ] Implementar campos de área (formato libre)
- [ ] Crear selector de número de visita
- [ ] Implementar checkbox de recibo de obra (requerido)
- [ ] Crear campos de acciones y observaciones
- [ ] Implementar upload de fotos
- [ ] Integrar con endpoint POST /inspections
- [ ] Probar creación y visualización

---

## 🐛 Testing

### Tests Recomendados

```typescript
// Collection
describe('Collection Form', () => {
  it('should send "X" when checkbox is checked', () => {
    // Test implementación
  });
  
  it('should omit field when checkbox is unchecked', () => {
    // Test implementación
  });
  
  it('should validate signature URL length', () => {
    // Test implementación
  });
});

// Revenue Patent
describe('Revenue Patent Form', () => {
  it('should validate distance format', () => {
    // Test que "500m" y "500 m" son válidos
  });
  
  it('should require tradeName and licenseType', () => {
    // Test campos requeridos
  });
  
  it('should validate enum values', () => {
    // Test enums
  });
});

// Work Closure
describe('Work Closure Form', () => {
  it('should require workReceipt field', () => {
    // Test campo requerido
  });
  
  it('should validate visit number enum', () => {
    // Test enum de visitas
  });
  
  it('should limit text field lengths', () => {
    // Test límites de caracteres
  });
});
```

---

## 📞 Soporte

Si tienes dudas sobre la implementación:

1. Revisa la documentación completa en `docs/api/`
2. Verifica los ejemplos de código en este documento
3. Prueba con Postman o similar primero
4. Contacta al equipo de backend si hay errores de validación

---

## 🔄 Actualizaciones Futuras

Estas funcionalidades están sujetas a cambios. Verifica siempre:

- La documentación actualizada en el repositorio
- Los mensajes de error del backend
- Las validaciones del DTO

**Última actualización:** 13 de octubre de 2025

---

## 📦 Resumen de Campos Requeridos

| Tipo | Campos Requeridos |
|------|-------------------|
| **Collection** | Ninguno (todos opcionales) |
| **Revenue Patent** | `tradeName`, `licenseType` |
| **Work Closure** | `workReceipt` (boolean) |

**Nota:** Aunque los campos sean opcionales a nivel de backend, el frontend puede implementar validaciones adicionales según los requisitos de negocio.
