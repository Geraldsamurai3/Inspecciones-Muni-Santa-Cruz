# 📖 Documentación del API para Frontend

## 📍 Ubicación
```
docs/api/
```

## 🎯 Propósito

Esta carpeta contiene **toda la documentación necesaria** para que el equipo frontend pueda integrarse correctamente con el backend del sistema de inspecciones.

---

## 📚 Documentos Disponibles

### 🌟 Empieza aquí: [docs/api/SUMMARY.md](./docs/api/SUMMARY.md)
Resumen ejecutivo con guía rápida para empezar

### 📋 Índice principal: [docs/api/README.md](./docs/api/README.md)
Índice completo con links a todos los documentos

### 📖 Documentos Principales:

| Archivo | Descripción | Para quién |
|---------|-------------|-----------|
| **[index.md](./docs/api/index.md)** | Guía de inicio rápido (10 min) | Todos - Empezar aquí |
| **[API-REFERENCE.md](./docs/api/API-REFERENCE.md)** | 60+ endpoints documentados | Consulta técnica |
| **[TYPESCRIPT-INTERFACES.md](./docs/api/TYPESCRIPT-INTERFACES.md)** | 50+ interfaces TypeScript | Developers TypeScript |
| **[INTEGRATION-EXAMPLES.md](./docs/api/INTEGRATION-EXAMPLES.md)** | Componentes React listos | Frontend developers |
| **[ERROR-HANDLING.md](./docs/api/ERROR-HANDLING.md)** | Manejo de errores completo | Debugging y UX |
| **[HTTP-STATUS-CODES.md](./docs/api/HTTP-STATUS-CODES.md)** | Referencia códigos HTTP | Quick reference |
| **[LIBRARY-EXAMPLES.md](./docs/api/LIBRARY-EXAMPLES.md)** | Axios, React Query, SWR, MSW | Setup herramientas |

---

## 🚀 Quick Start

### Para Frontend Developers:

1. **Abre:** `docs/api/SUMMARY.md` (3 min de lectura)
2. **Lee:** `docs/api/index.md` (10 min)
3. **Copia código:** `docs/api/INTEGRATION-EXAMPLES.md`
4. **Consulta endpoints:** `docs/api/API-REFERENCE.md`

### Para Backend Developers:

Esta documentación está lista para compartir con el equipo frontend. Solo necesitas:

1. Enviar el link al folder `docs/api/`
2. Pedirles que empiecen con `SUMMARY.md`
3. Estar disponible para dudas específicas

---

## 🆕 NUEVAS FUNCIONALIDADES (Octubre 2025)

Se agregaron **3 nuevos tipos de inspecciones** que requieren implementación en el frontend:

### 📦 Documentación de Nuevas Funcionalidades:

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| **[QUICK-START-NUEVAS-FUNCIONALIDADES.md](./docs/QUICK-START-NUEVAS-FUNCIONALIDADES.md)** | ⚡ Guía rápida (5 min) | Empezar aquí |
| **[NUEVAS-FUNCIONALIDADES-FRONTEND.md](./docs/NUEVAS-FUNCIONALIDADES-FRONTEND.md)** | 📖 Documentación completa | Referencia detallada |
| **[TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts](./docs/TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts)** | 💻 Tipos TypeScript | Copiar y pegar |

### Nuevos Tipos de Inspección:

#### 1️⃣ Collection (Cobros/Notificaciones)
- **Endpoint:** `POST /inspections` con `type: "collection"`
- **Propósito:** Registrar intentos de cobro con diferentes estados
- **Campos requeridos:** Ninguno (todos opcionales)
- **Característica especial:** Checkboxes que envían "X" cuando marcados

#### 2️⃣ Revenue Patent (Patentes de Ingresos)
- **Endpoint:** `POST /inspections` con `type: "revenue_patent"`
- **Propósito:** Gestión de licencias comerciales y de licores
- **Campos requeridos:** `tradeName`, `licenseType`
- **Característica especial:** Distancias a centros sensibles (formato "123m")

#### 3️⃣ Work Closure (Cierres de Obra)
- **Endpoint:** `POST /inspections` con `type: "work_closure"`
- **Propósito:** Registro de cierres de obra con información de visitas
- **Campos requeridos:** `workReceipt` (boolean)
- **Característica especial:** Número de visita (visita_1, visita_2, visita_3)

### 🎯 Quick Start para Nuevas Funcionalidades:

```bash
# 1. Lee la guía rápida (5 minutos)
docs/QUICK-START-NUEVAS-FUNCIONALIDADES.md

# 2. Copia los tipos TypeScript
docs/TYPESCRIPT-TYPES-NUEVAS-FUNCIONALIDADES.ts

# 3. Lee la documentación completa cuando necesites detalles
docs/NUEVAS-FUNCIONALIDADES-FRONTEND.md
```

### 📝 Ejemplo Rápido:

```typescript
// Collection
POST /inspections
{
  "type": "collection",
  "inspectorIds": [1],
  "collection": {
    "nobodyPresent": "X",
    "other": "Regresa el lunes"
  }
}

// Revenue Patent
POST /inspections
{
  "type": "revenue_patent",
  "inspectorIds": [1],
  "revenuePatent": {
    "tradeName": "Bar El Amanecer",
    "licenseType": "licencia_licores",
    "educationalCenters": "500m"
  }
}

// Work Closure
POST /inspections
{
  "type": "work_closure",
  "inspectorIds": [1],
  "workClosure": {
    "workReceipt": true,
    "visitNumber": "visita_2"
  }
}
```

---

## 📊 Contenido

- ✅ 60+ endpoints documentados
- ✅ 50+ TypeScript interfaces
- ✅ 10+ componentes React de ejemplo
- ✅ Manejo de errores completo
- ✅ Ejemplos con Axios, React Query, SWR
- ✅ Setup para testing con MSW
- ✅ Validación con Zod
- ✅ Casos de error comunes resueltos

---

## 🎓 Niveles de Documentación

### Nivel 1: Principiante
- `index.md` - Guía básica
- `INTEGRATION-EXAMPLES.md` - Código copy-paste
- `ERROR-HANDLING.md` - Errores comunes

### Nivel 2: Intermedio
- `API-REFERENCE.md` - Todos los endpoints
- `TYPESCRIPT-INTERFACES.md` - Tipos completos
- `HTTP-STATUS-CODES.md` - Códigos HTTP

### Nivel 3: Avanzado
- `LIBRARY-EXAMPLES.md` - Librerías avanzadas
- `ERROR-HANDLING.md` - Error handling avanzado
- Testing y validación

---

## 💡 Casos de Uso

### "Necesito implementar login"
→ `docs/api/INTEGRATION-EXAMPLES.md` - LoginForm completo

### "¿Qué endpoints hay?"
→ `docs/api/API-REFERENCE.md` - Lista completa

### "Tengo un error 422"
→ `docs/api/ERROR-HANDLING.md` - Solución paso a paso

### "Necesito los tipos TypeScript"
→ `docs/api/TYPESCRIPT-INTERFACES.md` - 50+ interfaces

### "¿Cómo uso React Query?"
→ `docs/api/LIBRARY-EXAMPLES.md` - Setup completo

---

## 🔗 Links Directos

**Empezar:**
- [Resumen Ejecutivo](./docs/api/SUMMARY.md)
- [Guía de Inicio Rápido](./docs/api/index.md)

**Referencia:**
- [Endpoints Completos](./docs/api/API-REFERENCE.md)
- [TypeScript Types](./docs/api/TYPESCRIPT-INTERFACES.md)

**Código:**
- [Ejemplos React](./docs/api/INTEGRATION-EXAMPLES.md)
- [Ejemplos Librerías](./docs/api/LIBRARY-EXAMPLES.md)

**Debugging:**
- [Manejo de Errores](./docs/api/ERROR-HANDLING.md)
- [Códigos HTTP](./docs/api/HTTP-STATUS-CODES.md)

---

## 📝 Actualización

Esta documentación está sincronizada con el código del backend. Cualquier cambio en endpoints o DTOs debe reflejarse aquí.

**Última actualización:** Octubre 2025  
**Versión API:** 1.0.0  
**Estado:** ✅ Completa y lista para usar

---

## 📞 Soporte

**Backend Team:**
- Email: backend@example.com
- Slack: #backend-support

**Para Issues:**
- Reportar en el repositorio
- Incluir endpoint afectado
- Adjuntar request/response

---

## ✨ Resumen

Esta documentación contiene **TODO** lo que el frontend necesita:

✅ Guías paso a paso  
✅ Endpoints completos  
✅ TypeScript interfaces  
✅ Código copy-paste listo  
✅ Manejo de errores  
✅ Ejemplos con librerías populares  
✅ Testing con MSW  
✅ Best practices  

**No se requiere conocimiento previo del backend. Todo está explicado.**

---

<div align="center">

**[👉 Empezar ahora con docs/api/SUMMARY.md](./docs/api/SUMMARY.md)**

</div>
