import { Documento } from '../../types/documento';

class DocumentoService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  uploadMultiple = async (files: File[], documentos: { nombre: string; tipoDoc: string; idActividades: number }[]): Promise<Documento[]> => {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('archivos', file);
    });

    formData.append('documentos', JSON.stringify(documentos));

    const response = await fetch('http://localhost:3000/documentos/multiple', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };
}

export const documentoService = new DocumentoService();
export const { uploadMultiple } = documentoService;