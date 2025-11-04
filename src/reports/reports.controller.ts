import {
  Controller,
  Get,
  Query,
  Param,
  Res,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports/inspections')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Buscar todas las inspecciones por número de trámite
   * GET /reports/inspections?procedureNumber=12345
   * Retorna array con todas las inspecciones que comparten el mismo número
   */
  @Get()
  async searchByProcedureNumber(
    @Query('procedureNumber') procedureNumber: string,
  ) {
    if (!procedureNumber) {
      throw new NotFoundException('Debe proporcionar un número de trámite');
    }

    const inspections = await this.reportsService.findAllByProcedureNumber(procedureNumber);

    if (!inspections || inspections.length === 0) {
      throw new NotFoundException(`No se encontraron inspecciones con número de trámite: ${procedureNumber}`);
    }

    return {
      success: true,
      count: inspections.length,
      data: inspections,
      message: inspections.length > 1 
        ? `Se encontraron ${inspections.length} inspecciones con este número de trámite. Use el ID específico para operaciones individuales.`
        : undefined,
    };
  }

  /**
   * Buscar inspección específica por ID
   * GET /reports/inspections/by-id/:id
   */
  @Get('by-id/:id')
  async getInspectionById(@Param('id') id: number) {
    const inspection = await this.reportsService.findById(id);

    if (!inspection) {
      throw new NotFoundException(`No se encontró inspección con ID: ${id}`);
    }

    return {
      success: true,
      data: inspection,
    };
  }

  /**
   * Exportar inspección individual a CSV por número de trámite
   * GET /reports/inspections/:procedureNumber/csv
   */
  @Get(':procedureNumber/csv')
  async exportToCSV(
    @Res() res: Response,
    @Param('procedureNumber') procedureNumber: string,
  ) {
    try {
      if (!procedureNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Debe proporcionar un número de trámite',
        });
      }

      const csv = await this.reportsService.generateCSV(procedureNumber);

      const filename = `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));

      return res.status(HttpStatus.OK).send('\ufeff' + csv); // BOM para UTF-8
    } catch (error) {
      console.error('Error generando CSV:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al generar el reporte CSV',
        error: error.message,
      });
    }
  }

  /**
   * Exportar inspección individual a PDF por número de trámite
   * GET /reports/inspections/:procedureNumber/pdf
   * Si hay múltiples inspecciones, usa la más reciente
   */
  @Get(':procedureNumber/pdf')
  async exportToPDF(
    @Res() res: Response,
    @Param('procedureNumber') procedureNumber: string,
  ) {
    try {
      if (!procedureNumber) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Debe proporcionar un número de trámite',
        });
      }

      // Verificar si hay múltiples inspecciones con este número
      const inspections = await this.reportsService.findAllByProcedureNumber(procedureNumber);
      
      if (!inspections || inspections.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: `No se encontraron inspecciones con número de trámite: ${procedureNumber}`,
        });
      }

      if (inspections.length > 1) {
        return res.status(HttpStatus.CONFLICT).json({
          message: `Se encontraron ${inspections.length} inspecciones con este número de trámite`,
          count: inspections.length,
          inspections: inspections.map(i => ({
            id: i.id,
            procedureNumber: i.procedureNumber,
            createdAt: i.createdAt,
            inspectionDate: i.inspectionDate,
            status: i.status,
            applicantType: i.applicantType,
          })),
          suggestion: 'Use /reports/inspections/by-id/:id/pdf para generar PDF de una inspección específica',
        });
      }

      const pdfBuffer = await this.reportsService.generatePDF(procedureNumber);

      const filename = `inspeccion_${procedureNumber}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al generar el reporte PDF',
        error: error.message,
      });
    }
  }

  /**
   * Exportar inspección específica a PDF por ID
   * GET /reports/inspections/by-id/:id/pdf
   */
  @Get('by-id/:id/pdf')
  async exportToPDFById(
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Debe proporcionar un ID de inspección',
        });
      }

      const pdfBuffer = await this.reportsService.generatePDFById(id);

      const inspection = await this.reportsService.findById(id);
      const filename = `inspeccion_${inspection.procedureNumber}_id${id}_${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      console.error('Error generando PDF:', error);
      
      if (error.message.includes('no encontrada')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al generar el reporte PDF',
        error: error.message,
      });
    }
  }
}
