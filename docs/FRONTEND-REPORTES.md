# 🎨 Frontend - Implementación de Reportes Individuales

## Descripción

Sistema de búsqueda y exportación de inspecciones **individuales por número de trámite**. El usuario ingresa un número de trámite, ve los datos y puede exportarlos en CSV o PDF.

---

## 📋 API Endpoints

### 1. Buscar Inspección
```
GET /api/reports/search?procedureNumber=12345
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "procedureNumber": "12345",
    "inspectionDate": "2025-10-15",
    "status": "Nuevo",
    "inspectors": [...],
    "construction": {...},
    // ... más datos
  }
}
```

### 2. Exportar a CSV
```
GET /api/reports/csv?procedureNumber=12345
```
Descarga archivo CSV con todos los datos de la inspección.

### 3. Exportar a PDF
```
GET /api/reports/pdf?procedureNumber=12345
```
Descarga PDF detallado de la inspección.

---

## Componentes Frontend

### 1. **Página de Reportes (ReportsPage.jsx)**

```jsx
import React, { useState } from 'react';
import { Input, Button, Card, Descriptions, message, Spin } from 'antd';
import { FileExcelOutlined, FilePdfOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const ReportsPage = () => {
  const [procedureNumber, setProcedureNumber] = useState('');
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar inspección
  const handleSearch = async () => {
    if (!procedureNumber.trim()) {
      message.warning('Ingrese un número de trámite');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/reports/search`, {
        params: { procedureNumber: procedureNumber.trim() }
      });
      
      setInspection(response.data.data);
      message.success('Inspección encontrada');
    } catch (error) {
      if (error.response?.status === 404) {
        message.error('No se encontró inspección con ese número de trámite');
      } else {
        message.error('Error al buscar inspección');
      }
      setInspection(null);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Exportar CSV
  const handleExportCSV = () => {
    const url = `/api/reports/csv?procedureNumber=${procedureNumber}`;
    window.open(url, '_blank');
    message.success('Descargando CSV...');
  };

  // Exportar PDF
  const handleExportPDF = () => {
    const url = `/api/reports/pdf?procedureNumber=${procedureNumber}`;
    window.open(url, '_blank');
    message.success('Generando PDF...');
  };

  return (
    <div className="reports-page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 Reporte Individual de Inspección</h1>
      
      {/* Buscador */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Input
            size="large"
            placeholder="Ingrese el número de trámite"
            value={procedureNumber}
            onChange={(e) => setProcedureNumber(e.target.value)}
            onPressEnter={handleSearch}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            Buscar
          </Button>
        </div>
      </Card>

      {/* Resultados */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      )}

      {inspection && !loading && (
        <>
          <Card title={`Inspección #${inspection.id} - Trámite ${inspection.procedureNumber}`}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Estado">{inspection.status}</Descriptions.Item>
              <Descriptions.Item label="Fecha">{inspection.inspectionDate || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Tipo de Solicitante">{inspection.applicantType}</Descriptions.Item>
              <Descriptions.Item label="Inspectores">
                {inspection.inspectors?.map(i => `${i.firstName} ${i.lastName}`).join(', ') || 'N/A'}
              </Descriptions.Item>
              
              {inspection.individualRequest && (
                <>
                  <Descriptions.Item label="Solicitante" span={2}>
                    {`${inspection.individualRequest.firstName} ${inspection.individualRequest.lastName1} ${inspection.individualRequest.lastName2 || ''}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cédula">{inspection.individualRequest.physicalId}</Descriptions.Item>
                </>
              )}
              
              {inspection.legalEntityRequest && (
                <>
                  <Descriptions.Item label="Empresa" span={2}>
                    {inspection.legalEntityRequest.legalName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cédula Jurídica">
                    {inspection.legalEntityRequest.legalId}
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Construcción">
                {inspection.construction ? '✅ Sí' : '❌ No'}
              </Descriptions.Item>
              <Descriptions.Item label="Ubicación">
                {inspection.location ? '✅ Sí' : '❌ No'}
              </Descriptions.Item>
              <Descriptions.Item label="Trámite Fiscal">
                {inspection.taxProcedure ? '✅ Sí' : '❌ No'}
              </Descriptions.Item>
              <Descriptions.Item label="Alcaldía">
                {inspection.mayorOffice ? '✅ Sí' : '❌ No'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Botones de Exportación */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<FileExcelOutlined />}
              onClick={handleExportCSV}
              style={{ minWidth: '180px' }}
            >
              Exportar CSV
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<FilePdfOutlined />}
              onClick={handleExportPDF}
              style={{ minWidth: '180px', background: '#dc3545' }}
            >
              Exportar PDF
            </Button>
          </div>
        </>
      )}

      {!inspection && !loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p>Ingrese un número de trámite para buscar la inspección</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
```

---

### 2. **Hook Personalizado (useReports.js)**

```javascript
import { useState } from 'react';
import axios from 'axios';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState(null);

  const searchByProcedure = async (procedureNumber) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reports/search', {
        params: { procedureNumber }
      });
      setInspection(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error al buscar inspección:', error);
      setInspection(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (procedureNumber) => {
    const url = `/api/reports/csv?procedureNumber=${procedureNumber}`;
    window.open(url, '_blank');
  };

  const downloadPDF = (procedureNumber) => {
    const url = `/api/reports/pdf?procedureNumber=${procedureNumber}`;
    window.open(url, '_blank');
  };

  return {
    loading,
    inspection,
    searchByProcedure,
    downloadCSV,
    downloadPDF,
  };
};

// Uso en componente:
// const { inspection, loading, searchByProcedure, downloadCSV, downloadPDF } = useReports();
```

---

### 3. **Servicio con Axios (reportsService.js)**

```javascript
import axios from 'axios';

const ReportsService = {
  // Buscar por número de trámite
  async searchInspection(procedureNumber) {
    try {
      const response = await axios.get('/api/reports/search', {
        params: { procedureNumber }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      throw error;
    }
  },

  // Descargar CSV
  async downloadCSV(procedureNumber) {
    try {
      const response = await axios.get('/api/reports/csv', {
        params: { procedureNumber },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      throw error;
    }
  },

  // Descargar PDF
  async downloadPDF(procedureNumber) {
    try {
      const response = await axios.get('/api/reports/pdf', {
        params: { procedureNumber },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  }
};

export default ReportsService;
```

---

## 🎯 Flujo de Usuario

1. **Usuario entra a página de reportes**
2. **Ingresa número de trámite** (ej: "12345")
3. **Click en "Buscar"** → Sistema muestra todos los datos de la inspección
4. **Click en "Exportar CSV"** → Descarga archivo CSV con todos los campos
5. **Click en "Exportar PDF"** → Descarga PDF formateado y profesional

---

## 🚨 Manejo de Errores

```javascript
const handleSearch = async () => {
  try {
    setLoading(true);
    const data = await ReportsService.searchInspection(procedureNumber);
    setInspection(data);
    message.success('Inspección encontrada');
  } catch (error) {
    if (error.response?.status === 404) {
      message.error('No se encontró inspección con ese número de trámite');
    } else if (error.response?.status === 400) {
      message.error('Debe proporcionar un número de trámite');
    } else {
      message.error('Error al buscar inspección');
    }
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Checklist de Implementación

- [ ] Crear página de reportes (`/reports`)
- [ ] Implementar campo de búsqueda por número de trámite
- [ ] Agregar botón "Buscar"
- [ ] Mostrar datos de la inspección encontrada
- [ ] Agregar botones "Exportar CSV" y "Exportar PDF"
- [ ] Manejar estados de carga (loading)
- [ ] Manejar errores (404, 400, 500)
- [ ] Agregar estilos y responsive
- [ ] Probar búsqueda con trámites existentes
- [ ] Probar búsqueda con trámites inexistentes
- [ ] Verificar que CSV abra correctamente en Excel
- [ ] Verificar que PDF se vea correctamente

---

## 🎨 Diseño Sugerido

### Mockup:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   📊  REPORTE INDIVIDUAL DE INSPECCIÓN          │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│   ┌────────────────────────────┐  ┌─────────┐  │
│   │ Número de Trámite: 12345   │  │ Buscar  │  │
│   └────────────────────────────┘  └─────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│   Inspección #1 - Trámite 12345                 │
│                                                  │
│   Estado:             Nuevo                      │
│   Fecha:              2025-10-15                 │
│   Tipo Solicitante:   Individual                 │
│   Inspectores:        Juan Pérez, Ana López     │
│                                                  │
│   Solicitante:        María Gómez García         │
│   Cédula:             1-1234-5678                │
│                                                  │
│   Construcción:       ✅ Sí                      │
│   Ubicación:          ✅ Sí                      │
│   Trámite Fiscal:     ❌ No                      │
│   Alcaldía:           ❌ No                      │
│                                                  │
│   ┌─────────────────┐  ┌─────────────────┐     │
│   │ 📊 Exportar CSV │  │ 📄 Exportar PDF │     │
│   └─────────────────┘  └─────────────────┘     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

**Fecha:** 27 de Octubre 2025  
**Versión:** 1.1  
**Listo para implementar** ✅

## 📊 ACTUALIZACIÓN: Estadísticas de Dependencias

Se han agregado nuevos endpoints para mostrar estadísticas de dependencias, con las subdependencias de construcción como categorías independientes.

### Nuevos Endpoints de Estadísticas

#### 1. Estadísticas Anidadas
```
GET /api/dashboard/stats/dependencies
```

Ver documentación completa en: `docs/ESTADISTICAS-SUBDEPENDENCIAS.md`

#### 2. Estadísticas Planas (para gráficos)
```
GET /api/dashboard/stats/dependencies/flat
```

**Response Ejemplo:**
```json
[
  { "nombre": "Construcción", "icono": "🏗️", "total": 75, "porcentaje": 75 },
  { "nombre": "Uso de Suelo", "icono": "📐", "total": 45, "porcentaje": 45, "esSubdependencia": true, "padre": "Construcción" },
  { "nombre": "Antigüedad", "icono": "⏰", "total": 30, "porcentaje": 30, "esSubdependencia": true, "padre": "Construcción" },
  ...
]
```

### Componentes Sugeridos

1. **Tabla Expandible** - Mostrar construcción con subdependencias colapsables
2. **Gráfico de Barras** - Visualizar todas las dependencias (incluyendo subdependencias)
3. **Cards con Iconos** - Grid de tarjetas, una por dependencia
4. **Gráfico de Donut** - Distribución visual de dependencias

Ver ejemplos de implementación completos en `docs/ESTADISTICAS-SUBDEPENDENCIAS.md`
