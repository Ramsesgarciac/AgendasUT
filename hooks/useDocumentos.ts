import { useState } from 'react';
import { documentoService } from '../lib/services/documentoService';
import { Documento } from '../types/documento';

interface UploadDocumentosData {
  files: File[];
  documentos: { nombre: string; tipoDoc: string; idActividades: number }[];
}

export const useDocumentos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocumentos = async (data: UploadDocumentosData): Promise<Documento[]> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.uploadMultiple(data.files, data.documentos);
      return result;
    } catch (err) {
      console.error('Error uploading documentos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadDocumentos,
  };
};