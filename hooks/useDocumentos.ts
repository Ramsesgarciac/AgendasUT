import { useState } from 'react';
import { documentoService } from '../lib/services/documentoService';
import { Documento } from '../types/documento';

interface UploadDocumentosData {
  files: File[];
  documentos: { nombre: string; tipoDoc: string; idActividades: number; entregaId: number }[];
}

export const useDocumentos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDocumentos = async (): Promise<Documento[]> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.getDocumentos();
      return result;
    } catch (err) {
      console.error('Error fetching documentos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocumentoById = async (id: number): Promise<Documento> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.getDocumentoById(id);
      return result;
    } catch (err) {
      console.error('Error fetching documento by id:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumento = async (id: number, data: Partial<Documento>): Promise<Documento> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.updateDocumento(id, data);
      return result;
    } catch (err) {
      console.error('Error updating documento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocumento = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await documentoService.deleteDocumento(id);
    } catch (err) {
      console.error('Error deleting documento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

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
    getDocumentos,
    getDocumentoById,
    updateDocumento,
    deleteDocumento,
    uploadDocumentos,
  };
};