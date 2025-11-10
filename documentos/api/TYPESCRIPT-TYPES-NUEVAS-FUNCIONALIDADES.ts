/**
 * 📦 TIPOS TYPESCRIPT PARA NUEVAS FUNCIONALIDADES
 * 
 * Este archivo contiene todos los tipos TypeScript necesarios para implementar
 * las 3 nuevas funcionalidades en el frontend:
 * - Collection (Cobros/Notificaciones)
 * - Revenue Patent (Patentes de Ingresos)
 * - Work Closure (Cierres de Obra)
 * 
 * Fecha: 13 de octubre de 2025
 */

// ============================================================================
// 1️⃣ COLLECTION (Cobros/Notificaciones)
// ============================================================================

/**
 * Interfaz para registrar intentos de cobro/notificación
 * Todos los campos son opcionales
 */
export interface Collection {
  /** URL o data URI de la firma del notificador (máx 500 caracteres) */
  notifierSignatureUrl?: string;
  
  /** Marca "X" cuando nadie estaba presente, null/undefined cuando no está marcado */
  nobodyPresent?: "X";
  
  /** Marca "X" cuando la dirección era incorrecta, null/undefined cuando no está marcado */
  wrongAddress?: "X";
  
  /** Marca "X" cuando la persona cambió de domicilio, null/undefined cuando no está marcado */
  movedAddress?: "X";
  
  /** Marca "X" cuando la persona se negó a firmar, null/undefined cuando no está marcado */
  refusedToSign?: "X";
  
  /** Marca "X" cuando no se localizó a la persona, null/undefined cuando no está marcado */
  notLocated?: "X";
  
  /** Campo de texto libre para otras observaciones (máx 300 caracteres) */
  other?: string;
}

/**
 * DTO para crear una Collection
 */
export interface CreateCollectionDto extends Collection {}

/**
 * DTO para actualizar una Collection (todos los campos opcionales)
 */
export interface UpdateCollectionDto extends Partial<Collection> {}

// ============================================================================
// 2️⃣ REVENUE PATENT (Patentes de Ingresos)
// ============================================================================

/**
 * Tipos de licencia disponibles
 */
export enum LicenseType {
  /** Licencia de licores */
  LIQUOR_LICENSE = 'licencia_licores',
  /** Licencia comercial */
  COMMERCIAL_LICENSE = 'licencia_comercial'
}

/**
 * Opciones de demarcación de zona
 */
export enum ZoneDemarcationOption {
  /** Según uso de suelo */
  ACCORDING_TO_LAND_USE = 'segun_uso_suelo',
  /** Según plan regulador */
  ACCORDING_TO_REGULATORY_PLAN = 'segun_plan_regulatorio'
}

/**
 * Opciones de conformidad con plan regulador
 */
export enum RegulatoryPlanConformityOption {
  /** Según plan regulador */
  ACCORDING_TO_REGULATORY_PLAN = 'segun_plan_regulatorio',
  /** No aplicable */
  NOT_APPLICABLE = 'no_aplicable'
}

/**
 * Interfaz para patentes comerciales y licencias de licores
 */
export interface RevenuePatent {
  /** Nombre comercial del establecimiento (REQUERIDO, máx 200 caracteres) */
  tradeName: string;
  
  /** Tipo de licencia (REQUERIDO) */
  licenseType: LicenseType;
  
  /** Número de finca (máx 50 caracteres) */
  propertyNumber?: string;
  
  /** Número de catastro (máx 50 caracteres) */
  cadastralNumber?: string;
  
  /** Referencia de uso de suelo (máx 50 caracteres) */
  landUseReference?: string;
  
  // Distancias a centros sensibles (formato: "123m" o "123 m")
  
  /** Distancia a centros educativos (formato: "123m" o "123 m", máx 16 caracteres) */
  educationalCenters?: string;
  
  /** Distancia a CEN - Centros de Nutrición Infantil (formato: "123m" o "123 m", máx 16 caracteres) */
  childNutritionCenters?: string;
  
  /** Distancia a centros religiosos (formato: "123m" o "123 m", máx 16 caracteres) */
  religiousFacilities?: string;
  
  /** Distancia a centros de cuido de adultos mayores (formato: "123m" o "123 m", máx 16 caracteres) */
  elderCareCenters?: string;
  
  /** Distancia a hospitales (formato: "123m" o "123 m", máx 16 caracteres) */
  hospitals?: string;
  
  /** Distancia a clínicas (formato: "123m" o "123 m", máx 16 caracteres) */
  clinics?: string;
  
  /** Distancia a EBAIS (formato: "123m" o "123 m", máx 16 caracteres) */
  ebais?: string;
  
  // Demarcación de zona
  
  /** Tipo de demarcación de zona */
  zoneDemarcation?: ZoneDemarcationOption;
  
  /** Observación sobre la demarcación de zona (máx 400 caracteres) */
  zoneDemarcationObservation?: string;
  
  // Conformidad con plan regulador
  
  /** Conformidad con plan regulador */
  regulatoryPlanConformity?: RegulatoryPlanConformityOption;
  
  /** Observación sobre conformidad con plan regulador (máx 400 caracteres) */
  regulatoryPlanObservation?: string;
  
  /** Observaciones generales (sin límite) */
  observations?: string;
  
  /** URLs de fotografías */
  photoUrls?: string[];
}

/**
 * DTO para crear una Revenue Patent
 */
export interface CreateRevenuePatentDto extends RevenuePatent {}

/**
 * DTO para actualizar una Revenue Patent (todos los campos opcionales)
 */
export interface UpdateRevenuePatentDto extends Partial<RevenuePatent> {
  /** tradeName puede ser opcional en una actualización */
  tradeName?: string;
  /** licenseType puede ser opcional en una actualización */
  licenseType?: LicenseType;
}

// ============================================================================
// 3️⃣ WORK CLOSURE (Cierre de Obra)
// ============================================================================

/**
 * Número de visita
 */
export enum VisitNumber {
  /** Primera visita */
  VISIT_1 = 'visita_1',
  /** Segunda visita */
  VISIT_2 = 'visita_2',
  /** Tercera visita */
  VISIT_3 = 'visita_3'
}

/**
 * Interfaz para cierres de obra
 */
export interface WorkClosure {
  /** Número de finca (máx 50 caracteres) */
  propertyNumber?: string;
  
  /** Número de catastro (máx 50 caracteres) */
  cadastralNumber?: string;
  
  /** Número de contrato (máx 50 caracteres) */
  contractNumber?: string;
  
  /** Número de permiso (máx 50 caracteres) */
  permitNumber?: string;
  
  /** Área tasada (formato libre, ej: "120 m²", máx 24 caracteres) */
  assessedArea?: string;
  
  /** Área construida (formato libre, ej: "115 m²", máx 24 caracteres) */
  builtArea?: string;
  
  /** Número de visita */
  visitNumber?: VisitNumber;
  
  /** Recibo de obra (REQUERIDO) */
  workReceipt: boolean;
  
  /** Acciones tomadas (máx 500 caracteres) */
  actions?: string;
  
  /** Observaciones (máx 500 caracteres) */
  observations?: string;
  
  /** URLs de fotografías */
  photoUrls?: string[];
}

/**
 * DTO para crear un Work Closure
 */
export interface CreateWorkClosureDto extends WorkClosure {}

/**
 * DTO para actualizar un Work Closure (todos los campos opcionales)
 */
export interface UpdateWorkClosureDto extends Partial<WorkClosure> {
  /** workReceipt puede ser opcional en una actualización */
  workReceipt?: boolean;
}

// ============================================================================
// 🔧 TIPOS DE INSPECCIÓN ACTUALIZADOS
// ============================================================================

/**
 * Tipos de inspección disponibles (incluyendo los nuevos)
 */
export enum InspectionType {
  // Tipos existentes
  ZMT = 'zmt',
  LAND_USE = 'land_use',
  CONSTRUCTION = 'construction',
  ANTIQUITY = 'antiquity',
  GENERAL_INSPECTION = 'general_inspection',
  MAYOR_OFFICE = 'mayor_office',
  LOCATION = 'location',
  TAX_PROCEDURE = 'tax_procedure',
  WORK_RECEIPT = 'work_receipt',
  PC_CANCELLATION = 'pc_cancellation',
  INDIVIDUAL_REQUEST = 'individual_request',
  LEGAL_ENTITY_REQUEST = 'legal_entity_request',
  
  // Nuevos tipos
  COLLECTION = 'collection',
  REVENUE_PATENT = 'revenue_patent',
  WORK_CLOSURE = 'work_closure'
}

/**
 * Interfaz base para crear una inspección (simplificada)
 */
export interface CreateInspectionDto {
  /** Tipo de inspección */
  type: InspectionType;
  
  /** IDs de los inspectores asignados */
  inspectorIds: number[];
  
  // Campos opcionales según el tipo de inspección
  
  /** Datos de Collection (solo si type = 'collection') */
  collection?: CreateCollectionDto;
  
  /** Datos de Revenue Patent (solo si type = 'revenue_patent') */
  revenuePatent?: CreateRevenuePatentDto;
  
  /** Datos de Work Closure (solo si type = 'work_closure') */
  workClosure?: CreateWorkClosureDto;
  
  // ... otros tipos de inspección existentes ...
}

// ============================================================================
// 🎨 HELPERS Y VALIDADORES
// ============================================================================

/**
 * Valida si un valor es una marca válida para checkboxes de Collection
 * @param value Valor a validar
 * @returns true si es "X" o "x"
 */
export function isValidCollectionMark(value: any): value is "X" {
  return value === "X" || value === "x";
}

/**
 * Valida el formato de distancia para Revenue Patent
 * @param value Valor a validar
 * @returns true si cumple con el formato "123m" o "123 m"
 */
export function isValidDistance(value: string): boolean {
  return /^\d{1,9}\s?m$/i.test(value);
}

/**
 * Convierte un checkbox a marca "X" o undefined
 * @param checked Estado del checkbox
 * @returns "X" si está marcado, undefined si no
 */
export function checkboxToMark(checked: boolean): "X" | undefined {
  return checked ? "X" : undefined;
}

/**
 * Convierte una marca "X" a estado de checkbox
 * @param mark Marca del backend
 * @returns true si la marca es "X", false si no
 */
export function markToCheckbox(mark: string | null | undefined): boolean {
  return mark === "X" || mark === "x";
}

/**
 * Formatea una distancia agregando "m" si no lo tiene
 * @param value Número o string con la distancia
 * @returns String formateado como "123m"
 */
export function formatDistance(value: number | string): string {
  const num = typeof value === 'string' ? parseInt(value) : value;
  return `${num}m`;
}

/**
 * Parsea una distancia a número
 * @param distance String con formato "123m" o "123 m"
 * @returns Número extraído
 */
export function parseDistance(distance: string): number | null {
  const match = distance.match(/^(\d+)\s?m$/i);
  return match ? parseInt(match[1]) : null;
}

// ============================================================================
// 📊 CONSTANTES Y TRADUCCIONES
// ============================================================================

/**
 * Traducciones de LicenseType
 */
export const LicenseTypeLabels: Record<LicenseType, string> = {
  [LicenseType.LIQUOR_LICENSE]: 'Licencia de Licores',
  [LicenseType.COMMERCIAL_LICENSE]: 'Licencia Comercial'
};

/**
 * Traducciones de ZoneDemarcationOption
 */
export const ZoneDemarcationLabels: Record<ZoneDemarcationOption, string> = {
  [ZoneDemarcationOption.ACCORDING_TO_LAND_USE]: 'Según uso de suelo',
  [ZoneDemarcationOption.ACCORDING_TO_REGULATORY_PLAN]: 'Según plan regulador'
};

/**
 * Traducciones de RegulatoryPlanConformityOption
 */
export const RegulatoryPlanConformityLabels: Record<RegulatoryPlanConformityOption, string> = {
  [RegulatoryPlanConformityOption.ACCORDING_TO_REGULATORY_PLAN]: 'Según plan regulador',
  [RegulatoryPlanConformityOption.NOT_APPLICABLE]: 'No aplicable'
};

/**
 * Traducciones de VisitNumber
 */
export const VisitNumberLabels: Record<VisitNumber, string> = {
  [VisitNumber.VISIT_1]: 'Visita 1',
  [VisitNumber.VISIT_2]: 'Visita 2',
  [VisitNumber.VISIT_3]: 'Visita 3'
};

/**
 * Labels para los checkboxes de Collection
 */
export const CollectionCheckboxLabels = {
  nobodyPresent: 'No había nadie',
  wrongAddress: 'Dirección incorrecta',
  movedAddress: 'Cambió domicilio',
  refusedToSign: 'No quiso firmar',
  notLocated: 'No se localiza'
} as const;

/**
 * Labels para las distancias de Revenue Patent
 */
export const DistanceFieldLabels = {
  educationalCenters: 'Centros Educativos',
  childNutritionCenters: 'CEN (Centros de Nutrición Infantil)',
  religiousFacilities: 'Centros Religiosos',
  elderCareCenters: 'Centros de Cuido de Adultos Mayores',
  hospitals: 'Hospitales',
  clinics: 'Clínicas',
  ebais: 'EBAIS'
} as const;

// ============================================================================
// 🔍 TYPE GUARDS
// ============================================================================

/**
 * Verifica si una inspección es de tipo Collection
 */
export function isCollectionInspection(inspection: any): inspection is { collection: Collection } {
  return inspection.type === InspectionType.COLLECTION && !!inspection.collection;
}

/**
 * Verifica si una inspección es de tipo Revenue Patent
 */
export function isRevenuePatentInspection(inspection: any): inspection is { revenuePatent: RevenuePatent } {
  return inspection.type === InspectionType.REVENUE_PATENT && !!inspection.revenuePatent;
}

/**
 * Verifica si una inspección es de tipo Work Closure
 */
export function isWorkClosureInspection(inspection: any): inspection is { workClosure: WorkClosure } {
  return inspection.type === InspectionType.WORK_CLOSURE && !!inspection.workClosure;
}

// ============================================================================
// 📋 VALORES POR DEFECTO
// ============================================================================

/**
 * Valores por defecto para Collection
 */
export const defaultCollection: Partial<Collection> = {
  notifierSignatureUrl: '',
  other: ''
};

/**
 * Valores por defecto para Revenue Patent
 */
export const defaultRevenuePatent: Partial<RevenuePatent> = {
  tradeName: '',
  licenseType: LicenseType.COMMERCIAL_LICENSE,
  zoneDemarcation: ZoneDemarcationOption.ACCORDING_TO_LAND_USE,
  regulatoryPlanConformity: RegulatoryPlanConformityOption.ACCORDING_TO_REGULATORY_PLAN,
  photoUrls: []
};

/**
 * Valores por defecto para Work Closure
 */
export const defaultWorkClosure: Partial<WorkClosure> = {
  workReceipt: false,
  photoUrls: []
};

// ============================================================================
// 🎯 EJEMPLO DE USO
// ============================================================================

/**
 * Ejemplo de cómo crear una inspección de tipo Collection
 */
export const exampleCollectionInspection: CreateInspectionDto = {
  type: InspectionType.COLLECTION,
  inspectorIds: [1],
  collection: {
    notifierSignatureUrl: 'https://cloudinary.com/signatures/firma.png',
    nobodyPresent: 'X',
    other: 'El vecino indicó que regresa el lunes'
  }
};

/**
 * Ejemplo de cómo crear una inspección de tipo Revenue Patent
 */
export const exampleRevenuePatentInspection: CreateInspectionDto = {
  type: InspectionType.REVENUE_PATENT,
  inspectorIds: [1, 2],
  revenuePatent: {
    tradeName: 'Bar El Amanecer',
    licenseType: LicenseType.LIQUOR_LICENSE,
    propertyNumber: '12345',
    educationalCenters: '500m',
    clinics: '150m',
    zoneDemarcation: ZoneDemarcationOption.ACCORDING_TO_LAND_USE,
    observations: 'Cumple con todas las regulaciones'
  }
};

/**
 * Ejemplo de cómo crear una inspección de tipo Work Closure
 */
export const exampleWorkClosureInspection: CreateInspectionDto = {
  type: InspectionType.WORK_CLOSURE,
  inspectorIds: [1],
  workClosure: {
    propertyNumber: 'FINCA-2025-001',
    cadastralNumber: 'CAT-SC-12345',
    assessedArea: '150 m²',
    builtArea: '140 m²',
    visitNumber: VisitNumber.VISIT_2,
    workReceipt: true,
    actions: 'Se verificó el cumplimiento de planos',
    observations: 'Obra en buen estado general'
  }
};

// ============================================================================
// 🛠️ UTILIDADES PARA FORMULARIOS
// ============================================================================

/**
 * Limpia un objeto Collection eliminando campos undefined
 */
export function cleanCollection(collection: Partial<Collection>): Collection {
  const cleaned: any = {};
  
  if (collection.notifierSignatureUrl) {
    cleaned.notifierSignatureUrl = collection.notifierSignatureUrl;
  }
  
  if (collection.nobodyPresent === 'X') cleaned.nobodyPresent = 'X';
  if (collection.wrongAddress === 'X') cleaned.wrongAddress = 'X';
  if (collection.movedAddress === 'X') cleaned.movedAddress = 'X';
  if (collection.refusedToSign === 'X') cleaned.refusedToSign = 'X';
  if (collection.notLocated === 'X') cleaned.notLocated = 'X';
  
  if (collection.other) {
    cleaned.other = collection.other;
  }
  
  return cleaned;
}

/**
 * Limpia un objeto RevenuePatent eliminando campos undefined o vacíos
 */
export function cleanRevenuePatent(patent: Partial<RevenuePatent>): Partial<RevenuePatent> {
  const cleaned: any = {
    tradeName: patent.tradeName,
    licenseType: patent.licenseType
  };
  
  // Agregar campos opcionales solo si tienen valor
  const optionalFields: (keyof RevenuePatent)[] = [
    'propertyNumber', 'cadastralNumber', 'landUseReference',
    'educationalCenters', 'childNutritionCenters', 'religiousFacilities',
    'elderCareCenters', 'hospitals', 'clinics', 'ebais',
    'zoneDemarcation', 'zoneDemarcationObservation',
    'regulatoryPlanConformity', 'regulatoryPlanObservation',
    'observations'
  ];
  
  optionalFields.forEach(field => {
    if (patent[field]) {
      cleaned[field] = patent[field];
    }
  });
  
  if (patent.photoUrls && patent.photoUrls.length > 0) {
    cleaned.photoUrls = patent.photoUrls;
  }
  
  return cleaned;
}

/**
 * Limpia un objeto WorkClosure eliminando campos undefined o vacíos
 */
export function cleanWorkClosure(closure: Partial<WorkClosure>): Partial<WorkClosure> {
  const cleaned: any = {
    workReceipt: closure.workReceipt ?? false
  };
  
  const optionalFields: (keyof WorkClosure)[] = [
    'propertyNumber', 'cadastralNumber', 'contractNumber', 'permitNumber',
    'assessedArea', 'builtArea', 'visitNumber', 'actions', 'observations'
  ];
  
  optionalFields.forEach(field => {
    if (closure[field]) {
      cleaned[field] = closure[field];
    }
  });
  
  if (closure.photoUrls && closure.photoUrls.length > 0) {
    cleaned.photoUrls = closure.photoUrls;
  }
  
  return cleaned;
}
