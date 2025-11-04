import PDFDocument = require('pdfkit');
import * as https from 'https';
import * as http from 'http';

export class PDFFormatterService {
  /**
   * Descargar imagen desde URL
   */
  private static async downloadImage(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });
  }
  /**
   * Genera PDF con formato oficial de 3 páginas
   * Página 1: Tabla con información de la inspección
   * Página 2: Fotografías (solo si existen)
   * Página 3: Firmas
   */
  static async generateOfficialPDF(inspection: any): Promise<Buffer> {
    // Primero, descargar todas las fotos
    const allPhotos: any[] = [];
    
    if (inspection.antiquity?.photos?.length) {
      for (const p of inspection.antiquity.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Antigüedad' });
        } catch (error) {
          console.error('Error descargando foto de Antigüedad:', error);
        }
      }
    }
    if (inspection.pcCancellation?.photos?.length) {
      for (const p of inspection.pcCancellation.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Anulación PC' });
        } catch (error) {
          console.error('Error descargando foto de Anulación PC:', error);
        }
      }
    }
    if (inspection.generalInspection?.photos?.length) {
      for (const p of inspection.generalInspection.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Inspección General' });
        } catch (error) {
          console.error('Error descargando foto de Inspección General:', error);
        }
      }
    }
    if (inspection.workReceipt?.photos?.length) {
      for (const p of inspection.workReceipt.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Recibido de Obra' });
        } catch (error) {
          console.error('Error descargando foto de Recibido de Obra:', error);
        }
      }
    }
    if (inspection.concession?.photos?.length) {
      for (const p of inspection.concession.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Concesión ZMT' });
        } catch (error) {
          console.error('Error descargando foto de Concesión ZMT:', error);
        }
      }
    }
    if (inspection.mayorOffice?.photos?.length) {
      for (const p of inspection.mayorOffice.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Alcaldía' });
        } catch (error) {
          console.error('Error descargando foto de Alcaldía:', error);
        }
      }
    }
    if (inspection.construction?.photos?.length) {
      for (const p of inspection.construction.photos) {
        try {
          const buffer = await this.downloadImage(p);
          allPhotos.push({ buffer, source: 'Construcción' });
        } catch (error) {
          console.error('Error descargando foto de Construcción:', error);
        }
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const currentDate = new Date();
        const year = currentDate.getFullYear();

        // Formatear fecha en español (mayúsculas)
        const dateFormatter = new Intl.DateTimeFormat('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const formattedDate = dateFormatter.format(currentDate).toUpperCase();

        // ===============================================
        // DETERMINAR DATOS DEL SOLICITANTE DINÁMICAMENTE
        // ===============================================
        let personaEmpresa = 'NO ESPECIFICADO';
        let numeroId = 'N/A';

        if (inspection.individualRequest) {
          const ind = inspection.individualRequest;
          personaEmpresa = `${ind.firstName || ''} ${ind.lastName1 || ''} ${ind.lastName2 || ''}`.trim();
          numeroId = ind.physicalId || 'N/A';
        } else if (inspection.legalEntityRequest) {
          const legal = inspection.legalEntityRequest;
          personaEmpresa = legal.legalName || 'NO ESPECIFICADO';
          numeroId = legal.legalId || 'N/A';
        } else if (inspection.applicantType === 'Anonimo') {
          personaEmpresa = 'ANÓNIMO';
          numeroId = 'ANÓNIMO';
        }

        // Datos de ubicación
        const provincia = 'Guanacaste';
        const canton = 'Santa Cruz';
        const distrito = inspection.location?.district || 'N/A';
        const direccion = inspection.location?.exactAddress || 'N/A';

        // Fecha de visita
        const fechaVisita = inspection.inspectionDate 
          ? new Date(inspection.inspectionDate).toLocaleDateString('es-ES')
          : 'N/A';

        // Nombres de inspectores
        const inspectores = inspection.inspectors
          ?.map(i => `${i.firstName} ${i.lastName} ${i.secondLastName || ''}`.trim())
          .join(', ') || 'N/A';

        // ===============================================
        // PÁGINA 1: ENCABEZADO Y TABLA DE INFORMACIÓN
        // ===============================================

        // Escudo municipal en la esquina superior izquierda
        const logoPath = 'C:\\Users\\MSI GERALD\\inspecciones\\public\\Logo Municipalidad.png';
        
        try {
          // Logo en esquina, sin forzar height para mantener proporción
          doc.image(logoPath, 40, 35, { width: 55 });
        } catch (error) {
          console.error('Error al cargar el logo:', error);
        }

        // Encabezado centrado como los títulos de tablas
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Municipalidad de Santa Cruz', 0, 48, { align: 'center', width: 612 })
          .fontSize(9)
          .font('Helvetica')
          .text('Departamento de Inspecciones', 0, 63, { align: 'center', width: 612 });

        // Fecha en esquina superior derecha (en minúsculas excepto primera letra)
        const formattedDateLower = formattedDate.charAt(0) + formattedDate.slice(1).toLowerCase();
        doc
          .fontSize(9)
          .font('Helvetica')
          .text(formattedDateLower, 380, 53, { align: 'right', width: 165 });

        // Más espacio después del encabezado
        doc.y = 120;

        // Asunto
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Asunto: ', 50, doc.y, { continued: true })
          .font('Helvetica')
          .text('Informe de inspección municipal')
          .moveDown(0.5);

        // Referencia
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Ref.: ', 50, doc.y, { continued: true })
          .font('Helvetica')
          .text(`Boleta de inspección No. ${inspection.procedureNumber}`)
          .moveDown(1.5);

        // Tabla 1: Datos del solicitante
        const tableStartY = doc.y;
        
        // Título alineado a la izquierda
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Datos de la inspección', 50, tableStartY);

        const tableTop = tableStartY + 25;
        const tableWidth = 495;
        const colWidth = tableWidth / 2;

        // Encabezado de tabla (gris)
        doc
          .rect(50, tableTop, tableWidth, 25)
          .fillAndStroke('#E8E8E8', '#000000');

        doc
          .fillColor('#000000')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Datos del solicitante e inspección', 55, tableTop + 8, { width: tableWidth - 10, align: 'center' });

        // Fila 1: Persona/Empresa | Provincia
        let rowY = tableTop + 25;
        doc.rect(50, rowY, colWidth, 25).stroke();
        doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();
        
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('Persona / Empresa:', 55, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(personaEmpresa, 55, rowY + 13, { width: colWidth - 10 });

        doc
          .font('Helvetica-Bold')
          .text('Provincia:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(provincia, 55 + colWidth, rowY + 13, { width: colWidth - 10 });

        // Fila 2: No. de ID | Cantón
        rowY += 25;
        doc.rect(50, rowY, colWidth, 25).stroke();
        doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

        doc
          .font('Helvetica-Bold')
          .text('No. de ID:', 55, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(numeroId, 55, rowY + 13, { width: colWidth - 10 });

        doc
          .font('Helvetica-Bold')
          .text('Cantón:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(canton, 55 + colWidth, rowY + 13, { width: colWidth - 10 });

        // Fila 3: No. de Finca | Distrito
        rowY += 25;
        doc.rect(50, rowY, colWidth, 25).stroke();
        doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

        const finca = inspection.antiquity?.propertyNumber || 
                     inspection.generalInspection?.propertyNumber || 
                     inspection.construction?.propertyNumber || 'N/A';

        doc
          .font('Helvetica-Bold')
          .text('No. de Finca:', 55, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(finca, 55, rowY + 13, { width: colWidth - 10 });

        doc
          .font('Helvetica-Bold')
          .text('Distrito:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(distrito, 55 + colWidth, rowY + 13, { width: colWidth - 10 });

        // Fila 4: No. de Catastro | Fecha Visita
        rowY += 25;
        doc.rect(50, rowY, colWidth, 25).stroke();
        doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

        doc
          .font('Helvetica-Bold')
          .text('No. de Catastro:', 55, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text('N/A', 55, rowY + 13, { width: colWidth - 10 });

        doc
          .font('Helvetica-Bold')
          .text('Fecha Visita:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
          .font('Helvetica')
          .text(fechaVisita, 55 + colWidth, rowY + 13, { width: colWidth - 10 });

        // Fila 5: Dirección (ancho completo)
        rowY += 25;
        doc.rect(50, rowY, tableWidth, 30).stroke();

        doc
          .font('Helvetica-Bold')
          .text('Dirección:', 55, rowY + 3, { width: tableWidth - 10 })
          .font('Helvetica')
          .text(direccion, 55, rowY + 13, { width: tableWidth - 10 });

        // Fila 6: Inspectores (ancho completo)
        rowY += 30;
        doc.rect(50, rowY, tableWidth, 30).stroke();

        doc
          .font('Helvetica-Bold')
          .text('Inspector(es):', 55, rowY + 3, { width: tableWidth - 10 })
          .font('Helvetica')
          .text(inspectores, 55, rowY + 13, { width: tableWidth - 10 });

        // ===============================================
        // DETALLES DE DEPENDENCIAS (si existen)
        // ===============================================
        rowY += 40;

        // Verificar si hay página nueva necesaria
        if (rowY > 650) {
          doc.addPage();
          rowY = 50;
          
          // Repetir encabezado en nueva página con logo
          try {
            doc.image(logoPath, 40, 35, { width: 55 });
          } catch (error) {
            console.error('Error al cargar el logo:', error);
          }

          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Municipalidad de Santa Cruz', 130, 48)
            .fontSize(9)
            .font('Helvetica')
            .text('Departamento de Inspecciones', 130, 63);

          doc
            .fontSize(9)
            .font('Helvetica')
            .text(formattedDateLower, 380, 53, { align: 'right', width: 165 });

          doc.y = 105;
          
          rowY = doc.y;
        }

        // CONCESIÓN ZMT
        if (inspection.concession) {
          const conc = inspection.concession;
          
          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Detalles - Zona Marítima Terrestre', 50, rowY);

          rowY += 25;

          // Encabezado azul claro
          doc
            .rect(50, rowY, tableWidth, 25)
            .fillAndStroke('#D4E6F1', '#000000');

          doc
            .fillColor('#000000')
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('Información de Concesión ZMT', 55, rowY + 8, { width: tableWidth - 10, align: 'center' });

          rowY += 25;

          // Fila 1: Número de Expediente | Tipo de Concesión
          doc.rect(50, rowY, colWidth, 25).stroke();
          doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

          doc
            .fontSize(8)
            .font('Helvetica-Bold')
            .text('Número de Expediente:', 55, rowY + 3, { width: colWidth - 10 })
            .font('Helvetica')
            .text(conc.fileNumber || 'N/A', 55, rowY + 13, { width: colWidth - 10 });

          doc
            .font('Helvetica-Bold')
            .text('Tipo de Concesión:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
            .font('Helvetica')
            .text(conc.concessionType || 'N/A', 55 + colWidth, rowY + 13, { width: colWidth - 10 });

          rowY += 25;

          // Fila 2: Fecha de Otorgamiento | Fecha de Vencimiento
          doc.rect(50, rowY, colWidth, 25).stroke();
          doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

          const fechaOtorgamiento = conc.grantedAt 
            ? new Date(conc.grantedAt).toLocaleDateString('es-ES')
            : 'N/A';
          const fechaVencimiento = conc.expiresAt 
            ? new Date(conc.expiresAt).toLocaleDateString('es-ES')
            : 'N/A';

          doc
            .font('Helvetica-Bold')
            .text('Fecha de Otorgamiento:', 55, rowY + 3, { width: colWidth - 10 })
            .font('Helvetica')
            .text(fechaOtorgamiento, 55, rowY + 13, { width: colWidth - 10 });

          doc
            .font('Helvetica-Bold')
            .text('Fecha de Vencimiento:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
            .font('Helvetica')
            .text(fechaVencimiento, 55 + colWidth, rowY + 13, { width: colWidth - 10 });

          rowY += 25;

          // Observaciones de Concesión
          if (conc.observations) {
            doc.rect(50, rowY, tableWidth, 30).stroke();

            doc
              .font('Helvetica-Bold')
              .text('Observaciones:', 55, rowY + 3, { width: tableWidth - 10 })
              .font('Helvetica')
              .text(conc.observations, 55, rowY + 13, { width: tableWidth - 10 });

            rowY += 30;
          }

          // PARCELAS
          if (conc.parcels && conc.parcels.length > 0) {
            rowY += 15;

            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(`Parcelas (${conc.parcels.length}):`, 50, rowY);

            rowY += 20;

            conc.parcels.forEach((parcel, idx) => {
              // Verificar espacio en página
              if (rowY > 680) {
                doc.addPage();
                rowY = 50;
              }

              // Título de parcela
              doc
                .rect(50, rowY, tableWidth, 25)
                .fillAndStroke('#F4B6C2', '#000000');

              doc
                .fillColor('#000000')
                .fontSize(9)
                .font('Helvetica-Bold')
                .text(`Parcela #${idx + 1}`, 55, rowY + 8, { width: tableWidth - 10 });

              rowY += 25;

              // Datos del plano
              doc.rect(50, rowY, colWidth, 25).stroke();
              doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

              doc
                .fontSize(8)
                .font('Helvetica-Bold')
                .text('Tipo de Plano:', 55, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(parcel.planType || 'N/A', 55, rowY + 13, { width: colWidth - 10 });

              doc
                .font('Helvetica-Bold')
                .text('Número de Plano:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(parcel.planNumber || 'N/A', 55 + colWidth, rowY + 13, { width: colWidth - 10 });

              rowY += 25;

              // Área y Tipo de Mojón
              doc.rect(50, rowY, colWidth, 25).stroke();
              doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

              doc
                .font('Helvetica-Bold')
                .text('Área:', 55, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(`${parcel.area || 'N/A'} m²`, 55, rowY + 13, { width: colWidth - 10 });

              doc
                .font('Helvetica-Bold')
                .text('Tipo de Mojón:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(parcel.mojonType || 'N/A', 55 + colWidth, rowY + 13, { width: colWidth - 10 });

              rowY += 25;

              // Cumplimiento y respeto de linderos
              doc.rect(50, rowY, colWidth, 25).stroke();
              doc.rect(50 + colWidth, rowY, colWidth, 25).stroke();

              doc
                .font('Helvetica-Bold')
                .text('¿Plano cumple?:', 55, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(parcel.planComplies ? 'Sí' : 'No', 55, rowY + 13, { width: colWidth - 10 });

              doc
                .font('Helvetica-Bold')
                .text('¿Respeta linderos?:', 55 + colWidth, rowY + 3, { width: colWidth - 10 })
                .font('Helvetica')
                .text(parcel.respectsBoundary ? 'Sí' : 'No', 55 + colWidth, rowY + 13, { width: colWidth - 10 });

              rowY += 25;

              // Topografía y cercas
              if (parcel.topography) {
                doc.rect(50, rowY, tableWidth, 25).stroke();

                doc
                  .fontSize(8)
                  .font('Helvetica-Bold')
                  .text('Topografía:', 55, rowY + 3, { width: tableWidth - 10 })
                  .font('Helvetica')
                  .text(parcel.topography, 55, rowY + 13, { width: tableWidth - 10 });

                rowY += 25;
              }

              // Ancho de servidumbre
              if (parcel.rightOfWayWidth) {
                doc.rect(50, rowY, tableWidth, 25).stroke();

                doc
                  .fontSize(8)
                  .font('Helvetica-Bold')
                  .text('Ancho de servidumbre:', 55, rowY + 3, { width: tableWidth - 10 })
                  .font('Helvetica')
                  .text(`${parcel.rightOfWayWidth} metros`, 55, rowY + 13, { width: tableWidth - 10 });

                rowY += 25;
              }

              rowY += 10; // Espacio entre parcelas
            });
          }

          rowY += 10;
        }

        // Observaciones generales
        if (rowY > 650) {
          doc.addPage();
          rowY = 50;
        }

        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Observaciones:', 50, rowY);

        rowY += 15;
        
        // Recopilar todas las observaciones de dependencias sin prefijos
        const observaciones: string[] = [];
        
        if (inspection.construction?.observations) {
          observaciones.push(inspection.construction.observations);
        }
        if (inspection.landUse?.observations) {
          observaciones.push(inspection.landUse.observations);
        }
        if (inspection.pcCancellation?.observations) {
          observaciones.push(inspection.pcCancellation.observations);
        }
        if (inspection.generalInspection?.observations) {
          observaciones.push(inspection.generalInspection.observations);
        }
        if (inspection.concession?.observations) {
          observaciones.push(inspection.concession.observations);
        }
        if (inspection.taxProcedure?.observations) {
          observaciones.push(inspection.taxProcedure.observations);
        }
        if (inspection.mayorOffice?.observations) {
          observaciones.push(inspection.mayorOffice.observations);
        }
        
        const observacionesTexto = observaciones.length > 0 
          ? observaciones.join('\n\n') 
          : 'Sin observaciones registradas';

        doc.rect(50, rowY, tableWidth, 80).stroke();
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(observacionesTexto, 55, rowY + 5, { width: tableWidth - 10, height: 70 });

        // Pie de página 1
        doc
          .fontSize(8)
          .font('Helvetica')
          .text('CIUDAD FOLCLÓRICA DE COSTA RICA', 50, 730, { align: 'center' })
          .text('Pág. 1 de 3', 520, 730);

        // Forzar nueva página para separar contenido
        doc.addPage();

        // ===============================================
        // PÁGINA 2: FOTOGRAFÍAS (Solo si existen)
        // ===============================================
        // Las fotos ya fueron descargadas antes del Promise
        if (allPhotos.length > 0) {
          // Encabezado página 2 con logo
          try {
            doc.image(logoPath, 40, 35, { width: 55 });
          } catch (error) {
            console.error('Error al cargar el logo en página 2:', error);
          }

          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('Municipalidad de Santa Cruz', 0, 48, { align: 'center', width: 612 })
            .fontSize(9)
            .font('Helvetica')
            .text('Departamento de Inspecciones', 0, 63, { align: 'center', width: 612 });

          doc
            .fontSize(9)
            .font('Helvetica')
            .text(formattedDateLower, 380, 53, { align: 'right', width: 165 });

          doc.y = 105;

          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Anexo fotográfico', 50, doc.y);

          doc.moveDown(1);

          // Encabezado rosa
          const photoHeaderY = doc.y;
          doc
            .rect(50, photoHeaderY, tableWidth, 25)
            .fillAndStroke('#F4B6C2', '#000000');

          doc
            .fillColor('#000000')
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('Fotografías del inmueble', 55, photoHeaderY + 8, { width: tableWidth - 10, align: 'center' });

          doc.moveDown(2);

          // Mostrar hasta 4 fotos (2x2)
          const photosToShow = allPhotos.slice(0, 4);
          let photoY = doc.y;
          let photoX = 50;
          const photoBoxSize = 200;
          const photoSpacing = 50;

          photosToShow.forEach((photo, index) => {
            if (index === 2) {
              photoY += photoBoxSize + photoSpacing;
              photoX = 50;
            }

            // Caja de foto
            doc.rect(photoX, photoY, photoBoxSize, photoBoxSize).stroke();
            
            try {
              // Cargar la imagen desde el buffer descargado
              if (photo.buffer) {
                doc.image(photo.buffer, photoX + 5, photoY + 5, {
                  fit: [photoBoxSize - 10, photoBoxSize - 10],
                  align: 'center',
                  valign: 'center'
                });
              } else {
                throw new Error('Buffer de foto no disponible');
              }
            } catch (error) {
              // Si falla, mostrar placeholder
              console.error(`Error al cargar foto ${index + 1}:`, error);
              doc
                .fontSize(8)
                .font('Helvetica')
                .fillColor('#999999')
                .text(`[Foto no disponible]`, photoX + 10, photoY + photoBoxSize / 2 - 10, {
                  width: photoBoxSize - 20,
                  align: 'center'
                })
                .fillColor('#000000');
            }

            // Descripción debajo
            doc
              .fontSize(7)
              .font('Helvetica')
              .fillColor('#000000')
              .text(`Ilustración ${index + 1}: ${photo.source}`, photoX, photoY + photoBoxSize + 5, {
                width: photoBoxSize,
                align: 'center'
              });

            photoX += photoBoxSize + photoSpacing;
          });

          // Pie de página 2
          doc
            .fontSize(8)
            .font('Helvetica')
            .text('CIUDAD FOLCLÓRICA DE COSTA RICA', 50, 730, { align: 'center' })
            .text('Pág. 2 de 3', 520, 730);

          // Forzar nueva página
          doc.addPage();
        } else {
          // Si no hay fotos, la página 1 ya hizo addPage, así que ya estamos en página 2
        }

        // ===============================================
        // PÁGINA 3 (o 2 si no hay fotos): FIRMA
        // ===============================================

        // Encabezado página final con logo
        try {
          doc.image(logoPath, 40, 35, { width: 55 });
        } catch (error) {
          console.error('Error al cargar el logo en página final:', error);
        }

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Municipalidad de Santa Cruz', 0, 48, { align: 'center', width: 612 })
          .fontSize(9)
          .font('Helvetica')
          .text('Departamento de Inspecciones', 0, 63, { align: 'center', width: 612 });

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(formattedDateLower, 380, 53, { align: 'right', width: 165 });

        doc.y = 150;

        // Texto de cierre
        doc
          .fontSize(10)
          .text('Sin otro particular,', 50)
          .moveDown(0.5)
          .text('Se suscribe,')
          .moveDown(4);

        // Línea de firma
        doc
          .moveTo(200, doc.y)
          .lineTo(450, doc.y)
          .stroke();

        doc.moveDown(1);

        // Nombre del firmante
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Arq. Fernando Arias Valerio, Msc.', 50, doc.y, { align: 'center' })
          .fontSize(9)
          .font('Helvetica')
          .text('Coordinador a.i., Departamento de Inspecciones', { align: 'center' });

        doc.moveDown(3);

        // Nota de archivo
        doc
          .fontSize(8)
          .text('Archivo', 50);

        doc.moveDown(2);

        // Texto de documento generado automáticamente
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor('#666666')
          .text('Documento generado automáticamente', 50, 680, { align: 'center', width: 512 });

        // Pie de página final
        const totalPages = allPhotos.length > 0 ? 3 : 2;
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#000000')
          .text('CIUDAD FOLCLÓRICA DE COSTA RICA', 50, 730, { align: 'center' })
          .text(`Pág. ${totalPages} de ${totalPages}`, 520, 730);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
