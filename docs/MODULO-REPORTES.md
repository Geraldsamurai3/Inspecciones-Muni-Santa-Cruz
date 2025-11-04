# Módulo de Reportes - Exportación de Inspecciones

## 📋 Descripción General

Este módulo permite exportar las inspecciones a formato **PDF** y **CSV** con filtros personalizables. Incluye reportes generales y reportes detallados de inspecciones individuales.

---

## ✨ Características

- ✅ Exportar múltiples inspecciones a CSV
- ✅ Exportar múltiples inspecciones a PDF (reporte general)
- ✅ Exportar inspección individual detallada en PDF
- ✅ Filtros por fecha, estado e inspector
- ✅ Vista previa de datos antes de exportar
- ✅ Formato UTF-8 con BOM para Excel
- ✅ Nombres de archivo con fecha automática

---

## 🚀 Endpoints Disponibles

### 1. **Exportar a CSV**

**Endpoint:** `GET /reports/inspections/csv`

**Descripción:** Genera un archivo CSV con todas las inspecciones que coincidan con los filtros.

**Query Parameters:**
- `startDate` (opcional): Fecha inicio en formato YYYY-MM-DD
- `endDate` (opcional): Fecha fin en formato YYYY-MM-DD
- `status` (opcional): Estado de la inspección (Nuevo, En proceso, Revisado, etc.)
- `inspectorId` (opcional): ID del inspector

**Ejemplo de uso:**
```http
GET http://localhost:3000/reports/inspections/csv?startDate=2025-01-01&endDate=2025-12-31&status=Nuevo
```

**Respuesta:** Archivo CSV descargable

**Nombre del archivo:** `inspecciones_2025-10-21.csv`

**Columnas del CSV:**
- ID
- Fecha de Inspección
- Número de Procedimiento
- Tipo de Solicitante
- Estado
- Inspectores
- Solicitante Individual
- Entidad Legal
- Construcción (Sí/No)
- Ubicación (Sí/No)
- Trámite Fiscal (Sí/No)
- Alcaldía (Sí/No)
- Concesión ZMT (Sí/No)
- Cobranza (Sí/No)
- Patente (Sí/No)
- Cierre de Obra (Sí/No)
- Fecha de Creación
- Fecha de Revisión

---

### 2. **Exportar a PDF (Reporte General)**

**Endpoint:** `GET /reports/inspections/pdf`

**Descripción:** Genera un PDF con un listado de todas las inspecciones que coincidan con los filtros.

**Query Parameters:**
- `startDate` (opcional): Fecha inicio en formato YYYY-MM-DD
- `endDate` (opcional): Fecha fin en formato YYYY-MM-DD
- `status` (opcional): Estado de la inspección
- `inspectorId` (opcional): ID del inspector

**Ejemplo de uso:**
```http
GET http://localhost:3000/reports/inspections/pdf?startDate=2025-10-01&endDate=2025-10-31
```

**Respuesta:** Archivo PDF descargable

**Nombre del archivo:** `reporte_inspecciones_2025-10-21.pdf`

**Contenido del PDF:**
- Encabezado con título del reporte
- Fecha de generación
- Total de inspecciones
- Filtros aplicados
- Listado de inspecciones con:
  - Número de inspección
  - Fecha
  - Número de procedimiento
  - Estado
  - Inspectores asignados
  - Solicitante
  - Dependencias activas
- Numeración de páginas

---

### 3. **Exportar Inspección Detallada a PDF**

**Endpoint:** `GET /reports/inspections/:id/pdf`

**Descripción:** Genera un PDF detallado con toda la información de una inspección específica.

**Path Parameters:**
- `id` (requerido): ID de la inspección

**Ejemplo de uso:**
```http
GET http://localhost:3000/reports/inspections/123/pdf
```

**Respuesta:** Archivo PDF descargable

**Nombre del archivo:** `inspeccion_123_detallada_2025-10-21.pdf`

**Contenido del PDF:**
- Información general de la inspección
- Datos completos del solicitante (individual o entidad legal)
- Detalles de todas las dependencias:
  - Construcción
  - Ubicación
  - Trámite Fiscal
  - Alcaldía
  - Concesión ZMT
  - Cobranza
  - Patente
  - Cierre de Obra
- Información de auditoría (fechas de creación, actualización, revisión)

**Códigos de respuesta:**
- `200`: PDF generado exitosamente
- `404`: Inspección no encontrada
- `500`: Error interno del servidor

---

### 4. **Vista Previa de Datos**

**Endpoint:** `GET /reports/inspections/preview`

**Descripción:** Obtiene una vista previa de los datos que se exportarían sin descargar el archivo. Útil para verificar los filtros antes de generar el reporte.

**Query Parameters:**
- `startDate` (opcional): Fecha inicio
- `endDate` (opcional): Fecha fin
- `status` (opcional): Estado
- `inspectorId` (opcional): ID del inspector

**Ejemplo de uso:**
```http
GET http://localhost:3000/reports/inspections/preview?status=Revisado
```

**Respuesta JSON:**
```json
{
  "total": 45,
  "filters": {
    "startDate": null,
    "endDate": null,
    "status": "Revisado",
    "inspectorId": null
  },
  "sample": [
    {
      "id": 1,
      "inspectionDate": "2025-10-15",
      "procedureNumber": "PROC-001",
      "status": "Revisado",
      ...
    },
    ...primeras 5 inspecciones...
  ]
}
```

---

## 🔧 Instalación

Las siguientes dependencias fueron instaladas automáticamente:

```bash
npm install pdfkit json2csv @types/pdfkit
```

**Dependencias:**
- `pdfkit`: Generación de PDFs
- `json2csv`: Conversión de JSON a CSV
- `@types/pdfkit`: TypeScript types para pdfkit

---

## 📊 Casos de Uso

### **Caso 1: Reporte Mensual**

Exportar todas las inspecciones del mes en CSV para análisis en Excel:

```http
GET /reports/inspections/csv?startDate=2025-10-01&endDate=2025-10-31
```

---

### **Caso 2: Reporte de Inspector Específico**

Exportar todas las inspecciones de un inspector en PDF:

```http
GET /reports/inspections/pdf?inspectorId=5
```

---

### **Caso 3: Inspecciones Pendientes**

Exportar todas las inspecciones en estado "Nuevo":

```http
GET /reports/inspections/csv?status=Nuevo
```

---

### **Caso 4: Reporte Detallado para Auditoría**

Exportar PDF detallado de una inspección específica:

```http
GET /reports/inspections/123/pdf
```

---

## 🎨 Características del PDF

### **Reporte General:**
- Formato A4
- Márgenes de 50px
- Encabezado con título y fecha
- Listado con viñetas numeradas
- Líneas separadoras entre inspecciones
- Paginación automática
- Pie de página con número de página

### **Reporte Detallado:**
- Formato A4
- Secciones claramente diferenciadas
- Títulos con formato bold y underline
- Información organizada jerárquicamente
- Datos de auditoría incluidos

---

## 📝 Formato CSV

### **Características:**
- Delimitador: coma (`,`)
- Codificación: UTF-8 con BOM (compatible con Excel)
- Encabezados en español
- Valores "N/A" para datos faltantes
- Campos "Sí/No" para dependencias booleanas

### **Ejemplo de contenido:**
```csv
ID,Fecha de Inspección,Número de Procedimiento,Estado,Inspectores
1,2025-10-15,PROC-001,Revisado,"Juan Pérez, María López"
2,2025-10-16,PROC-002,En proceso,"Carlos García"
```

---

## 🔍 Filtros Disponibles

### **Por Fecha:**
```http
?startDate=2025-01-01&endDate=2025-12-31
```
Filtra inspecciones entre dos fechas (inclusive).

### **Por Estado:**
```http
?status=Revisado
```
Estados válidos:
- Nuevo
- En proceso
- Revisado
- Archivado
- Papelera

### **Por Inspector:**
```http
?inspectorId=5
```
Filtra inspecciones asignadas a un inspector específico.

### **Combinación de Filtros:**
```http
?startDate=2025-10-01&endDate=2025-10-31&status=Revisado&inspectorId=5
```

---

## ⚠️ Consideraciones

### **Rendimiento:**
- Los reportes con muchas inspecciones pueden tardar varios segundos
- Se recomienda usar filtros para limitar la cantidad de datos
- El endpoint de vista previa es útil para verificar antes de generar

### **Memoria:**
- Los PDFs se generan en memoria (Buffer)
- Para reportes muy grandes (>1000 inspecciones), considerar paginación

### **Formato de Fechas:**
- Todas las fechas deben estar en formato: `YYYY-MM-DD`
- Ejemplo: `2025-10-21`

---

## 🐛 Manejo de Errores

### **CSV/PDF General:**
```json
{
  "message": "Error al generar el reporte CSV",
  "error": "Descripción del error"
}
```

### **PDF Detallado:**
```json
{
  "message": "Inspección no encontrada"
}
```

---

## 🧪 Testing

### **Probar CSV:**
```bash
curl -X GET "http://localhost:3000/reports/inspections/csv?status=Nuevo" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output reporte.csv
```

### **Probar PDF:**
```bash
curl -X GET "http://localhost:3000/reports/inspections/pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output reporte.pdf
```

### **Probar Vista Previa:**
```bash
curl -X GET "http://localhost:3000/reports/inspections/preview?status=Revisado" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Integración Frontend

### **Descargar CSV:**
```javascript
const downloadCSV = async (filters) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `http://localhost:3000/reports/inspections/csv?${queryParams}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `inspecciones_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
```

### **Descargar PDF:**
```javascript
const downloadPDF = async (filters) => {
  const queryParams = new URLSearchParams(filters).toString();
  const url = `http://localhost:3000/reports/inspections/pdf?${queryParams}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `reporte_${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
};
```

### **Descargar PDF Detallado:**
```javascript
const downloadDetailedPDF = async (inspectionId) => {
  const url = `http://localhost:3000/reports/inspections/${inspectionId}/pdf`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al generar el reporte');
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `inspeccion_${inspectionId}_detallada.pdf`;
  link.click();
};
```

---

## 🚀 Próximas Mejoras (Opcional)

- [ ] Agregar gráficos y estadísticas en PDF
- [ ] Soporte para exportar a Excel (.xlsx)
- [ ] Personalización de columnas en CSV
- [ ] Envío de reportes por email
- [ ] Programación de reportes automáticos
- [ ] Agregar logo de la municipalidad en PDFs
- [ ] Reportes por rangos de fecha predefinidos (hoy, esta semana, este mes)

---

## 📞 Soporte

Si encuentras algún problema o necesitas una funcionalidad adicional, contacta al equipo de desarrollo.

---

**Fecha de Creación:** 21 de Octubre 2025  
**Versión:** 1.0  
**Estado:** Funcional y listo para usar
