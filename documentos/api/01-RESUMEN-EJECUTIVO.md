# Documentación Técnica - Sistema de Inspecciones Municipales Santa Cruz

## Resumen Ejecutivo

### Información General del Proyecto

**Nombre del Proyecto:** Sistema de Gestión de Inspecciones Municipales  
**Cliente:** Municipalidad de Santa Cruz  
**Versión:** 0.0.1  
**Fecha de Documentación:** Noviembre 2025  
**Estado:** En Producción  

### Descripción del Sistema

Sistema web integral para la gestión de inspecciones municipales de la Municipalidad de Santa Cruz, Costa Rica. Permite el registro, seguimiento, y generación de reportes de múltiples tipos de inspecciones municipales incluyendo construcción, trámites fiscales, alcaldía, concesiones de zona marítimo terrestre, cobranza, y más.

### Objetivos del Sistema

1. **Digitalizar** el proceso de inspecciones municipales
2. **Centralizar** la información de todas las dependencias en una sola plataforma
3. **Automatizar** la generación de reportes en formato PDF y CSV
4. **Facilitar** el seguimiento y control de inspecciones por parte de administradores
5. **Mejorar** la trazabilidad y auditoría de inspecciones
6. **Optimizar** el flujo de trabajo de inspectores

### Arquitectura General

**Backend:**
- Framework: NestJS con TypeScript
- Base de Datos: MariaDB
- ORM: TypeORM
- Autenticación: JWT + Passport
- Servicios Externos: Cloudinary (almacenamiento de imágenes)

**Frontend:** (No incluido en esta documentación)
- Aplicación separada en React
- Comunicación vía API REST

### Módulos Principales

1. **Autenticación y Usuarios** - Gestión de acceso y roles
2. **Inspecciones** - Núcleo del sistema con 14 tipos de inspecciones
3. **Dashboard** - Vistas personalizadas por rol
4. **Estadísticas** - Métricas y análisis de rendimiento
5. **Reportes** - Generación de documentos PDF y CSV
6. **Email** - Notificaciones automáticas
7. **Cloudinary** - Gestión de imágenes y documentos

### Tipos de Inspecciones Soportadas

#### Dependencias Principales
1. **Construcción** (con 5 subdependencias)
   - Uso de Suelo
   - Antigüedad
   - Anulación de Permiso de Construcción
   - Inspección General
   - Recibido de Obra
2. **Trámite Fiscal**
3. **Alcaldía**
4. **Concesión ZMT** (Zona Marítimo Terrestre)
5. **Cobranza/Notificaciones**
6. **Patente de Renta**
7. **Cierre de Obra**
8. **Plataforma y Servicios**

### Roles de Usuario

- **Admin**: Acceso completo al sistema, gestión de usuarios, vistas administrativas
- **Inspector**: Creación y gestión de inspecciones asignadas, dashboard personal

### Características Destacadas

✅ Sistema de estados de inspecciones (Nuevo, En Proceso, Revisado, Archivado, Papelera)  
✅ Archivado automático de inspecciones revisadas después de 7 días (CRON)  
✅ Papelera de reciclaje con soft delete  
✅ Múltiples inspecciones por número de trámite  
✅ Generación de PDF oficial de 3 páginas con logo y firmas  
✅ Exportación a CSV para análisis  
✅ Subida de imágenes a Cloudinary  
✅ Sistema de notificaciones por email  
✅ Dashboards personalizados por rol  
✅ Estadísticas en tiempo real  
✅ Validación exhaustiva de datos con class-validator  
✅ Seguridad con JWT y guards globales  

### Indicadores Clave de Rendimiento (KPIs)

El sistema permite visualizar:
- Total de inspecciones por estado
- Inspecciones por inspector
- Rendimiento por dependencia
- Tasa de completitud
- Tendencias mensuales
- Productividad del equipo

### Seguridad

- Autenticación JWT con tokens de acceso
- Contraseñas hasheadas con bcrypt (factor 10)
- Guards globales con decorador @Public() para excepciones
- Validación de roles en endpoints críticos
- Tokens de recuperación de contraseña con expiración (20 minutos)
- Sanitización de datos sensibles en respuestas API
- CORS configurado para frontend específico
- Validación de entrada con pipes globales

### Despliegue

**Desarrollo:**
- Backend: http://localhost:3000
- Base de Datos: MariaDB local (puerto 3306)

**Producción:**
- Backend: Railway (inspecciones-muni-santa-cruz-production.up.railway.app)
- Frontend: Vercel
- Base de Datos: MariaDB en Railway
- Imágenes: Cloudinary (cloud: da84etlav)

### Tecnologías y Dependencias Principales

```json
{
  "nestjs/core": "^11.0.1",
  "typeorm": "^0.3.25",
  "mariadb": "^3.4.5",
  "jwt": "^11.0.0",
  "bcrypt": "^6.0.0",
  "cloudinary": "^2.7.0",
  "pdfkit": "^0.17.2",
  "nodemailer": "^7.0.5",
  "class-validator": "^0.14.2"
}
```

### Siguientes Pasos Recomendados

1. ✅ Configurar SendGrid para emails en producción (Railway)
2. ⏳ Implementar tests unitarios y e2e
3. ⏳ Agregar logging y monitoreo (Winston/Sentry)
4. ⏳ Implementar caché (Redis) para estadísticas
5. ⏳ Agregar paginación a listados de inspecciones
6. ⏳ Implementar búsqueda avanzada con filtros
7. ⏳ Crear documentación de API con Swagger

### Contacto y Soporte

**Repositorio:** Inspecciones-Muni-Santa-Cruz  
**Owner:** Geraldsamurai3  
**Branch Principal:** main  

---

**Fecha de Última Actualización:** Noviembre 2025  
**Versión del Documento:** 1.0
