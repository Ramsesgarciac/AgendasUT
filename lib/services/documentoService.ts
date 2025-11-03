import { Documento } from '../../types/documento';
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

  uploadMultiple = async (
    files: File[],
    documentos: { nombre: string; tipoDoc: string; idActividades: number; entregaId: number }[]
  ): Promise<Documento[]> => {
    const formData = new FormData();

    // Agregar cada archivo al FormData
    files.forEach(file => {
      formData.append('archivos', file);
    });

    // Agregar los datos de los documentos como JSON string
    formData.append('documentos', JSON.stringify(documentos));

    // Usar URL completa para consistencia
    return this.fetchWithAuth('/api/documentos/multiple', {
      method: 'POST',
      body: formData,
    });
  };
}

export const documentoService = new DocumentoService();
export const { uploadMultiple } = documentoService;