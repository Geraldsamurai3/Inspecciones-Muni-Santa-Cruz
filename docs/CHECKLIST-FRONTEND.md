# ✅ CHECKLIST DE IMPLEMENTACIÓN FRONTEND

Este documento proporciona un checklist detallado para implementar las 3 nuevas funcionalidades en el frontend.

**Fecha:** 13 de octubre de 2025  
**Backend Status:** ✅ Listo y funcionando  
**Frontend Status:** ⏳ Por implementar

---

## 📋 PREPARACIÓN INICIAL

### Setup del Proyecto
- [ ] Leer `QUICK-START-NUEVAS-FUNCIONALIDADES.md` (5 min)
- [ ] Copiar tipos de `TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts`
- [ ] Agregar tipos a tu proyecto TypeScript
- [ ] Verificar que el token de autenticación funciona
- [ ] Probar endpoint básico: `POST /inspections` con tipo existente

### Configuración de Tools
- [ ] Configurar Axios/Fetch con base URL
- [ ] Configurar interceptor de autenticación
- [ ] Configurar manejo de errores global
- [ ] Setup de React Query o SWR (opcional pero recomendado)

---

## 1️⃣ COLLECTION (Cobros/Notificaciones)

### 📦 Fase 1: Tipos y Constantes (30 min)
- [ ] Copiar interface `Collection` del archivo de tipos
- [ ] Copiar enum y constantes relacionadas
- [ ] Crear tipo de props para el componente
- [ ] Definir valores iniciales/default

### 🎨 Fase 2: Componente de Formulario (2-3 horas)
- [ ] Crear archivo `CollectionForm.tsx`
- [ ] Implementar estado del formulario
- [ ] Crear campo de firma (input URL o file upload)
  - [ ] Input text para URL
  - [ ] Validación máximo 500 caracteres
  - [ ] Preview de imagen (opcional)
  
- [ ] Implementar 5 checkboxes
  - [ ] "No había nadie" (`nobodyPresent`)
  - [ ] "Dirección incorrecta" (`wrongAddress`)
  - [ ] "Cambió domicilio" (`movedAddress`)
  - [ ] "No quiso firmar" (`refusedToSign`)
  - [ ] "No se localiza" (`notLocated`)
  - [ ] Handler que convierte `checked` → `"X"` o `undefined`

- [ ] Campo "Otro" (textarea)
  - [ ] Textarea con 300 caracteres max
  - [ ] Contador de caracteres

- [ ] Botones de acción
  - [ ] Botón "Guardar"
  - [ ] Botón "Cancelar"

### 🔌 Fase 3: Integración con API (1 hora)
- [ ] Crear función `createCollectionInspection()`
- [ ] Implementar POST a `/inspections`
- [ ] Enviar estructura correcta:
  ```typescript
  {
    type: "collection",
    inspectorIds: [currentUserId],
    collection: { ...data }
  }
  ```
- [ ] Manejar respuesta exitosa (201)
- [ ] Manejar errores (400, 401, 500)

### 🧪 Fase 4: Testing y Validación (1-2 horas)
- [ ] Test: Checkbox marcado envía "X"
- [ ] Test: Checkbox desmarcado envía undefined/null
- [ ] Test: URL de firma no excede 500 chars
- [ ] Test: Campo "otro" no excede 300 chars
- [ ] Test: Todos los campos son opcionales
- [ ] Test: Submit funciona sin ningún campo
- [ ] Test E2E: Crear y recuperar inspección

### 🎨 Fase 5: UI/UX (1 hora)
- [ ] Estilos del formulario
- [ ] Loading states
- [ ] Disabled states
- [ ] Mensajes de éxito
- [ ] Mensajes de error user-friendly
- [ ] Responsive design

### ✅ Collection - TOTAL ESTIMADO: 1-2 días

---

## 2️⃣ REVENUE PATENT (Patentes de Ingresos)

### 📦 Fase 1: Tipos y Enums (30 min)
- [ ] Copiar interface `RevenuePatent`
- [ ] Copiar enums:
  - [ ] `LicenseType`
  - [ ] `ZoneDemarcationOption`
  - [ ] `RegulatoryPlanConformityOption`
- [ ] Copiar constantes de labels/traducciones
- [ ] Definir valores por defecto

### 🎨 Fase 2: Componente Principal (4-5 horas)

#### Sección: Información Básica
- [ ] Campo "Nombre Comercial" (REQUERIDO)
  - [ ] Input text
  - [ ] Validación: no vacío
  - [ ] Validación: máximo 200 caracteres
  - [ ] Marcador de campo requerido (*)
  
- [ ] Campo "Tipo de Licencia" (REQUERIDO)
  - [ ] Select/dropdown
  - [ ] Opciones: Licencia de Licores, Licencia Comercial
  - [ ] Valor por defecto
  - [ ] Marcador de campo requerido (*)

- [ ] Campos de identificadores (opcionales)
  - [ ] Número de Finca (50 chars max)
  - [ ] Número de Catastro (50 chars max)
  - [ ] Referencia Uso de Suelo (50 chars max)

#### Sección: Distancias a Centros Sensibles
- [ ] Implementar validador de formato `\d+\s?m`
- [ ] Crear helper de auto-formateo
- [ ] Campo "Centros Educativos"
  - [ ] Input con validación de formato
  - [ ] Placeholder "500m"
  - [ ] Feedback visual de formato correcto/incorrecto
- [ ] Campo "CEN (Nutrición Infantil)"
- [ ] Campo "Centros Religiosos"
- [ ] Campo "Cuido Adultos Mayores"
- [ ] Campo "Hospitales"
- [ ] Campo "Clínicas"
- [ ] Campo "EBAIS"

#### Sección: Demarcación de Zona
- [ ] Select "Demarcación"
  - [ ] Opciones del enum `ZoneDemarcationOption`
  - [ ] Valor por defecto
- [ ] Textarea "Observación de Demarcación"
  - [ ] 400 caracteres max
  - [ ] Contador de caracteres

#### Sección: Conformidad Plan Regulador
- [ ] Select "Conformidad"
  - [ ] Opciones del enum `RegulatoryPlanConformityOption`
  - [ ] Valor por defecto
- [ ] Textarea "Observación de Conformidad"
  - [ ] 400 caracteres max
  - [ ] Contador de caracteres

#### Sección: Observaciones y Fotos
- [ ] Textarea "Observaciones" (sin límite)
- [ ] Upload de fotos
  - [ ] Componente de upload
  - [ ] Preview de imágenes
  - [ ] Lista de URLs
  - [ ] Botón para agregar/eliminar

### 🔌 Fase 3: Integración con API (1-2 horas)
- [ ] Crear función `createRevenuePatentInspection()`
- [ ] Validar campos requeridos antes de enviar
- [ ] Limpiar objeto (remover campos undefined/vacíos)
- [ ] Implementar POST a `/inspections`
- [ ] Estructura correcta:
  ```typescript
  {
    type: "revenue_patent",
    inspectorIds: [...],
    revenuePatent: { ...data }
  }
  ```
- [ ] Manejar errores específicos:
  - [ ] `tradeName should not be empty`
  - [ ] `distance must look like "000m"`
  - [ ] `licenseType must be a valid enum`

### 🧪 Fase 4: Testing (2-3 horas)
- [ ] Test: Campos requeridos no pueden estar vacíos
- [ ] Test: Validación formato distancias
- [ ] Test: Auto-formateo de distancias funciona
- [ ] Test: Enums tienen valores correctos
- [ ] Test: Límites de caracteres respetados
- [ ] Test: Fotos se cargan correctamente
- [ ] Test E2E: Crear patente completa
- [ ] Test E2E: Crear patente solo con requeridos

### 🎨 Fase 5: UI/UX (2 horas)
- [ ] Estilos consistentes
- [ ] Secciones colapsables (opcional)
- [ ] Indicadores de campos requeridos claros
- [ ] Loading/disabled states
- [ ] Validación en tiempo real
- [ ] Mensajes de error contextuales
- [ ] Success feedback
- [ ] Responsive design

### ✅ Revenue Patent - TOTAL ESTIMADO: 3-4 días

---

## 3️⃣ WORK CLOSURE (Cierre de Obra)

### 📦 Fase 1: Tipos y Enums (20 min)
- [ ] Copiar interface `WorkClosure`
- [ ] Copiar enum `VisitNumber`
- [ ] Copiar constantes de labels
- [ ] Definir valores por defecto

### 🎨 Fase 2: Componente de Formulario (3-4 horas)

#### Sección: Identificadores
- [ ] Campo "Número de Finca" (50 chars)
- [ ] Campo "Número de Catastro" (50 chars)
- [ ] Campo "Número de Contrato" (50 chars)
- [ ] Campo "Número de Permiso" (50 chars)

#### Sección: Áreas
- [ ] Campo "Área Tasada"
  - [ ] Input text (24 chars max)
  - [ ] Placeholder "150 m²"
  - [ ] Formato libre (acepta "150m2", "150 m²", etc.)
- [ ] Campo "Área Construida"
  - [ ] Input text (24 chars max)
  - [ ] Placeholder "140 m²"

#### Sección: Información de Visita
- [ ] Select "Número de Visita"
  - [ ] Opciones: Visita 1, Visita 2, Visita 3
  - [ ] Valor por defecto (opcional)
- [ ] Checkbox "Recibo de Obra" (REQUERIDO)
  - [ ] Marcado claramente como requerido
  - [ ] Valor por defecto: false
  - [ ] Validación antes de submit

#### Sección: Acciones y Observaciones
- [ ] Textarea "Acciones Tomadas"
  - [ ] 500 caracteres max
  - [ ] Contador de caracteres
- [ ] Textarea "Observaciones"
  - [ ] 500 caracteres max
  - [ ] Contador de caracteres

#### Sección: Fotografías
- [ ] Upload de fotos
  - [ ] Componente de upload
  - [ ] Preview de imágenes
  - [ ] Lista de URLs
  - [ ] Botón para agregar/eliminar

### 🔌 Fase 3: Integración con API (1 hora)
- [ ] Crear función `createWorkClosureInspection()`
- [ ] Validar campo requerido `workReceipt`
- [ ] Limpiar objeto (remover campos opcionales vacíos)
- [ ] Implementar POST a `/inspections`
- [ ] Estructura correcta:
  ```typescript
  {
    type: "work_closure",
    inspectorIds: [...],
    workClosure: { ...data }
  }
  ```
- [ ] Manejar errores:
  - [ ] `workReceipt must be a boolean`
  - [ ] `visitNumber must be a valid enum`

### 🧪 Fase 4: Testing (1-2 horas)
- [ ] Test: `workReceipt` es requerido
- [ ] Test: `workReceipt` es boolean (no string)
- [ ] Test: `visitNumber` acepta valores del enum
- [ ] Test: Áreas aceptan formato libre
- [ ] Test: Límites de caracteres
- [ ] Test: Campos opcionales pueden omitirse
- [ ] Test E2E: Crear cierre completo
- [ ] Test E2E: Crear cierre solo con requeridos

### 🎨 Fase 5: UI/UX (1 hora)
- [ ] Estilos del formulario
- [ ] Checkbox `workReceipt` prominente
- [ ] Loading states
- [ ] Validación en tiempo real
- [ ] Mensajes de error claros
- [ ] Success feedback
- [ ] Responsive design

### ✅ Work Closure - TOTAL ESTIMADO: 2-3 días

---

## 🔄 INTEGRACIÓN GENERAL

### Vista de Lista de Inspecciones
- [ ] Actualizar enum de tipos con los 3 nuevos
- [ ] Agregar iconos/badges para nuevos tipos
- [ ] Actualizar filtros para incluir nuevos tipos
- [ ] Agregar badges de estado

### Vista de Detalle de Inspección
- [ ] Componente para mostrar Collection
  - [ ] Mostrar firma (imagen)
  - [ ] Mostrar checkboxes marcados
  - [ ] Mostrar campo "otro"
  
- [ ] Componente para mostrar Revenue Patent
  - [ ] Información básica
  - [ ] Tabla de distancias
  - [ ] Información de zonificación
  - [ ] Galería de fotos
  
- [ ] Componente para mostrar Work Closure
  - [ ] Identificadores en grid
  - [ ] Áreas destacadas
  - [ ] Número de visita con badge
  - [ ] Estado de recibo de obra
  - [ ] Acciones y observaciones
  - [ ] Galería de fotos

### Formulario de Creación
- [ ] Agregar opciones de nuevos tipos en selector
- [ ] Implementar switch/conditional rendering
- [ ] Cargar componente correcto según tipo seleccionado

### Edición
- [ ] Implementar UPDATE para Collection
- [ ] Implementar UPDATE para Revenue Patent
- [ ] Implementar UPDATE para Work Closure

---

## 🧪 TESTING INTEGRAL

### Tests Unitarios
- [ ] Tests de validación de cada formulario
- [ ] Tests de helpers y utilidades
- [ ] Tests de conversión de datos
- [ ] Tests de type guards

### Tests de Integración
- [ ] Test: POST Collection exitoso
- [ ] Test: POST Revenue Patent exitoso
- [ ] Test: POST Work Closure exitoso
- [ ] Test: GET inspección con Collection
- [ ] Test: GET inspección con Revenue Patent
- [ ] Test: GET inspección con Work Closure
- [ ] Test: UPDATE cada tipo
- [ ] Test: Manejo de errores de validación

### Tests E2E
- [ ] E2E: Flujo completo crear Collection
- [ ] E2E: Flujo completo crear Revenue Patent
- [ ] E2E: Flujo completo crear Work Closure
- [ ] E2E: Ver lista con nuevos tipos
- [ ] E2E: Ver detalle de cada tipo
- [ ] E2E: Editar cada tipo
- [ ] E2E: Manejo de errores de red

---

## 📱 RESPONSIVE & ACCESSIBILITY

### Responsive Design
- [ ] Formularios funcionan en mobile
- [ ] Tablas responsivas
- [ ] Botones accesibles en touch
- [ ] Imágenes responsive
- [ ] Layout ajustable

### Accessibility
- [ ] Labels asociados a inputs
- [ ] Campos requeridos marcados con aria-required
- [ ] Mensajes de error con aria-live
- [ ] Navegación por teclado funcional
- [ ] Focus states visibles
- [ ] Contraste de colores adecuado

---

## 📚 DOCUMENTACIÓN

### Documentación de Código
- [ ] Comentarios en componentes complejos
- [ ] JSDoc para funciones públicas
- [ ] README actualizado con nuevos componentes

### Documentación para Usuarios
- [ ] Guía de uso de Collection
- [ ] Guía de uso de Revenue Patent
- [ ] Guía de uso de Work Closure
- [ ] FAQ sobre nuevas funcionalidades

---

## 🚀 DEPLOYMENT

### Pre-Deploy
- [ ] Todos los tests pasando
- [ ] Code review completado
- [ ] Documentación actualizada
- [ ] Performance optimizado
- [ ] Bundle size verificado

### Deploy
- [ ] Deploy a staging
- [ ] QA en staging
- [ ] Deploy a producción
- [ ] Smoke tests post-deploy
- [ ] Monitoring activo

---

## ⏱️ RESUMEN DE TIEMPOS

| Fase | Tiempo Estimado |
|------|-----------------|
| **Setup Inicial** | 1-2 horas |
| **Collection** | 1-2 días |
| **Revenue Patent** | 3-4 días |
| **Work Closure** | 2-3 días |
| **Integración General** | 1-2 días |
| **Testing Integral** | 1-2 días |
| **Responsive & A11y** | 1 día |
| **Documentación** | 0.5 días |
| **Deploy & QA** | 0.5 días |
| **TOTAL** | **10-15 días** |

**Para 1 developer:** 2-3 semanas  
**Para 2 developers:** 1-2 semanas

---

## 🎯 PRIORIDADES

### Must Have (P0)
- ✅ Funcionalidad básica de cada tipo
- ✅ Validaciones de campos requeridos
- ✅ POST a API funcionando
- ✅ Manejo de errores básico

### Should Have (P1)
- 📋 Vista de detalle de cada tipo
- 📋 Edición de inspecciones
- 📋 Upload de fotos
- 📋 Validación en tiempo real

### Nice to Have (P2)
- 🎨 Animaciones y transiciones
- 🎨 Preview de imágenes
- 🎨 Auto-guardado
- 🎨 Modo offline

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Collection
- [ ] Usuario puede crear inspección tipo Collection
- [ ] Checkboxes funcionan correctamente (envían "X")
- [ ] Firma se guarda como URL
- [ ] Campo "otro" acepta texto libre
- [ ] Todos los campos son opcionales
- [ ] Se puede guardar sin completar ningún campo

### Revenue Patent
- [ ] Usuario puede crear inspección tipo Revenue Patent
- [ ] Campos requeridos no permiten submit si vacíos
- [ ] Distancias validan formato "123m"
- [ ] Enums funcionan correctamente
- [ ] Fotos se pueden cargar
- [ ] Se muestra preview de fotos
- [ ] Validaciones muestran mensajes claros

### Work Closure
- [ ] Usuario puede crear inspección tipo Work Closure
- [ ] Campo `workReceipt` es requerido
- [ ] Checkbox `workReceipt` funciona
- [ ] Número de visita funciona correctamente
- [ ] Áreas aceptan formato libre
- [ ] Fotos se pueden cargar
- [ ] Contador de caracteres funciona

---

## 🐛 BUGS CONOCIDOS & ISSUES

**Agregar aquí cualquier bug encontrado durante la implementación**

- [ ] 

---

## 📝 NOTAS & OBSERVACIONES

**Agregar aquí cualquier observación importante**

- 

---

## 🎉 COMPLETADO

**Fecha de inicio:** _______________  
**Fecha de finalización:** _______________  
**Developer(s):** _______________  
**Reviewed by:** _______________

---

**¡Usa este checklist para trackear tu progreso! 📊**

**Pro tip:** Marca cada checkbox conforme avances. Esto te ayudará a:
- ✅ Ver tu progreso
- ✅ No olvidar ningún detalle
- ✅ Estimar tiempos realistas
- ✅ Comunicar estado al equipo
