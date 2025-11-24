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
export const { uploadMultiple } = documentoService;