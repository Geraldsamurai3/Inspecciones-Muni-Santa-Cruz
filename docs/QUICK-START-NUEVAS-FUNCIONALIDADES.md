# 🚀 Quick Start - Nuevas Funcionalidades

## Resumen Ultra Rápido

Se agregaron **3 nuevos tipos de inspecciones**. Todas se envían al mismo endpoint:

```
POST /inspections
```

---

## 1️⃣ Collection (Cobros)

**Tipo:** `"collection"`

**Campos requeridos:** Ninguno (todos opcionales)

**Request mínimo:**
```json
{
  "type": "collection",
  "inspectorIds": [1],
  "collection": {
    "nobodyPresent": "X"
  }
}
```

**Checkboxes:** Enviar `"X"` cuando está marcado, `null` o omitir cuando no.

---

## 2️⃣ Revenue Patent (Patentes)

**Tipo:** `"revenue_patent"`

**Campos requeridos:** 
- `tradeName` (string)
- `licenseType` (`"licencia_licores"` o `"licencia_comercial"`)

**Request mínimo:**
```json
{
  "type": "revenue_patent",
  "inspectorIds": [1],
  "revenuePatent": {
    "tradeName": "Bar El Amanecer",
    "licenseType": "licencia_licores"
  }
}
```

**Formato distancias:** `"500m"` o `"500 m"` (número + m)

**Enums:**
```typescript
licenseType: "licencia_licores" | "licencia_comercial"
zoneDemarcation: "segun_uso_suelo" | "segun_plan_regulatorio"
regulatoryPlanConformity: "segun_plan_regulatorio" | "no_aplicable"
```

---

## 3️⃣ Work Closure (Cierre de Obra)

**Tipo:** `"work_closure"`

**Campos requeridos:** 
- `workReceipt` (boolean)

**Request mínimo:**
```json
{
  "type": "work_closure",
  "inspectorIds": [1],
  "workClosure": {
    "workReceipt": true
  }
}
```

**Enum número de visita:**
```typescript
visitNumber: "visita_1" | "visita_2" | "visita_3"
```

---

## 📦 Archivos para el Frontend

1. **Documentación completa:** `docs/NUEVAS-FUNCIONALIDADES-FRONTEND.md`
   - Explicación detallada de cada funcionalidad
   - Ejemplos de formularios React
   - Validaciones completas
   - Manejo de errores

2. **Tipos TypeScript:** `docs/TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts`
   - Interfaces completas
   - Enums
   - Helpers y validadores
   - Type guards
   - Constantes y traducciones
   - Valores por defecto
   - Ejemplos de uso

---

## ⚡ Checklist Rápido

### Collection
- [ ] Formulario con 5 checkboxes (enviar "X" cuando marcado)
- [ ] Campo firma (URL, 500 chars)
- [ ] Campo "otro" (300 chars)

### Revenue Patent
- [ ] Campo nombre comercial (requerido, 200 chars)
- [ ] Select tipo licencia (requerido)
- [ ] 7 campos de distancia (formato "123m")
- [ ] 2 selects para demarcación y conformidad
- [ ] Observaciones y fotos

### Work Closure
- [ ] 4 campos identificadores (50 chars c/u)
- [ ] 2 campos de área (24 chars, ej: "150 m²")
- [ ] Select número de visita
- [ ] Checkbox recibo obra (REQUERIDO)
- [ ] Acciones y observaciones (500 chars c/u)
- [ ] Fotos

---

## 🐛 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `nobodyPresent must be "X"` | Enviaste otro valor | Solo enviar `"X"` o omitir campo |
| `tradeName should not be empty` | Falta nombre comercial | Es campo requerido en Revenue Patent |
| `educationalCenters must look like "000m"` | Formato incorrecto | Usar formato `"123m"` o `"123 m"` |
| `workReceipt must be a boolean` | Falta campo | Es requerido en Work Closure (true/false) |
| `licenseType must be a valid enum` | Valor inválido | Solo `"licencia_licores"` o `"licencia_comercial"` |

---

## 🎯 Request Completo (Ejemplo Real)

```typescript
// Ejemplo: Revenue Patent con todos los campos
const response = await fetch('https://api.com/inspections', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: "revenue_patent",
    inspectorIds: [1, 2],
    revenuePatent: {
      // Requeridos
      tradeName: "Bar El Amanecer",
      licenseType: "licencia_licores",
      
      // Identificadores (opcionales)
      propertyNumber: "12345",
      cadastralNumber: "SC-001-2025",
      landUseReference: "REF-001",
      
      // Distancias (opcionales, formato "123m")
      educationalCenters: "500m",
      childNutritionCenters: "750m",
      religiousFacilities: "300m",
      elderCareCenters: "1000m",
      hospitals: "2000m",
      clinics: "150m",
      ebais: "800m",
      
      // Demarcación (opcional)
      zoneDemarcation: "segun_uso_suelo",
      zoneDemarcationObservation: "Zona comercial permitida",
      
      // Conformidad (opcional)
      regulatoryPlanConformity: "segun_plan_regulatorio",
      regulatoryPlanObservation: "Cumple artículo 45",
      
      // Generales (opcionales)
      observations: "Todo en orden",
      photoUrls: [
        "https://cloudinary.com/foto1.jpg",
        "https://cloudinary.com/foto2.jpg"
      ]
    }
  })
});

if (response.ok) {
  const inspection = await response.json();
  console.log('✅ Inspección creada:', inspection.id);
} else {
  const error = await response.json();
  console.error('❌ Error:', error.message);
}
```

---

## 📞 Contacto

- Documentación completa: Ver `NUEVAS-FUNCIONALIDADES-FRONTEND.md`
- Tipos TypeScript: Ver `TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts`
- API completa: Ver `docs/api/API-REFERENCE.md`

**Última actualización:** 13 de octubre de 2025
