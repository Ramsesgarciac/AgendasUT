import { Documento } from '../../types/documento';
import { Actividad } from '../../types/actividad';
import BaseService from './baseService';

class DocumentoService extends BaseService {
  private baseUrl = '/api/documentos';

  getDocumentos = async (): Promise<Documento[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };

  getDocumentoById = async (id: number): Promise<Documento> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`);
  };

  updateDocumento = async (id: number, data: Partial<Documento>): Promise<Documento> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  };

  updateDocumentoWithFile = async (id: number, data: { nombre: string; tipoDoc: string }, file?: File): Promise<Documento> => {
    if (file) {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('nombre', data.nombre);
      formData.append('tipoDoc', data.tipoDoc);

      return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        body: formData,
      });
    } else {
      return this.updateDocumento(id, data);
    }
  };

  deleteDocumento = async (id: number): Promise<void> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  };

  downloadDocumento = async (id: number): Promise<Blob> => {
    const response = await this.fetchWithAuthBlob(`${this.baseUrl}/${id}/download`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  };

  viewDocumento = async (id: number): Promise<string> => {
    const response = await this.fetchWithAuthBlob(`${this.baseUrl}/${id}/ver`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  /**
   * Genera y sube un acuse de creación de actividad en PDF
   * @param actividad - La actividad recién creada
   * @param usuarioId - ID del usuario que creó la actividad
   * @param entregaId - ID de la entrega asociada (debe existir en la BD)
   */
  createActividadAcuse = async (
    actividad: Actividad, 
    usuarioId: number,
    entregaId: number
  ): Promise<Documento> => {
    try {
      console.log('📄 Generating PDF acuse for actividad:', actividad.id);
      console.log('📋 Parameters:', { actividadId: actividad.id, usuarioId, entregaId });
      
      const { default: jsPDF } = await import('jspdf');
      const docPDF = new jsPDF();
      
      // Configurar el documento
      docPDF.setFontSize(18);
      docPDF.text('Acuse de Creación de Actividad', 20, 20);
      
      docPDF.setFontSize(10);
      docPDF.setTextColor(100);
      docPDF.text(`Fecha de creación: ${new Date().toLocaleString('es-MX')}`, 20, 30);
      
      // Línea separadora
      docPDF.setDrawColor(200);
      docPDF.line(20, 35, 190, 35);
      
      // Información de la actividad
      docPDF.setFontSize(12);
      docPDF.setTextColor(0);
      docPDF.text('Información de la Actividad:', 20, 45);
      
      docPDF.setFontSize(10);
      let yPos = 55;
      
      // ID de la actividad
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('ID:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(actividad.id.toString(), 55, yPos);
      yPos += 10;
      
      // Asunto
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Asunto:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      const asuntoLines = docPDF.splitTextToSize(actividad.asunto, 150);
      docPDF.text(asuntoLines, 55, yPos);
      yPos += (asuntoLines.length * 5) + 5;
      
      // Tipo de Actividad
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Tipo:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(actividad.tipoActividad || 'N/A', 55, yPos);
      yPos += 10;
      
      // Instancia Emisora
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Instancia Emisora:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      const emisoraLines = docPDF.splitTextToSize(actividad.instanciaEmisora || 'N/A', 120);
      docPDF.text(emisoraLines, 55, yPos);
      yPos += (emisoraLines.length * 5) + 5;
      
      // Instancia Receptora
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Instancia Receptora:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      const receptoraLines = docPDF.splitTextToSize(actividad.instanciaReceptora || 'N/A', 120);
      docPDF.text(receptoraLines, 55, yPos);
      yPos += (receptoraLines.length * 5) + 5;
      
      // Fecha Límite
      docPDF.setFont('helvetica', 'bold');
      docPDF.text('Fecha Límite:', 20, yPos);
      docPDF.setFont('helvetica', 'normal');
      const fechaLimite = actividad.fechaLimite 
        ? new Date(actividad.fechaLimite).toLocaleDateString('es-MX')
        : 'N/A';
      docPDF.text(fechaLimite, 55, yPos);
      yPos += 10;
      
      // Descripción (si existe)
      if (actividad.descripcion) {
        docPDF.setFont('helvetica', 'bold');
        docPDF.text('Descripción:', 20, yPos);
        docPDF.setFont('helvetica', 'normal');
        yPos += 5;
        const descripcionLines = docPDF.splitTextToSize(actividad.descripcion, 170);
        docPDF.text(descripcionLines, 20, yPos);
        yPos += (descripcionLines.length * 5) + 10;
      }
      
      // Línea separadora
      if (yPos < 270) {
        docPDF.setDrawColor(200);
        docPDF.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Nota al pie
        docPDF.setFontSize(9);
        docPDF.setTextColor(100);
        docPDF.text('Este documento es un acuse de recepción digital generado automáticamente.', 20, yPos);
        docPDF.text('La actividad ha sido registrada en el sistema correctamente.', 20, yPos + 5);
      }
      
      // Generar el blob del PDF
      const pdfBlob = docPDF.output('blob');
      const acuseFile = new File(
        [pdfBlob], 
        `acuse_actividad_${actividad.id}.pdf`, 
        { type: 'application/pdf' }
      );
      
      console.log('✅ PDF generated, size:', pdfBlob.size, 'bytes');
      
      // Preparar FormData usando el formato que espera el backend de NestJS
      const formData = new FormData();
      formData.append('archivo', acuseFile);
      formData.append('nombre', `Acuse_Creacion_Actividad_${actividad.id}`);
      formData.append('tipoDoc', 'pdf');
      formData.append('idActividades', actividad.id.toString());
      formData.append('entregaId', entregaId.toString());
      formData.append('usuarioId', usuarioId.toString());
      formData.append('isAcuce', 'true');
      
      console.log('📤 Uploading acuse to:', this.baseUrl);
      console.log('📋 FormData entries:');
      for (let pair of formData.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }
      
      // Subir usando el endpoint simple POST /documentos
      const result = await this.fetchWithAuth(this.baseUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('✅ Acuse uploaded successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error creando acuse de actividad:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };

  uploadMultiple = async (
    files: File[],
    documentos: { nombre: string; tipoDoc: string; idActividades: number; entregaId: number; usuarioId: number }[]
  ): Promise<Documento[]> => {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('archivos', file);
    });

    const acusePromise = (async () => {
      const { default: jsPDF } = await import('jspdf');
      const docPDF = new jsPDF();
      docPDF.setFontSize(16);
      docPDF.text('Acuse de Recepción de Documentos', 20, 30);
      docPDF.setFontSize(12);
      docPDF.text(`Fecha de Subida: ${new Date().toLocaleString()}`, 20, 50);
      docPDF.text('Al respecto se emite este presente digital y se adjunta la evidencia correspondiente', 20, 60);
      docPDF.text('Documentos recibidos correctamente:', 20, 70);

      documentos.forEach((doc, index) => {
        const yPos = 90 + (index * 20);
        docPDF.text(`${index + 1}. Nombre: ${doc.nombre} - Tipo: ${doc.tipoDoc} - Actividad ID: ${doc.idActividades}`, 20, yPos);
      });

      const pdfBlob = docPDF.output('blob');
      const acuseFile = new File([pdfBlob], `acuse_documentos_${Date.now()}.pdf`, { type: 'application/pdf' });
      formData.append('archivos', acuseFile);

      return {
        nombre: `Acuse_Documentos_${Date.now()}`,
        tipoDoc: 'Acuse',
        idActividades: documentos[0].idActividades,
        entregaId: documentos[0].entregaId,
        usuarioId: documentos[0].usuarioId,
        isAcuce: true
      };
    })();

    const acuseData = [await acusePromise];
    const allDocumentos = [...documentos, ...acuseData];
    formData.append('documentos', JSON.stringify(allDocumentos));

    return this.fetchWithAuth(`${this.baseUrl}/multiple`, {
      method: 'POST',
      body: formData,
    });
  };
}

export const documentoService = new DocumentoService();
export const { uploadMultiple, createActividadAcuse } = documentoService;