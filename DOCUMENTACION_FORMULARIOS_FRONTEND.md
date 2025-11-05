# 📋 Documentación de Formularios para Frontend

## Índice
1. [Cobros (Collections)](#1-cobros-collections)
2. [Clausuras de Obra (Work Closures)](#2-clausuras-de-obra-work-closures)
3. [Plataforma de Servicios (Platform and Services)](#3-plataforma-de-servicios-platform-and-services)
4. [Integración con Cloudinary](#4-integración-con-cloudinary)
5. [Endpoint de Creación de Inspecciones](#5-endpoint-de-creación-de-inspecciones)

---

## 1. Cobros (Collections)

### 📌 Descripción
Formulario para registrar notificaciones de cobro con firma del notificador y checkboxes para diferentes situaciones.

### 🔧 Campos del Formulario

| Campo | Nombre Frontend | Tipo | Requerido | Validación | Descripción |
|-------|----------------|------|-----------|------------|-------------|
| `notifierSignatureUrl` | Firma del Notificador | String (URL) | No | Max 500 chars | URL de Cloudinary con la firma |
| `nobodyPresent` | No había nadie | Checkbox → 'X' | No | Solo 'X' o null | Marcar si no había nadie |
| `wrongAddress` | Dirección incorrecta | Checkbox → 'X' | No | Solo 'X' o null | Marcar si la dirección está mal |
| `movedAddress` | Cambio de domicilio | Checkbox → 'X' | No | Solo 'X' o null | Marcar si cambió domicilio |
| `refusedToSign` | No quiso firmar | Checkbox → 'X' | No | Solo 'X' o null | Marcar si se negó a firmar |
| `notLocated` | No se localiza | Checkbox → 'X' | No | Solo 'X' o null | Marcar si no se encuentra |
| `other` | Otro (especificar) | String | No | Max 300 chars | Texto libre para otros motivos |

### 📤 Estructura JSON para enviar

```json
{
  "collection": {
    "notifierSignatureUrl": "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/signatures/firma123.jpg",
    "nobodyPresent": "X",
    "wrongAddress": null,
    "movedAddress": null,
    "refusedToSign": null,
    "notLocated": null,
    "other": "Casa cerrada con candado"
  }
}
```

### 🎨 Componentes Frontend Sugeridos

```jsx
// EJEMPLO REACT
const CollectionForm = () => {
  const [formData, setFormData] = useState({
    notifierSignatureUrl: '',
    nobodyPresent: false,
    wrongAddress: false,
    movedAddress: false,
    refusedToSign: false,
    notLocated: false,
    other: ''
  });

  const [signatureFile, setSignatureFile] = useState(null);

  // Subir firma a Cloudinary
  const uploadSignature = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://tu-backend.railway.app/cloudinary/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data.secure_url; // URL de Cloudinary
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadSignature(file);
      setFormData({ ...formData, notifierSignatureUrl: url });
    }
  };

  const handleCheckbox = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field]
    });
  };

  const preparePayload = () => {
    return {
      notifierSignatureUrl: formData.notifierSignatureUrl,
      nobodyPresent: formData.nobodyPresent ? 'X' : null,
      wrongAddress: formData.wrongAddress ? 'X' : null,
      movedAddress: formData.movedAddress ? 'X' : null,
      refusedToSign: formData.refusedToSign ? 'X' : null,
      notLocated: formData.notLocated ? 'X' : null,
      other: formData.other || null
    };
  };

  return (
    <div className="collection-form">
      <h3>Cobros - Notificación</h3>
      
      {/* Firma del Notificador */}
      <div className="form-group">
        <label>Firma del Notificador</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleSignatureUpload}
        />
        {formData.notifierSignatureUrl && (
          <img src={formData.notifierSignatureUrl} alt="Firma" width="200" />
        )}
      </div>

      {/* Checkboxes */}
      <div className="checkboxes-group">
        <label>
          <input 
            type="checkbox" 
            checked={formData.nobodyPresent}
            onChange={() => handleCheckbox('nobodyPresent')}
          />
          No había nadie
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={formData.wrongAddress}
            onChange={() => handleCheckbox('wrongAddress')}
          />
          Dirección incorrecta
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={formData.movedAddress}
            onChange={() => handleCheckbox('movedAddress')}
          />
          Cambio de domicilio
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={formData.refusedToSign}
            onChange={() => handleCheckbox('refusedToSign')}
          />
          No quiso firmar
        </label>

        <label>
          <input 
            type="checkbox" 
            checked={formData.notLocated}
            onChange={() => handleCheckbox('notLocated')}
          />
          No se localiza
        </label>
      </div>

      {/* Otro */}
      <div className="form-group">
        <label>Otro (especificar)</label>
        <input 
          type="text"
          maxLength={300}
          value={formData.other}
          onChange={(e) => setFormData({ ...formData, other: e.target.value })}
        />
      </div>
    </div>
  );
};
```

---

## 2. Clausuras de Obra (Work Closures)

### 📌 Descripción
Formulario para registrar clausuras de obras con información catastral, visitas y fotos.

### 🔧 Campos del Formulario

| Campo | Nombre Frontend | Tipo | Requerido | Validación | Descripción |
|-------|----------------|------|-----------|------------|-------------|
| `propertyNumber` | Número de Finca | String | No | Max 50 chars | Número registral de la propiedad |
| `cadastralNumber` | Número Catastral | String | No | Max 50 chars | Número del catastro nacional |
| `contractNumber` | No. de Contrato | String | No | Max 50 chars | Número de contrato asociado |
| `permitNumber` | Número de Permiso | String | No | Max 50 chars | Número del permiso de construcción |
| `assessedArea` | Área Tasada | String | No | Max 24 chars | Área tasada (ej: "120 m²") |
| `builtArea` | Área Construida | String | No | Max 24 chars | Área construida (ej: "85 m²") |
| `visitNumber` | Número de Visita | Enum | No | visita_1, visita_2, visita_3 | Primera, segunda o tercera visita |
| `workReceipt` | Recibo de Obra | Boolean | **Sí** | true/false | Si tiene recibo de obra |
| `actions` | Acciones | String | No | Max 500 chars | Acciones tomadas en la visita |
| `observations` | Observaciones | String | No | Max 500 chars | Observaciones adicionales |
| `photos` | Fotos | Array[String] | No | URLs de Cloudinary | Array de URLs de fotos |

### 📝 Valores Válidos para Número de Visita

**IMPORTANTE**: No uses `VisitNumber`, usa los strings directamente:

```javascript
// ✅ CORRECTO - Usar strings directamente
visitNumber: 'visita_1'   // Primera visita
visitNumber: 'visita_2'   // Segunda visita  
visitNumber: 'visita_3'   // Tercera visita

// ❌ INCORRECTO - No usar objetos
visitNumber: VisitNumber.VISIT_1  // Esto causará error
```

### 📤 Estructura JSON para enviar

```json
{
  "workClosure": {
    "propertyNumber": "12345-000",
    "cadastralNumber": "5-987654",
    "contractNumber": "CONT-2025-001",
    "permitNumber": "PERM-123",
    "assessedArea": "150 m²",
    "builtArea": "120 m²",
    "visitNumber": "visita_1",
    "workReceipt": true,
    "actions": "Se procedió a clausurar el inmueble por construcción sin permiso",
    "observations": "El propietario no se encontraba presente",
    "photos": [
      "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/inspections/foto1.jpg",
      "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/inspections/foto2.jpg",
      "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/inspections/foto3.jpg"
    ]
  }
}
```

### 🎨 Componentes Frontend Sugeridos

```jsx
// EJEMPLO REACT
const WorkClosureForm = () => {
  const [formData, setFormData] = useState({
    propertyNumber: '',
    cadastralNumber: '',
    contractNumber: '',
    permitNumber: '',
    assessedArea: '',
    builtArea: '',
    visitNumber: '',
    workReceipt: false,
    actions: '',
    observations: '',
    photos: []
  });

  const [photoFiles, setPhotoFiles] = useState([]);

  // Subir múltiples fotos a Cloudinary
  const uploadPhotos = async (files) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://tu-backend.railway.app/cloudinary/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.secure_url;
    });

    return await Promise.all(uploadPromises);
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const urls = await uploadPhotos(files);
      setFormData({
        ...formData,
        photos: [...formData.photos, ...urls]
      });
    }
  };

  const removePhoto = (index) => {
    const newUrls = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newUrls });
  };

  return (
    <div className="work-closure-form">
      <h3>Clausuras de Obra</h3>

      {/* Información Catastral */}
      <div className="section">
        <h4>Información de la Propiedad</h4>
        
        <input
          type="text"
          placeholder="Número de Finca"
          maxLength={50}
          value={formData.propertyNumber}
          onChange={(e) => setFormData({ ...formData, propertyNumber: e.target.value })}
        />

        <input
          type="text"
          placeholder="Número Catastral"
          maxLength={50}
          value={formData.cadastralNumber}
          onChange={(e) => setFormData({ ...formData, cadastralNumber: e.target.value })}
        />

        <input
          type="text"
          placeholder="No. de Contrato"
          maxLength={50}
          value={formData.contractNumber}
          onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
        />

        <input
          type="text"
          placeholder="Número de Permiso"
          maxLength={50}
          value={formData.permitNumber}
          onChange={(e) => setFormData({ ...formData, permitNumber: e.target.value })}
        />
      </div>

      {/* Áreas */}
      <div className="section">
        <h4>Áreas</h4>
        
        <input
          type="text"
          placeholder="Área Tasada (ej: 150 m²)"
          maxLength={24}
          value={formData.assessedArea}
          onChange={(e) => setFormData({ ...formData, assessedArea: e.target.value })}
        />

        <input
          type="text"
          placeholder="Área Construida (ej: 120 m²)"
          maxLength={24}
          value={formData.builtArea}
          onChange={(e) => setFormData({ ...formData, builtArea: e.target.value })}
        />
      </div>

      {/* Número de Visita */}
      <div className="form-group">
        <label>Número de Visita</label>
        <select
          value={formData.visitNumber}
          onChange={(e) => setFormData({ ...formData, visitNumber: e.target.value })}
        >
          <option value="">Seleccionar...</option>
          <option value="visita_1">Primera Visita</option>
          <option value="visita_2">Segunda Visita</option>
          <option value="visita_3">Tercera Visita</option>
        </select>
      </div>

      {/* Recibo de Obra */}
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.workReceipt}
            onChange={(e) => setFormData({ ...formData, workReceipt: e.target.checked })}
          />
          Recibo de Obra
        </label>
      </div>

      {/* Acciones */}
      <div className="form-group">
        <label>Acciones</label>
        <textarea
          maxLength={500}
          rows={4}
          value={formData.actions}
          onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
          placeholder="Acciones tomadas durante la visita..."
        />
      </div>

      {/* Observaciones */}
      <div className="form-group">
        <label>Observaciones</label>
        <textarea
          maxLength={500}
          rows={4}
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Fotos */}
      <div className="form-group">
        <label>Fotos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
        />
        
        <div className="photo-preview">
          {formData.photos.map((url, index) => (
            <div key={index} className="photo-item">
              <img src={url} alt={`Foto ${index + 1}`} width="150" />
              <button onClick={() => removePhoto(index)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 3. Plataforma de Servicios (Platform and Services)

### 📌 Descripción
Formulario simple para registrar información sobre plataforma de servicios.

### 🔧 Campos del Formulario

| Campo | Nombre Frontend | Tipo | Requerido | Validación | Descripción |
|-------|----------------|------|-----------|------------|-------------|
| `procedureNumber` | Número de Trámite | String | **Sí** | Max 100 chars | Número único del trámite |
| `observation` | Observación | String | No | Sin límite | Observaciones del trámite |

### 📤 Estructura JSON para enviar

⚠️ **IMPORTANTE**: El campo se llama `platformAndService` (NO `servicePlatform`)

```json
{
  "platformAndService": {
    "procedureNumber": "PS-2025-001",
    "observation": "Plataforma instalada correctamente, cumple con todas las normativas vigentes."
  }
}
```

### 🎨 Componentes Frontend Sugeridos

```jsx
// EJEMPLO REACT
const PlatformServiceForm = () => {
  const [formData, setFormData] = useState({
    procedureNumber: '',
    observation: ''
  });

  return (
    <div className="platform-service-form">
      <h3>Plataforma de Servicios</h3>

      {/* Número de Trámite */}
      <div className="form-group">
        <label>Número de Trámite *</label>
        <input
          type="text"
          required
          maxLength={100}
          value={formData.procedureNumber}
          onChange={(e) => setFormData({ ...formData, procedureNumber: e.target.value })}
          placeholder="PS-2025-001"
        />
      </div>

      {/* Observación */}
      <div className="form-group">
        <label>Observación</label>
        <textarea
          rows={6}
          value={formData.observation}
          onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
          placeholder="Ingrese las observaciones del trámite..."
        />
      </div>
    </div>
  );
};
```

---

## 4. Integración con Cloudinary

### 🔧 Endpoint de Subida de Imágenes

**URL**: `POST /cloudinary/upload`

**Headers**:
```
Authorization: Bearer <tu_jwt_token>
Content-Type: multipart/form-data
```

**Body** (FormData):
```
file: <archivo_de_imagen>
```

**Respuesta Exitosa**:
```json
{
  "public_id": "inspections/abc123",
  "secure_url": "https://res.cloudinary.com/da84etlav/image/upload/v1234567890/inspections/abc123.jpg",
  "url": "http://res.cloudinary.com/da84etlav/image/upload/v1234567890/inspections/abc123.jpg",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "bytes": 245678
}
```

### 📸 Función Helper para Subir Imágenes

```javascript
// utils/cloudinary.js

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @param {string} token - JWT token
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadImageToCloudinary = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://inspecciones-muni-santa-cruz-production.up.railway.app/cloudinary/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen');
    }

    const data = await response.json();
    return data.secure_url; // Retorna URL segura
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Sube múltiples imágenes a Cloudinary
 * @param {FileList|File[]} files - Lista de archivos
 * @param {string} token - JWT token
 * @returns {Promise<string[]>} - Array de URLs
 */
export const uploadMultipleImages = async (files, token) => {
  const uploadPromises = Array.from(files).map(file => 
    uploadImageToCloudinary(file, token)
  );

  return await Promise.all(uploadPromises);
};

/**
 * Validar que el archivo sea una imagen válida
 * @param {File} file - Archivo a validar
 * @returns {boolean}
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    alert('Formato de imagen no válido. Use JPG, PNG o GIF.');
    return false;
  }

  if (file.size > maxSize) {
    alert('La imagen es muy grande. Máximo 5MB.');
    return false;
  }

  return true;
};
```

### 🎯 Ejemplo de Uso Completo

```jsx
import { uploadImageToCloudinary, uploadMultipleImages, isValidImage } from './utils/cloudinary';

const MyForm = () => {
  const token = localStorage.getItem('token'); // O useAuth()

  // SUBIR UNA SOLA IMAGEN
  const handleSingleUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file || !isValidImage(file)) return;

    try {
      const url = await uploadImageToCloudinary(file, token);
      console.log('Imagen subida:', url);
      // Actualizar estado con la URL
    } catch (error) {
      alert('Error al subir la imagen');
    }
  };

  // SUBIR MÚLTIPLES IMÁGENES
  const handleMultipleUpload = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;

    // Validar cada archivo
    const validFiles = Array.from(files).filter(isValidImage);
    
    if (validFiles.length === 0) return;

    try {
      const urls = await uploadMultipleImages(validFiles, token);
      console.log('Imágenes subidas:', urls);
      // Actualizar estado con las URLs
    } catch (error) {
      alert('Error al subir las imágenes');
    }
  };

  return (
    <div>
      {/* Una imagen */}
      <input type="file" accept="image/*" onChange={handleSingleUpload} />
      
      {/* Múltiples imágenes */}
      <input type="file" accept="image/*" multiple onChange={handleMultipleUpload} />
    </div>
  );
};
```

---

## 5. Endpoint de Creación de Inspecciones

### 🔧 URL Completa

**Método**: `POST`
**URL**: `https://inspecciones-muni-santa-cruz-production.up.railway.app/inspections`

**Headers**:
```
Authorization: Bearer <tu_jwt_token>
Content-Type: application/json
```

### 📤 Payload Completo (Ejemplo con los 3 formularios)

```json
{
  "inspectionDate": "2025-11-04",
  "procedureNumber": "INSP-2025-001",
  "inspectorIds": [1, 2],
  "applicantType": "individual",
  
  "individualRequest": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "idNumber": "1-1234-5678",
    "phone": "88887777",
    "email": "juan@example.com"
  },
  
  "location": {
    "province": "San José",
    "canton": "Santa Cruz",
    "district": "Centro",
    "exactAddress": "100m norte de la iglesia"
  },
  
  "collection": {
    "notifierSignatureUrl": "https://res.cloudinary.com/.../firma.jpg",
    "nobodyPresent": "X",
    "wrongAddress": null,
    "movedAddress": null,
    "refusedToSign": null,
    "notLocated": null,
    "other": "Casa cerrada"
  },
  
  "workClosure": {
    "propertyNumber": "12345-000",
    "cadastralNumber": "5-987654",
    "contractNumber": "CONT-2025-001",
    "permitNumber": "PERM-123",
    "assessedArea": "150 m²",
    "builtArea": "120 m²",
    "visitNumber": "visita_1",
    "workReceipt": true,
    "actions": "Se clausuró el inmueble",
    "observations": "Propietario ausente",
    "photos": [
      "https://res.cloudinary.com/.../foto1.jpg",
      "https://res.cloudinary.com/.../foto2.jpg"
    ]
  },
  
  "platformAndService": {
    "procedureNumber": "PS-2025-001",
    "observation": "Plataforma instalada correctamente"
  }
}
```

### ✅ Validaciones Importantes

1. **Fecha de Inspección**: Formato `YYYY-MM-DD`
2. **Número de Procedimiento**: Único, max 100 caracteres
3. **Inspectores**: Array de IDs de usuarios existentes
4. **Tipo de Solicitante**: `'individual'` o `'legal_entity'`
5. **Checkboxes de Cobros**: Enviar `'X'` cuando marcado, `null` cuando no
6. **Número de Visita**: Usar valores del enum: `'visita_1'`, `'visita_2'`, `'visita_3'`
7. **URLs de Imágenes**: Deben ser URLs completas de Cloudinary
8. **Recibo de Obra**: Boolean `true` o `false`

---

## 📋 Checklist para el Frontend

### Antes de Enviar el Formulario:

- [ ] Todas las imágenes están subidas a Cloudinary
- [ ] Las URLs de Cloudinary están en los campos correctos
- [ ] Los checkboxes envían `'X'` o `null` (no `true/false`)
- [ ] El enum de visita usa valores correctos (`visita_1`, `visita_2`, `visita_3`)
- [ ] El campo `workReceipt` es boolean
- [ ] El token JWT está en el header `Authorization`
- [ ] El `Content-Type` es `application/json`
- [ ] Los arrays de fotos contienen strings (URLs)
- [ ] Los campos opcionales se envían como `null` o se omiten

### Después de Enviar:

- [ ] Verificar respuesta del servidor (200 = éxito)
- [ ] Mostrar mensaje de éxito/error al usuario
- [ ] Limpiar el formulario si fue exitoso
- [ ] Manejar errores de red y validación

---

## 🚨 Errores Comunes y Soluciones

### Error: "Unauthorized"
**Causa**: Token JWT no válido o expirado
**Solución**: Verificar que el token esté en el header y sea válido

### Error: "Bad Request"
**Causa**: Datos no válidos según las validaciones
**Solución**: Revisar que todos los campos cumplan las validaciones

### Error: "Connection timeout" al subir imágenes
**Causa**: Imagen muy grande o conexión lenta
**Solución**: Comprimir imágenes antes de subir (max 5MB)

### Error: Checkboxes no se guardan
**Causa**: Enviando `true/false` en vez de `'X'/null`
**Solución**: Convertir boolean a `'X'` o `null` antes de enviar

### Error: "Visit number not valid"
**Causa**: Valor del enum incorrecto
**Solución**: Usar exactamente `'visita_1'`, `'visita_2'` o `'visita_3'` (strings, no objetos)

### Error: "VisitNumber is not defined"
**Causa**: Intentando usar `VisitNumber` como objeto/enum en JavaScript
**Solución**: Usar los valores de string directamente: `'visita_1'`, `'visita_2'`, `'visita_3'`

### Error: platformAndService viene null
**Causa**: Enviando `servicePlatform` en vez de `platformAndService`
**Solución**: El campo correcto es `platformAndService` (NO `servicePlatform`)

### Error: "unknown section: photos"
**Causa**: El frontend envía `section: 'photos'` o intenta subir organizadamente
**Solución**: El endpoint `/cloudinary/upload` solo acepta el campo `file` (un archivo a la vez)

❌ **Incorrecto**:
```javascript
const formData = new FormData();
formData.append('section', 'photos'); // ❌ NO existe este parámetro
formData.append('file', file);
```

✅ **Correcto**:
```javascript
const formData = new FormData();
formData.append('file', file); // ✅ Solo 'file'
// NO agregar 'section', 'organized', 'photos', etc.
```

### Error: Las fotos de workClosure vienen null
**Causa 1**: El frontend envía `photoUrls` pero el backend espera `photos`
**Solución**: Cambiar `photoUrls` por `photos` en el payload de workClosure

**Causa 2**: Las fotos se suben a Cloudinary pero las URLs NO se incluyen en el payload
**Solución**: Después de subir a Cloudinary, guardar las URLs en el estado y enviarlas

**Causa 3**: Las fotos NO se suben correctamente a Cloudinary (error "unknown section")
**Solución**: Eliminar cualquier parámetro extra, solo enviar `file`

**Cómo verificar**:
```javascript
// Antes de enviar, verifica el payload
console.log('📤 Payload:', JSON.stringify(payload, null, 2));

// Deberías ver:
{
  "workClosure": {
    "photos": [
      "https://res.cloudinary.com/da84etlav/image/upload/v1730819649/foto1.jpg",
      "https://res.cloudinary.com/da84etlav/image/upload/v1730819650/foto2.jpg"
    ]
  }
}

// ❌ Si ves esto, el problema está en el frontend:
{
  "workClosure": {
    "photos": null  // o photos: []
  }
}
```

---

## 📞 Contacto y Soporte

Si encuentras algún problema:
1. Verifica los logs del navegador (Console)
2. Revisa la respuesta del servidor (Network)
3. Confirma que las URLs de Cloudinary sean accesibles
4. Verifica que el token JWT sea válido

---

## 🔧 Correcciones Importantes del Frontend

### 1. Cambiar `servicePlatform` por `platformAndService`

❌ **INCORRECTO** (lo que está enviando tu frontend):
```json
{
  "dependency": "ServicePlatform",
  "servicePlatform": {
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }
}
```

✅ **CORRECTO**:
```json
{
  "dependency": "ServicePlatform",
  "platformAndService": {
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }
}
```

### 2. No usar `VisitNumber` como objeto

❌ **INCORRECTO**:
```javascript
const WorkClosureForm = () => {
  // Error: VisitNumber is not defined
  visitNumber: VisitNumber.VISIT_1
}
```

✅ **CORRECTO**:
```javascript
const WorkClosureForm = () => {
  const [formData, setFormData] = useState({
    visitNumber: '', // Inicializar vacío
    // ...
  });

  // En el select, usar strings directamente
  <select value={formData.visitNumber} onChange={...}>
    <option value="">Seleccionar...</option>
    <option value="visita_1">Primera Visita</option>
    <option value="visita_2">Segunda Visita</option>
    <option value="visita_3">Tercera Visita</option>
  </select>
}
```

### 3. Cambiar `photoUrls` por `photos` en Work Closure

❌ **INCORRECTO**:
```json
{
  "workClosure": {
    "propertyNumber": "11561651",
    "photoUrls": [
      "https://res.cloudinary.com/.../foto1.jpg"
    ]
  }
}
```

✅ **CORRECTO**:
```json
{
  "workClosure": {
    "propertyNumber": "11561651",
    "photos": [
      "https://res.cloudinary.com/.../foto1.jpg"
    ]
  }
}
```

### 5. Ejemplo Completo Correcto para Plataforma de Servicios

```javascript
// En tu componente donde preparas el payload
const prepareInspectionPayload = () => {
  return {
    inspectionDate: formData.inspectionDate,
    procedureNumber: formData.procedureNumber,
    inspectorIds: formData.inspectorIds,
    applicantType: formData.applicantType,
    location: {
      district: formData.district,
      exactAddress: formData.exactAddress
    },
    // ✅ NOMBRE CORRECTO: platformAndService
    platformAndService: {
      procedureNumber: formData.platformProcedureNumber,
      observation: formData.platformObservation
    }
  };
};
```

### 6. Flujo Correcto para Subir Fotos desde la Galería

**IMPORTANTE**: El endpoint `/cloudinary/upload` espera UN archivo a la vez en el campo `file`.

❌ **INCORRECTO** (lo que está haciendo tu frontend):
```javascript
// NO enviar con "section" u "organized by section"
const formData = new FormData();
formData.append('section', 'photos'); // ❌ Esto causa "unknown section: photos"
formData.append('files', files); // ❌ No enviar múltiples archivos juntos
```

✅ **CORRECTO** (lo que DEBE hacer):
```javascript
// Paso 1: Usuario selecciona fotos
const handlePhotoSelection = async (e) => {
  const files = e.target.files; // Archivos de la galería
  if (!files || files.length === 0) return;

  console.log('📸 Usuario seleccionó', files.length, 'fotos');

  try {
    // Paso 2: Subir CADA foto INDIVIDUALMENTE a Cloudinary
    const uploadedUrls = [];
    
    for (const file of files) {
      // ✅ Crear FormData para CADA archivo
      const formData = new FormData();
      formData.append('file', file); // ✅ Solo el campo 'file', sin 'section'

      console.log('📤 Subiendo foto:', file.name);

      const response = await fetch('https://inspecciones-muni-santa-cruz-production.up.railway.app/cloudinary/upload', {
        method: 'POST',
        body: formData,
        // ⚠️ NO incluir Content-Type, el navegador lo hace automáticamente
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.secure_url) {
        throw new Error('Cloudinary no devolvió URL');
      }

      uploadedUrls.push(data.secure_url); // ✅ GUARDAR URL
      
      console.log('✅ Foto subida:', data.secure_url);
    }

    // Paso 3: GUARDAR las URLs en el estado
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...uploadedUrls] // ✅ AGREGAR URLs
    }));

    console.log('✅ Total de fotos:', [...formData.photos, ...uploadedUrls]);

  } catch (error) {
    console.error('❌ Error subiendo fotos:', error);
    alert('Error al subir las fotos: ' + error.message);
  }
};

// Paso 4: Al enviar, incluir las URLs
const submitInspection = async () => {
  const payload = {
    // ... otros campos ...
    workClosure: {
      propertyNumber: formData.propertyNumber,
      // ... otros campos ...
      photos: formData.photos // ✅ URLs de Cloudinary
    }
  };

  console.log('📤 Payload a enviar:', JSON.stringify(payload, null, 2));

  // Paso 5: Enviar al backend
  const response = await fetch('https://inspecciones-muni-santa-cruz-production.up.railway.app/inspections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('✅ Respuesta del backend:', result);

  // Paso 6: Verificar que las fotos se guardaron
  if (result.workClosure && result.workClosure.photos) {
    console.log('✅ Fotos guardadas:', result.workClosure.photos);
  } else {
    console.error('❌ Las fotos NO se guardaron');
  }
};
```

### 7. Verificar en Backend

Si envías correctamente `platformAndService`, deberías ver:

```json
{
  "id": 81,
  "platformAndService": {
    "id": 123,
    "procedureNumber": "166516",
    "observation": "bvhjvhjv"
  }
}
```

En lugar de:
```json
{
  "platformAndService": null  // ❌ Esto indica que el campo está mal nombrado
}
```

---

## 📊 Diagrama de Flujo: Subida de Fotos desde Galería

```
Usuario selecciona fotos de la galería 📱
         ↓
Frontend recibe archivos (File objects)
         ↓
Para cada archivo:
  ├─→ Crear FormData
  ├─→ Agregar archivo: formData.append('file', file)
  ├─→ POST a /cloudinary/upload con token JWT
  ├─→ Cloudinary procesa la imagen ☁️
  ├─→ Cloudinary devuelve: { secure_url: "https://..." }
  └─→ Guardar URL en array: urls.push(data.secure_url)
         ↓
Actualizar estado del componente
  └─→ setFormData({ ...formData, photos: urls })
         ↓
Usuario completa el formulario y envía
         ↓
Preparar payload con las URLs:
  {
    workClosure: {
      photos: ["https://...", "https://..."] ← URLs, NO archivos
    }
  }
         ↓
POST a /inspections con JSON
         ↓
Backend guarda las URLs en la BD 💾
         ↓
Backend devuelve la inspección con fotos:
  {
    workClosure: {
      photos: ["https://...", "https://..."]
    }
  }
         ↓
✅ ¡Listo! Las fotos están guardadas
```

## 🐛 Depuración Paso a Paso

### Checkpoint 1: ¿Las fotos se suben a Cloudinary?

```javascript
const handlePhotoUpload = async (e) => {
  const files = e.target.files;
  console.log('1️⃣ Archivos seleccionados:', files.length);
  
  for (const file of files) {
    console.log('📤 Subiendo:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('URL/cloudinary/upload', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    console.log('2️⃣ Cloudinary respondió:', data.secure_url);
  }
};
```

**¿Ves las URLs en consola?**
- ✅ SÍ → Checkpoint 2
- ❌ NO → Token inválido o error en Cloudinary

### Checkpoint 2: ¿Las URLs se guardan en el estado?

```javascript
const [formData, setFormData] = useState({
  photos: [] // ← Inicializar vacío
});

setFormData(prev => {
  const newPhotos = [...prev.photos, ...urls];
  console.log('3️⃣ Fotos en estado:', newPhotos);
  return { ...prev, photos: newPhotos };
});
```

**¿Ves el array de URLs?**
- ✅ SÍ → Checkpoint 3
- ❌ NO → Estado no se actualiza

### Checkpoint 3: ¿Las URLs se envían al backend?

```javascript
const payload = {
  workClosure: {
    photos: formData.photos // ← CRÍTICO
  }
};

console.log('4️⃣ Payload:', JSON.stringify(payload, null, 2));
```

**¿El payload tiene las URLs?**
- ✅ SÍ → Checkpoint 4
- ❌ NO → No se incluyen en el payload

### Checkpoint 4: ¿El backend las guarda?

```javascript
const result = await response.json();
console.log('5️⃣ Respuesta:', result.workClosure?.photos);
```

**¿La respuesta tiene las URLs?**
- ✅ SÍ → ¡Funciona!
- ❌ NO → Problema en backend

---

**Última actualización**: 5 de noviembre, 2025
**Versión del Backend**: 1.0.0
**Cloudinary Cloud**: da84etlav
