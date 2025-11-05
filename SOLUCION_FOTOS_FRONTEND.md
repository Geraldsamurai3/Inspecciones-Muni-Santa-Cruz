# SOLUCIÓN: Fotos no se guardan en la base de datos

## El Problema

Las fotos se están subiendo correctamente a Cloudinary (puedes ver el `secure_url` en DevTools), pero el campo `photos` en la base de datos aparece como `null`. Esto sucede porque después de subir las fotos a Cloudinary, **no estás guardando las URLs que devuelve** ni las estás incluyendo en el payload final que envías al backend.

## La Causa

1. Subes las fotos a Cloudinary ✅
2. Cloudinary te devuelve `{ secure_url: "https://..." }` ✅
3. **NO guardas esas URLs en ningún lado** ❌
4. Cuando haces POST a `/inspections`, envías `photos: null` o ni siquiera incluyes el campo ❌

## La Solución (Paso a Paso)

### PASO 1: Guarda las URLs después de subirlas a Cloudinary

```javascript
// En tu componente, crea un estado para las URLs
const [workClosurePhotos, setWorkClosurePhotos] = useState([]);

// Cuando subes las fotos a Cloudinary
const handlePhotoUpload = async (files) => {
  const uploadedUrls = []; // Array temporal para las URLs
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file); // SOLO el campo 'file'
    
    try {
      const response = await fetch('http://localhost:3000/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Tu token JWT
        },
        body: formData
      });
      
      const data = await response.json();
      console.log('✅ Foto subida:', data.secure_url); // IMPORTANTE: Ver esto en consola
      
      // CRÍTICO: Guardar la URL
      uploadedUrls.push(data.secure_url);
      
    } catch (error) {
      console.error('❌ Error subiendo foto:', error);
    }
  }
  
  // CRÍTICO: Actualizar el estado con todas las URLs
  setWorkClosurePhotos(prev => [...prev, ...uploadedUrls]);
  console.log('📸 Total de fotos:', uploadedUrls); // VERIFICAR aquí
};
```

### PASO 2: Incluye las URLs en el payload final

```javascript
// Cuando haces el POST a /inspections
const createInspection = async () => {
  const payload = {
    procedureNumber: "12345",
    inspectorName: "Juan Pérez",
    // ... otros campos ...
    
    // CRÍTICO: Incluir las fotos aquí
    workClosure: {
      propertyNumber: "ABC123",
      cadastralNumber: "XYZ789",
      visitNumber: "visita_1",
      photos: workClosurePhotos, // ← AQUÍ van las URLs guardadas
      // ... otros campos de clausura ...
    }
  };
  
  // VERIFICACIÓN: Antes de enviar, revisa el payload
  console.log('📦 Payload completo:', JSON.stringify(payload, null, 2));
  console.log('📸 Fotos en payload:', payload.workClosure.photos);
  
  // Si ves un array vacío [] o null aquí, NO LO ENVÍES aún
  if (!payload.workClosure.photos || payload.workClosure.photos.length === 0) {
    console.error('❌ ERROR: No hay fotos en el payload');
    alert('Debes subir al menos una foto antes de guardar');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/inspections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('✅ Inspección creada:', result);
    
  } catch (error) {
    console.error('❌ Error creando inspección:', error);
  }
};
```

### PASO 3: Verifica con console.log

Agrega estos console.log en puntos clave:

```javascript
// 1. Después de subir CADA foto
console.log('✅ URL recibida de Cloudinary:', data.secure_url);

// 2. Después de subir TODAS las fotos
console.log('📸 Todas las URLs:', workClosurePhotos);

// 3. ANTES de hacer el POST
console.log('📦 Payload final:', payload);
console.log('📸 Campo photos:', payload.workClosure.photos);
```

## Qué debes ver en la consola

```
✅ URL recibida de Cloudinary: https://res.cloudinary.com/da84etlav/image/upload/v1762361368/tkwcvsjgmrfgqyubkj5n.png
✅ URL recibida de Cloudinary: https://res.cloudinary.com/da84etlav/image/upload/v1762361370/abc123xyz789.png
📸 Todas las URLs: ["https://...", "https://..."]
📦 Payload final: { procedureNumber: "12345", workClosure: { photos: ["https://...", "https://..."] } }
📸 Campo photos: ["https://...", "https://..."]
```

## Errores Comunes a Evitar

### ❌ NO hagas esto:

```javascript
// MALO: No guardas las URLs
for (const file of files) {
  await uploadToCloudinary(file);
  // ¿Y la URL? Se pierde...
}

// MALO: Envías sin fotos
const payload = {
  workClosure: {
    photos: null // ❌ O peor, ni incluyes el campo
  }
};
```

### ✅ SÍ haz esto:

```javascript
// BUENO: Guardas cada URL
const urls = [];
for (const file of files) {
  const result = await uploadToCloudinary(file);
  urls.push(result.secure_url); // ✅ Guardas la URL
}
setWorkClosurePhotos(urls); // ✅ Actualizas el estado

// BUENO: Incluyes las fotos en el payload
const payload = {
  workClosure: {
    photos: workClosurePhotos // ✅ Array con URLs
  }
};
```

## Checklist de Verificación

- [ ] ¿Ves los `secure_url` en la consola después de cada upload?
- [ ] ¿El estado `workClosurePhotos` tiene las URLs (no está vacío)?
- [ ] ¿El `payload.workClosure.photos` es un array con URLs (no null ni [])?
- [ ] ¿El Content-Type del POST es `application/json`?
- [ ] ¿Incluyes el token de autorización?

## Ejemplo Completo Funcional

```javascript
import { useState } from 'react';

function InspectionForm() {
  const [workClosurePhotos, setWorkClosurePhotos] = useState([]);
  const [formData, setFormData] = useState({
    procedureNumber: '',
    inspectorName: '',
    // ... otros campos
  });

  // Función para subir fotos
  const uploadPhotos = async (files) => {
    const urls = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3000/cloudinary/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      const data = await response.json();
      urls.push(data.secure_url);
    }
    
    setWorkClosurePhotos(prev => [...prev, ...urls]);
    console.log('📸 Fotos guardadas:', urls);
  };

  // Función para crear la inspección
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      workClosure: {
        propertyNumber: "ABC123",
        cadastralNumber: "XYZ789",
        visitNumber: "visita_1",
        photos: workClosurePhotos, // ← Las URLs que guardaste
        actions: "Sellado de puerta",
        observations: "Obra sin permisos"
      }
    };
    
    console.log('📦 Enviando:', payload);
    
    const response = await fetch('http://localhost:3000/inspections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('✅ Resultado:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" multiple onChange={e => uploadPhotos(e.target.files)} />
      <button type="submit">Crear Inspección</button>
    </form>
  );
}
```

## Resumen

**El backend está correcto y funcionando**. Solo necesitas implementar el manejo correcto de las URLs en el frontend:

1. **Guarda las URLs** que devuelve Cloudinary después de cada upload
2. **Actualiza el estado** con esas URLs
3. **Incluye el array de URLs** en el campo `photos` del payload
4. **Verifica con console.log** antes de enviar

Una vez que hagas estos cambios, las fotos se guardarán correctamente en la base de datos.

## Contacto Backend

Si después de implementar esto sigues teniendo problemas, envía:
- El console.log del payload completo antes de enviarlo
- El console.log del estado `workClosurePhotos` después de subir las fotos
- La respuesta que recibes del servidor

---

**Fecha de creación:** 5 de noviembre de 2025
**Backend endpoint:** `POST http://localhost:3000/cloudinary/upload`
**Campo requerido:** `photos: string[]` (array de URLs de Cloudinary)
