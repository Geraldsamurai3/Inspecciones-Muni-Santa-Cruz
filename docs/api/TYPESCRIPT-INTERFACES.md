# 🔷 TypeScript Interfaces

Interfaces completas para integración frontend con TypeScript

## 👤 Auth & Users

### RegisterDto
```typescript
interface RegisterDto {
  email: string;                // Formato email válido
  password: string;             // Mínimo 6 caracteres
  firstName: string;            // 1-50 caracteres
  lastName: string;             // 1-50 caracteres
  secondLastName?: string;      // Opcional, 1-50 caracteres
  cedula: string;               // Formato: X-XXXX-XXXX
  phone?: string;               // Opcional
  role?: 'admin' | 'inspector'; // Opcional, default: 'inspector'
}
```

### LoginDto
```typescript
interface LoginDto {
  email: string;    // Email registrado
  password: string; // Contraseña del usuario
}
```

### AuthResponse
```typescript
interface AuthResponse {
  access_token: string;
  user: UserResponse;
}
```

### UserResponse
```typescript
interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  cedula: string;
  phone?: string;
  role: 'admin' | 'inspector';
  isBlocked: boolean;
  createdAt: string;           // ISO 8601 date
  updatedAt: string;           // ISO 8601 date
}
```

### UpdateUserDto
```typescript
interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  phone?: string;
  password?: string;
}
```

---

## 📋 Inspections

### CreateInspectionDto
```typescript
interface CreateInspectionDto {
  inspectionDate: string;                                // YYYY-MM-DD
  procedureNumber: string;                               // Único
  applicantType: 'Anonimo' | 'Persona Física' | 'Persona Jurídica';
  inspectorIds: number[];                                // Array de IDs de inspectores
  
  // Solicitante - Persona Física (si applicantType es 'Persona Física')
  individualRequest?: CreateIndividualRequestDto;
  
  // Solicitante - Persona Jurídica (si applicantType es 'Persona Jurídica')
  legalEntityRequest?: CreateLegalEntityRequestDto;
  
  // Datos de construcción
  construction?: CreateConstructionDto;
  
  // Ubicación
  location?: CreateLocationDto;
  
  // Otros módulos opcionales
  generalInspection?: CreateGeneralInspectionDto;
  concession?: CreateConcessionDto;
  antiquity?: CreateAntiquityDto;
  mayorOffice?: CreateMayorOfficeDto;
  taxProcedures?: CreateTaxProceduresDto;
  pcCancellation?: CreatePcCancellationDto;
  workReceipts?: CreateWorkReceiptsDto;
}
```

### InspectionResponse
```typescript
interface InspectionResponse {
  id: number;
  inspectionDate: string;
  procedureNumber: string;
  applicantType: 'Anonimo' | 'Persona Física' | 'Persona Jurídica';
  status: 'Nuevo' | 'En proceso' | 'Revisado' | 'Archivado';
  
  inspectors: UserResponse[];
  
  individualRequest?: IndividualRequestResponse;
  legalEntityRequest?: LegalEntityRequestResponse;
  construction?: ConstructionResponse;
  location?: LocationResponse;
  generalInspection?: GeneralInspectionResponse;
  concession?: ConcessionResponse;
  antiquity?: AntiquityResponse;
  mayorOffice?: MayorOfficeResponse;
  taxProcedures?: TaxProceduresResponse;
  pcCancellation?: PcCancellationResponse;
  workReceipts?: WorkReceiptsResponse;
  
  createdAt: string;
  updatedAt: string;
}
```

### UpdateInspectionDto
```typescript
interface UpdateInspectionDto {
  inspectionDate?: string;
  status?: 'Nuevo' | 'En proceso' | 'Revisado' | 'Archivado';
  inspectorIds?: number[];
}
```

---

## 👤 Individual Request (Persona Física)

### CreateIndividualRequestDto
```typescript
interface CreateIndividualRequestDto {
  firstName: string;      // 1-50 caracteres
  lastName: string;       // 1-50 caracteres
  secondLastName?: string; // Opcional
  cedula: string;         // Formato: X-XXXX-XXXX
  phone: string;          // Requerido
  address?: string;       // Opcional
}
```

### IndividualRequestResponse
```typescript
interface IndividualRequestResponse {
  id: number;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  cedula: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🏢 Legal Entity Request (Persona Jurídica)

### CreateLegalEntityRequestDto
```typescript
interface CreateLegalEntityRequestDto {
  legalName: string;           // 1-150 caracteres (Nombre de la empresa)
  judicialNumber: string;      // Cédula jurídica
  representativeName: string;  // Nombre del representante
  representativeCedula: string; // Cédula del representante
  phone: string;
  address?: string;
}
```

### LegalEntityRequestResponse
```typescript
interface LegalEntityRequestResponse {
  id: number;
  legalName: string;
  judicialNumber: string;
  representativeName: string;
  representativeCedula: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🏗️ Construction

### CreateConstructionDto
```typescript
interface CreateConstructionDto {
  propertyNumber: string;        // Número de finca
  district?: string;             // Distrito
  propertyArea?: number;         // Área del terreno (m²)
  buildingArea?: number;         // Área de construcción (m²)
  description?: string;          // Descripción del proyecto
  images?: string[];             // URLs de imágenes (Cloudinary)
}
```

### ConstructionResponse
```typescript
interface ConstructionResponse {
  id: number;
  propertyNumber: string;
  district?: string;
  propertyArea?: number;
  buildingArea?: number;
  description?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 📍 Location

### CreateLocationDto
```typescript
interface CreateLocationDto {
  province?: string;
  canton?: string;
  district?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### LocationResponse
```typescript
interface LocationResponse {
  id: number;
  province?: string;
  canton?: string;
  district?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔍 General Inspection

### CreateGeneralInspectionDto
```typescript
interface CreateGeneralInspectionDto {
  observaciones?: string;
  recomendaciones?: string;
  cumpleNormativa?: boolean;
  fechaVisita?: string;        // YYYY-MM-DD
  duracionVisita?: number;     // Minutos
  inspectorNotas?: string;
}
```

### GeneralInspectionResponse
```typescript
interface GeneralInspectionResponse {
  id: number;
  observaciones?: string;
  recomendaciones?: string;
  cumpleNormativa?: boolean;
  fechaVisita?: string;
  duracionVisita?: number;
  inspectorNotas?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 📊 Dashboard

### InspectorDashboardResponse
```typescript
interface InspectorDashboardResponse {
  inspector: {
    id: number;
    nombre: string;
    email: string;
    role: string;
  };
  resumen: {
    totalInspecciones: number;
    tareasPendientes: number;
    completadasEsteMes: number;
    inspeccionesEsteMes: number;
    inspeccionesEstaSemana: number;
  };
  estadisticasPorEstado: {
    nueva: number;
    enProgreso: number;
    revisada: number;
    archivada: number;
  };
  tareasPendientes: InspectionSummary[];
  ultimasCompletadas: InspectionSummary[];
  productividad: {
    promedioPorMes: number;
    tendencia: 'ascendente' | 'descendente' | 'estable';
  };
}
```

### AdminDashboardResponse
```typescript
interface AdminDashboardResponse {
  miDashboard: InspectorDashboardResponse;
  vistaAdministrativa: {
    estadisticasGenerales: {
      totalInspecciones: number;
      totalInspectores: number;
      nueva: number;
      enProgreso: number;
      revisada: number;
      archivada: number;
    };
    kpis: {
      totalInspeccionesActivas: number;
      totalInspeccionesRevisadas: number;
      promedioInspeccionesPorInspector: number;
      inspeccionesEsteMes: number;
      tasaCompletitud: number;
    };
    rendimientoPorInspector: InspectorPerformance[];
  };
}
```

### InspectorPerformance
```typescript
interface InspectorPerformance {
  inspector: {
    id: number;
    nombre: string;
    email: string;
  };
  totalInspecciones: number;
  completadas: number;
  pendientes: number;
  esteMes: number;
}
```

### StatsByPeriodResponse
```typescript
interface StatsByPeriodResponse {
  periodo: {
    inicio: string;
    fin: string;
  };
  total: number;
  porEstado: {
    nueva: number;
    enProgreso: number;
    revisada: number;
    archivada: number;
  };
  porTipo: {
    anonimo: number;
    personaFisica: number;
    personaJuridica: number;
  };
  inspecciones: InspectionSummary[];
}
```

### InspectionSummary
```typescript
interface InspectionSummary {
  id: number;
  procedureNumber: string;
  inspectionDate: string;
  status: string;
  applicantType: string;
}
```

---

## ☁️ Cloudinary

### UploadImageResponse
```typescript
interface UploadImageResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}
```

### DeleteImageResponse
```typescript
interface DeleteImageResponse {
  message: string;
}
```

---

## ⚠️ Error Responses

### ErrorResponse
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}
```

### Ejemplos de ErrorResponse

**401 Unauthorized:**
```typescript
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**400 Bad Request:**
```typescript
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**404 Not Found:**
```typescript
{
  "statusCode": 404,
  "message": "Usuario no encontrado",
  "error": "Not Found"
}
```

**422 Validation Error:**
```typescript
{
  "statusCode": 422,
  "message": [
    "legalName must be between 1 and 150 characters",
    "legalName is required"
  ],
  "error": "Unprocessable Entity"
}
```

---

## 🔐 Auth Headers

### Estructura del Token JWT
```typescript
interface JWTPayload {
  sub: number;      // User ID
  email: string;    // User email
  role: string;     // User role
  iat: number;      // Issued at (timestamp)
  exp: number;      // Expires at (timestamp)
}
```

### Header de Autorización
```typescript
// En cada petición autenticada
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📝 Query Parameters

### Filtros Comunes (Inspecciones)
```typescript
interface InspectionQueryParams {
  status?: 'Nuevo' | 'En proceso' | 'Revisado' | 'Archivado';
  inspectorId?: number;
  startDate?: string;    // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
  applicantType?: 'Anonimo' | 'Persona Física' | 'Persona Jurídica';
  page?: number;
  limit?: number;
}
```

---

## 🎯 Enums

### InspectionStatus
```typescript
enum InspectionStatus {
  NUEVO = 'Nuevo',
  EN_PROCESO = 'En proceso',
  REVISADO = 'Revisado',
  ARCHIVADO = 'Archivado'
}
```

### ApplicantType
```typescript
enum ApplicantType {
  ANONIMO = 'Anonimo',
  PERSONA_FISICA = 'Persona Física',
  PERSONA_JURIDICA = 'Persona Jurídica'
}
```

### UserRole
```typescript
enum UserRole {
  ADMIN = 'admin',
  INSPECTOR = 'inspector'
}
```

---

## 📦 Uso con TypeScript

### Ejemplo: Cliente API Tipado
```typescript
import type { 
  AuthResponse, 
  InspectionResponse, 
  CreateInspectionDto 
} from './types/api';

class APIClient {
  private baseURL = 'http://localhost:3000';
  private token: string | null = null;

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data: AuthResponse = await response.json();
    this.token = data.access_token;
    return data;
  }

  async getInspections(): Promise<InspectionResponse[]> {
    const response = await fetch(`${this.baseURL}/inspections`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async createInspection(
    dto: CreateInspectionDto
  ): Promise<InspectionResponse> {
    const response = await fetch(`${this.baseURL}/inspections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dto)
    });
    return response.json();
  }
}
```

---

Para más ejemplos, consulta **INTEGRATION-EXAMPLES.md**
