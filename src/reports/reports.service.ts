import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Inspection } from '../inspections/Entities/inspections.entity';
import PDFDocument = require('pdfkit');
import { Parser } from 'json2csv';
import { PDFFormatterService } from './pdf-formatter.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
  ) {}

  /**
   * Buscar todas las inspecciones por número de trámite
   */
  async findAllByProcedureNumber(procedureNumber: string): Promise<any[]> {
    const inspections = await this.inspectionRepo.find({
      where: { procedureNumber },
      relations: [
        'inspectors',
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'location',
        'taxProcedure',
        'mayorOffice',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'antiquity',
        'landUse',
        'concession',
        'concession.parcels',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
      order: { createdAt: 'DESC' },
    });

    // Sanitizar datos sensibles de inspectores
    return inspections.map(inspection => ({
      ...inspection,
      inspectors: inspection.inspectors?.map(inspector => ({
        id: inspector.id,
        firstName: inspector.firstName,
        lastName: inspector.lastName,
        secondLastName: inspector.secondLastName,
        role: inspector.role,
      })),
    }));
  }

  /**
   * Buscar inspección por número de trámite con todas las relaciones
   * y sanitizar datos sensibles
   */
  async findByProcedureNumber(procedureNumber: string): Promise<any> {
    const inspection = await this.inspectionRepo.findOne({
      where: { procedureNumber },
      relations: [
        'inspectors',
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'location',
        'taxProcedure',
        'mayorOffice',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'antiquity',
        'landUse',
        'concession',
        'concession.parcels',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
      order: { createdAt: 'DESC' },
    });

    if (!inspection) {
      return null;
    }

    // Sanitizar datos sensibles de inspectores
    const sanitizedInspection = {
      ...inspection,
      inspectors: inspection.inspectors?.map(inspector => ({
        id: inspector.id,
        firstName: inspector.firstName,
        lastName: inspector.lastName,
        secondLastName: inspector.secondLastName,
        role: inspector.role,
      })),
    };

    return sanitizedInspection;
  }

  /**
   * Buscar inspección por ID específico
   */
  async findById(id: number): Promise<any> {
    const inspection = await this.inspectionRepo.findOne({
      where: { id },
      relations: [
        'inspectors',
        'individualRequest',
        'legalEntityRequest',
        'construction',
        'location',
        'taxProcedure',
        'mayorOffice',
        'pcCancellation',
        'workReceipt',
        'generalInspection',
        'antiquity',
        'landUse',
        'concession',
        'concession.parcels',
        'collection',
        'revenuePatent',
        'workClosure',
        'platformAndService',
      ],
    });

    if (!inspection) {
      return null;
    }

    // Sanitizar datos sensibles de inspectores
    const sanitizedInspection = {
      ...inspection,
      inspectors: inspection.inspectors?.map(inspector => ({
        id: inspector.id,
        firstName: inspector.firstName,
        lastName: inspector.lastName,
        secondLastName: inspector.secondLastName,
        role: inspector.role,
      })),
    };

    return sanitizedInspection;
  }

  /**
   * Generar reporte CSV de una inspección individual
   */
  async generateCSV(procedureNumber: string): Promise<string> {
    const inspection = await this.findByProcedureNumber(procedureNumber);

    if (!inspection) {
      throw new Error(`Inspección con número de trámite ${procedureNumber} no encontrada`);
    }

    // Mapear datos para CSV
    const data = [{
      'ID': inspection.id,
      'Número de Trámite': inspection.procedureNumber,
      'Fecha de Inspección': inspection.inspectionDate || 'N/A',
      'Estado': inspection.status,
      'Tipo de Solicitante': inspection.applicantType,
      
      // Inspectores
      'Inspectores': inspection.inspectors?.map(i => `${i.firstName} ${i.lastName}`).join(', ') || 'N/A',
      
      // Solicitante Individual
      'Solicitante Nombre': inspection.individualRequest 
        ? `${inspection.individualRequest.firstName} ${inspection.individualRequest.lastName1} ${inspection.individualRequest.lastName2 || ''}`
        : 'N/A',
      'Solicitante Cédula': inspection.individualRequest?.physicalId || 'N/A',
      
      // Entidad Legal
      'Empresa Nombre': inspection.legalEntityRequest?.legalName || 'N/A',
      'Empresa Cédula Jurídica': inspection.legalEntityRequest?.legalId || 'N/A',
      
      // Construcción
      'Tiene Construcción': inspection.construction ? 'Sí' : 'No',
      'Tipo de Uso de Suelo': inspection.construction?.landUseType || 'N/A',
      'Coincide Ubicación': inspection.construction?.matchesLocation ? 'Sí' : 'No',
      'Construcción Recomendada': inspection.construction?.recommended ? 'Sí' : 'No',
      'Uso de Suelo': inspection.landUse ? 'Sí' : 'No',
      'Antigüedad': inspection.antiquity ? 'Sí' : 'No',
      'Anulación PC': inspection.pcCancellation ? 'Sí' : 'No',
      'Inspección General': inspection.generalInspection ? 'Sí' : 'No',
      'Recibo de Obra': inspection.workReceipt ? 'Sí' : 'No',
      
      // Ubicación
      'Tiene Ubicación': inspection.location ? 'Sí' : 'No',
      'Distrito': inspection.location?.district || 'N/A',
      'Dirección': inspection.location?.exactAddress || 'N/A',
      
      // Otras dependencias
      'Trámite Fiscal': inspection.taxProcedure ? 'Sí' : 'No',
      'Alcaldía': inspection.mayorOffice ? 'Sí' : 'No',
      'Concesión ZMT': inspection.concession ? 'Sí' : 'No',
      'Cobranza': inspection.collection ? 'Sí' : 'No',
      'Patente Renta': inspection.revenuePatent ? 'Sí' : 'No',
      'Cierre de Obra': inspection.workClosure ? 'Sí' : 'No',
      'Plataforma y Servicio': inspection.platformAndService ? 'Sí' : 'No',
      
      // Fechas
      'Fecha Creación': inspection.createdAt?.toISOString().split('T')[0] || 'N/A',
      'Fecha Actualización': inspection.updatedAt?.toISOString().split('T')[0] || 'N/A',
      'Fecha Revisión': inspection.reviewedAt?.toISOString().split('T')[0] || 'N/A',
      
      // Observaciones
      'Observaciones Construcción': inspection.construction?.observations || 'N/A',
    }];

    // Configurar parser CSV con todos los campos
    const fields = Object.keys(data[0]);

    const json2csvParser = new Parser({ fields, delimiter: ',' });
    return json2csvParser.parse(data);
  }

  /**
   * Generar reporte PDF de una inspección individual por número de trámite
   * Formato oficial de 3 páginas
   */
  async generatePDF(procedureNumber: string): Promise<Buffer> {
    const inspection = await this.findByProcedureNumber(procedureNumber);

    if (!inspection) {
      throw new Error(`Inspección con número de trámite ${procedureNumber} no encontrada`);
    }

    // Usar el nuevo formato oficial de PDF
    return PDFFormatterService.generateOfficialPDF(inspection);
  }

  /**
   * Generar reporte PDF de una inspección específica por ID
   * Formato oficial de 3 páginas
   */
  async generatePDFById(id: number): Promise<Buffer> {
    const inspection = await this.findById(id);

    if (!inspection) {
      throw new Error(`Inspección con ID ${id} no encontrada`);
    }

    // Usar el nuevo formato oficial de PDF
    return PDFFormatterService.generateOfficialPDF(inspection);
  }

  /**
   * Helper para agregar secciones con formato consistente
   */
  private addSection(doc: typeof PDFDocument, title: string) {
    if (doc.y > 700) {
      doc.addPage();
    }
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2c3e50')
      .text(title, { underline: true })
      .fillColor('#000000')
      .moveDown(0.3);
  }
}
