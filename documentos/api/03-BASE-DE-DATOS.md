# Base de Datos - Modelo de Datos

## Índice
1. [Configuración de Base de Datos](#configuración-de-base-de-datos)
2. [Modelo Entidad-Relación](#modelo-entidad-relación)
3. [Entidades Principales](#entidades-principales)
4. [Relaciones](#relaciones)
5. [Índices y Optimización](#índices-y-optimización)
6. [Migraciones](#migraciones)

---

## Configuración de Base de Datos

### Motor: MariaDB 10.x

```typescript
// TypeORM Configuration (app.module.ts)
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (cs: ConfigService) => ({
    type: 'mariadb',
    host: cs.get<string>('DB_HOST'),          // 127.0.0.1
    port: cs.get<number>('DB_PORT'),          // 3306
    username: cs.get<string>('DB_USERNAME'),  // root
    password: cs.get<string>('DB_PASSWORD'),
    database: cs.get<string>('DB_DATABASE'),  // inspect_muni
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: cs.get<boolean>('TYPEORM_SYNC', false), // true en dev
    autoLoadEntities: true,
  }),
})
```

### Variables de Entorno

```env
# .env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Andreylxi$$
DB_DATABASE=inspect_muni
TYPEORM_SYNC=true  # Solo en desarrollo
```

### Creación Automática de Base de Datos

```typescript
// main.ts
async function ensureDatabaseExists() {
  const tmpDs = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });
  await tmpDs.initialize();

  await tmpDs.query(`
    CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `);

  await tmpDs.destroy();
}
```

---

## Modelo Entidad-Relación

### Diagrama de Relaciones

```
┌──────────────┐
│     USER     │
├──────────────┤
│ id (PK)      │
│ email        │ Unique
│ passwordHash │
│ firstName    │
│ lastName     │
│ cedula       │ Unique
│ role         │ (admin/inspector)
│ isBlocked    │
│ resetToken   │
└──────┬───────┘
       │
       │ ManyToMany
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                        INSPECTION                                │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ procedureNumber                                                  │
│ inspectionDate                                                   │
│ applicantType (enum: Anonimo|Persona Física|Persona Jurídica)  │
│ status (enum: Nuevo|En proceso|Revisado|Archivado|Papelera)    │
│ reviewedAt                                                       │
│ deletedAt                                                        │
│ createdAt                                                        │
│ updatedAt                                                        │
└──┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬────┘
   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
┌──▼───────────┐  OneToOne (cascade)
│ Individual   │  ┌──────────────┐  ┌──────────────┐
│ Request      │  │ Legal Entity │  │ Construction │
├──────────────┤  │ Request      │  ├──────────────┤
│ id (PK)      │  ├──────────────┤  │ id (PK)      │
│ physicalId   │  │ id (PK)      │  │ landUseType  │
│ firstName    │  │ legalId      │  │ matches...   │
│ lastName1    │  │ legalName    │  │ recommended  │
│ lastName2    │  │ representative│  │ observations │
│ phone        │  │ repId        │  │ photos       │
│ email        │  │ phone        │  └──────────────┘
└──────────────┘  │ email        │
                  └──────────────┘

   OneToOne (cascade) a cada subdependencia:

┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   Land Use     │  │   Antiquity     │  │ PC Cancellation  │
├────────────────┤  ├─────────────────┤  ├──────────────────┤
│ id (PK)        │  │ id (PK)         │  │ id (PK)          │
│ observations   │  │ observations    │  │ observations     │
│ otherData      │  │ estimatedAge    │  │ reason           │
└────────────────┘  └─────────────────┘  └──────────────────┘

┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐
│ General          │  │  Work Receipt   │  │   Location   │
│ Inspection       │  ├─────────────────┤  ├──────────────┤
├──────────────────┤  │ id (PK)         │  │ id (PK)      │
│ id (PK)          │  │ observations    │  │ district     │
│ observations     │  │ recommended     │  │ exactAddress │
│ recommended      │  └─────────────────┘  │ latitude     │
└──────────────────┘                       │ longitude    │
                                           └──────────────┘

┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐
│ Tax Procedure    │  │  Mayor Office   │  │  Concession  │
├──────────────────┤  ├─────────────────┤  │     ZMT      │
│ id (PK)          │  │ id (PK)         │  ├──────────────┤
│ procedureType    │  │ observations    │  │ id (PK)      │
│ observations     │  │ recommended     │  │ concessionType│
└──────────────────┘  └─────────────────┘  │ observations │
                                           └──┬───────────┘
                                              │ OneToMany
                                              │
                                           ┌──▼──────────────┐
                                           │ Concession      │
                                           │ Parcel          │
                                           ├─────────────────┤
                                           │ id (PK)         │
                                           │ parcelNumber    │
                                           │ area            │
                                           │ observations    │
                                           └─────────────────┘

┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐
│   Collection     │  │ Revenue Patent  │  │ Work Closure │
├──────────────────┤  ├─────────────────┤  ├──────────────┤
│ id (PK)          │  │ id (PK)         │  │ id (PK)      │
│ notifierSignUrl  │  │ businessName    │  │ propertyNo   │
│ nobodyPresent    │  │ observations    │  │ cadastralNo  │
│ wrongAddress     │  └─────────────────┘  │ visitNumber  │
│ movedAddress     │                       │ photos[]     │
│ refusedToSign    │                       │ actions      │
│ notLocated       │                       │ observations │
│ other            │                       └──────────────┘
└──────────────────┘

┌──────────────────────┐
│ Platform & Service   │
├──────────────────────┤
│ id (PK)              │
│ procedureNumber      │
│ observation          │
└──────────────────────┘

┌──────────────────────────┐
│ inspection_users         │  (Tabla intermedia ManyToMany)
├──────────────────────────┤
│ inspection_id (FK)       │
│ user_id (FK)             │
└──────────────────────────┘
```

---

## Entidades Principales

### 1. User (Usuarios)

```typescript
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;
  
  @Column({ length: 100, nullable: true })
  secondLastName?: string;

  @Column({ length: 20, unique: true })
  cedula: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ default: 'inspector' })
  role: string;  // 'admin' | 'inspector'

  @Column({ default: false })
  isBlocked: boolean;

  @Column({ nullable: true })   
  resetToken?: string;  // SHA-256 hash

  @Column({ type: 'bigint', nullable: true })
  resetTokenExpires?: number;  // Timestamp en ms

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Inspection, (inspection) => inspection.inspectors)
  inspections: Inspection[];
}
```

**Índices Recomendados:**
- `email` (UNIQUE)
- `cedula` (UNIQUE)
- `role`

**Notas:**
- `passwordHash`: bcrypt con factor 10
- `resetToken`: Hash SHA-256 del token original
- `resetTokenExpires`: 20 minutos desde emisión
- Método `toSafeObject()` oculta campos sensibles

---

### 2. Inspection (Inspección Principal)

```typescript
@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_date', type: 'varchar', length: 10 })
  inspectionDate: string;  // YYYY-MM-DD

  @Column({ name: 'procedure_number', type: 'varchar', length: 100 })
  procedureNumber: string;  // NO es único (múltiples inspecciones)

  @ManyToMany(() => User, (user) => user.inspections, { eager: true })
  @JoinTable({ name: 'inspection_users' })
  inspectors: User[];

  @Column({ type: 'enum', enum: ApplicantType })
  applicantType: ApplicantType;  // Anonimo | Persona Física | Persona Jurídica

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.NEW })
  status: InspectionStatus;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;  // Cuando pasó a "Revisado"

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;  // Soft delete (papelera)

  // Relaciones OneToOne con subdependencias (todas con cascade: true)
  @OneToOne(() => IndividualRequest, { cascade: true, nullable: true })
  @JoinColumn()
  individualRequest?: IndividualRequest;

  @OneToOne(() => LegalEntityRequest, { cascade: true, nullable: true })
  @JoinColumn()
  legalEntityRequest?: LegalEntityRequest;

  @OneToOne(() => Construction, { cascade: true })
  @JoinColumn()
  construction: Construction;

  @OneToOne(() => Location, { cascade: true })
  @JoinColumn()
  location: Location;

  @OneToOne(() => LandUse, { cascade: true })
  @JoinColumn()
  landUse: LandUse;

  @OneToOne(() => Antiquity, { cascade: true })
  @JoinColumn()
  antiquity: Antiquity;

  @OneToOne(() => PcCancellation, { cascade: true })
  @JoinColumn()
  pcCancellation: PcCancellation;

  @OneToOne(() => GeneralInspection, { cascade: true })
  @JoinColumn()
  generalInspection: GeneralInspection;

  @OneToOne(() => WorkReceipt, { cascade: true })
  @JoinColumn()
  workReceipt: WorkReceipt;

  @OneToOne(() => TaxProcedure, { cascade: true })
  @JoinColumn()
  taxProcedure: TaxProcedure;

  @OneToOne(() => MayorOffice, { cascade: true })
  @JoinColumn()
  mayorOffice: MayorOffice;

  @OneToOne(() => Concession, { cascade: true, nullable: true })
  @JoinColumn()
  concession?: Concession;

  @OneToOne(() => Collection, { cascade: true, nullable: true })
  @JoinColumn()
  collection?: Collection;

  @OneToOne(() => RevenuePatent, { cascade: true, nullable: true })
  @JoinColumn()
  revenuePatent?: RevenuePatent;

  @OneToOne(() => WorkClosure, { cascade: true, nullable: true })
  @JoinColumn()
  workClosure?: WorkClosure;

  @OneToOne(() => PlatformAndService, { cascade: true, nullable: true })
  @JoinColumn()
  platformAndService?: PlatformAndService;
}
```

**Índices Recomendados:**
- `procedureNumber` (múltiples inspecciones con mismo número)
- `status`
- `createdAt`
- `reviewedAt`

**Ciclo de Vida de Estados:**

```
NEW → IN_PROGRESS → REVIEWED → ARCHIVED (auto después de 7 días)
  ↓         ↓           ↓
TRASHED (soft delete, recuperable)
```

---

### 3. IndividualRequest (Persona Física)

```typescript
@Entity('individual_requests')
export class IndividualRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  physicalId: string;  // Cédula física

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName1: string;

  @Column({ length: 100, nullable: true })
  lastName2?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;
}
```

---

### 4. LegalEntityRequest (Persona Jurídica)

```typescript
@Entity('legal_entity_requests')
export class LegalEntityRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  legalId: string;  // Cédula jurídica

  @Column({ length: 200 })
  legalName: string;  // Razón social

  @Column({ length: 200 })
  representative: string;  // Representante legal

  @Column({ length: 20 })
  repId: string;  // Cédula del representante

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;
}
```

---

### 5. Construction (Construcción)

```typescript
@Entity('constructions')
export class Construction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  landUseType: string;

  @Column({ default: false })
  matchesLocation: boolean;

  @Column({ default: false })
  recommended: boolean;

  @Column({ nullable: true })
  observations: string;

  @Column({ nullable: true })
  propertyNumber: string;

  @Column({ nullable: true })
  estimatedAge: string;

  @Column("simple-array", { nullable: true })
  photos: string[];  // URLs de Cloudinary
}
```

**Nota:** `simple-array` guarda array como CSV en columna TEXT

---

### 6. Collection (Cobranza/Notificaciones)

```typescript
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notifierSignatureUrl: string;  // URL de firma en Cloudinary

  // Checkboxes: 'X' cuando marcado, NULL cuando desmarcado
  @Column({ type: 'char', length: 1, nullable: true })
  nobodyPresent?: string;  // No había nadie

  @Column({ type: 'char', length: 1, nullable: true })
  wrongAddress?: string;  // Dirección incorrecta

  @Column({ type: 'char', length: 1, nullable: true })
  movedAddress?: string;  // Cambió de domicilio

  @Column({ type: 'char', length: 1, nullable: true })
  refusedToSign?: string;  // No quiso firmar

  @Column({ type: 'char', length: 1, nullable: true })
  notLocated?: string;  // No se localiza

  @Column({ type: 'varchar', length: 300, nullable: true })
  other?: string;  // Otro motivo
}
```

**Formato de Checkboxes:**
```javascript
// Frontend
const payload = {
  collection: {
    nobodyPresent: isChecked ? 'X' : null,
    wrongAddress: null,
    // ...
  }
};
```

---

### 7. WorkClosure (Cierre de Obra)

```typescript
@Entity('work_closures')
export class WorkClosure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  propertyNumber?: string;  // Número de finca

  @Column({ type: 'varchar', length: 50, nullable: true })
  cadastralNumber?: string;  // Número de catastro

  @Column({ type: 'varchar', length: 50, nullable: true })
  contractNumber?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  permitNumber?: string;

  @Column({ type: 'varchar', length: 24, nullable: true })
  assessedArea?: string;  // Área tasada (ej: "120 m²")

  @Column({ type: 'varchar', length: 24, nullable: true })
  builtArea?: string;  // Área construida

  @Column({ type: 'enum', enum: VisitNumber, nullable: true })
  visitNumber?: VisitNumber;  // 'visita_1' | 'visita_2' | 'visita_3'

  @Column({ type: 'boolean', default: false })
  workReceipt: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actions?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observations?: string;

  @Column({ type: 'simple-json', nullable: true })
  photos?: string[];  // Array de URLs de Cloudinary
}
```

**Tipo de Visita (Enum):**
```typescript
export enum VisitNumber {
  VISIT_1 = 'visita_1',
  VISIT_2 = 'visita_2',
  VISIT_3 = 'visita_3',
}
```

---

### 8. PlatformAndService (Plataforma y Servicios)

```typescript
@Entity('platforms_and_services')
export class PlatformAndService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  procedureNumber: string;  // Número de trámite (requerido)

  @Column({ type: 'text', nullable: true })
  observation?: string;  // Observación (opcional)
}
```

---

### 9. Concession (Concesión ZMT)

```typescript
@Entity('concessions')
export class Concession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  concessionType: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @OneToMany(() => ConcessionParcel, parcel => parcel.concession, { 
    cascade: true 
  })
  parcels: ConcessionParcel[];  // Relación OneToMany

  @OneToOne(() => Inspection, inspection => inspection.concession)
  inspection: Inspection;
}
```

---

### 10. ConcessionParcel (Parcelas de Concesión)

```typescript
@Entity('concession_parcels')
export class ConcessionParcel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  parcelNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area?: string;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  @ManyToOne(() => Concession, concession => concession.parcels)
  concession: Concession;
}
```

---

## Relaciones

### ManyToMany: User ↔ Inspection

```typescript
// User.entity.ts
@ManyToMany(() => Inspection, (inspection) => inspection.inspectors)
inspections: Inspection[];

// Inspection.entity.ts
@ManyToMany(() => User, (user) => user.inspections, { eager: true })
@JoinTable({
  name: 'inspection_users',
  joinColumn: { name: 'inspection_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
})
inspectors: User[];
```

**Tabla Intermedia Generada:**

```sql
CREATE TABLE inspection_users (
  inspection_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (inspection_id, user_id),
  FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### OneToOne con Cascade

```typescript
// Inspection.entity.ts
@OneToOne(() => Construction, { cascade: true })
@JoinColumn()
construction: Construction;
```

**Comportamiento:**
- Al guardar `Inspection`, guarda automáticamente `Construction`
- Al eliminar `Inspection`, elimina automáticamente `Construction`
- Simplifica service layer (una sola llamada a `save()`)

---

## Índices y Optimización

### Índices Existentes (Auto-generados)

```sql
-- Primary Keys
ALTER TABLE user ADD PRIMARY KEY (id);
ALTER TABLE inspections ADD PRIMARY KEY (id);
-- ... (todos)

-- Unique Constraints
ALTER TABLE user ADD UNIQUE KEY (email);
ALTER TABLE user ADD UNIQUE KEY (cedula);
```

### Índices Recomendados para Agregar

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_procedure_number ON inspections(procedure_number);
CREATE INDEX idx_inspection_status ON inspections(status);
CREATE INDEX idx_inspection_date ON inspections(inspection_date);
CREATE INDEX idx_created_at ON inspections(created_at);
CREATE INDEX idx_reviewed_at ON inspections(reviewed_at);

-- Filtros de usuario
CREATE INDEX idx_user_role ON user(role);
CREATE INDEX idx_user_blocked ON user(is_blocked);

-- Joins frecuentes
CREATE INDEX idx_inspection_users_inspection ON inspection_users(inspection_id);
CREATE INDEX idx_inspection_users_user ON inspection_users(user_id);
```

### Consultas Optimizadas

**Ejemplo: Contar inspecciones por estado**

```typescript
// ❌ Lento (carga todas las inspecciones)
const all = await repo.find();
const count = all.filter(i => i.status === 'Nuevo').length;

// ✅ Rápido (query directo a BD)
const count = await repo.count({ where: { status: InspectionStatus.NEW } });
```

---

## Migraciones

### Synchronize en Desarrollo

```typescript
// app.module.ts
synchronize: cs.get<boolean>('TYPEORM_SYNC', false), // true en .env dev
```

**⚠️ IMPORTANTE:** `synchronize: true` actualiza automáticamente el schema pero:
- ❌ NO usar en producción (puede perder datos)
- ❌ No genera migraciones reversibles
- ✅ Solo para desarrollo rápido

### Migraciones en Producción

**Generar migración:**

```bash
npm run typeorm migration:generate -- -n CreateInspections
```

**Ejecutar migraciones:**

```bash
npm run typeorm migration:run
```

**Revertir migración:**

```bash
npm run typeorm migration:revert
```

### Backup Recomendado

```bash
# Backup completo
mysqldump -u root -p inspect_muni > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u root -p inspect_muni < backup_20250110.sql
```

---

## Tipos de Datos Especiales

### simple-array

```typescript
@Column("simple-array", { nullable: true })
photos: string[];

// Se guarda como: "url1,url2,url3"
```

### simple-json

```typescript
@Column({ type: 'simple-json', nullable: true })
photos?: string[];

// Se guarda como: ["url1","url2","url3"]
```

**Diferencia:**
- `simple-array`: CSV (sin comillas)
- `simple-json`: JSON (con comillas, soporta tipos complejos)

### Transformer Personalizado (Fecha)

```typescript
@Column({ 
  name: 'inspection_date', 
  type: 'varchar', 
  length: 10,
  transformer: {
    to: (value: Date | string) => {
      if (typeof value === 'string') {
        return value.match(/^(\d{4})-(\d{2})-(\d{2})/)[0];
      }
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    },
    from: (value: string) => value
  }
})
inspectionDate: string;
```

**Propósito:** Evitar problemas de zona horaria guardando como string YYYY-MM-DD

---

## Estadísticas de Base de Datos

### Tamaño Aproximado por Inspección

```
1 Inspección completa ≈ 15-20 KB
  - Inspection: 500 bytes
  - IndividualRequest/LegalEntity: 300 bytes
  - Construction + subdependencias: 2-3 KB
  - Location: 500 bytes
  - Relaciones (inspection_users): 50 bytes
  - Photos (URLs): 500 bytes - 2 KB
  - Otros: 1-2 KB

100 inspecciones ≈ 1.5-2 MB
1,000 inspecciones ≈ 15-20 MB
10,000 inspecciones ≈ 150-200 MB
```

### Proyección de Crecimiento

Asumiendo 50 inspecciones/mes:
- Año 1: 600 inspecciones ≈ 10-12 MB
- Año 5: 3,000 inspecciones ≈ 50-60 MB

**Conclusión:** Base de datos pequeña, no requiere particionamiento.

---

**Próximo Documento:** [04-API-ENDPOINTS.md](./04-API-ENDPOINTS.md)
