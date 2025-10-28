import { Documento } from '../../types/documento';
import BaseService from './baseService';

class DocumentoService extends BaseService {
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
    
    // Usar ruta relativa en lugar de URL completa
    return this.fetchWithAuth('/api/documentos/multiple', {
      method: 'POST',
      body: formData,
    });
  };
}

export const documentoService = new DocumentoService();
export const { uploadMultiple } = documentoService;