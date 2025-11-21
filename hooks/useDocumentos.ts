import { useState } from 'react';
import { documentoService } from '../lib/services/documentoService';
import { Documento } from '../types/documento';
import { Actividad } from '../types/actividad';

interface UploadDocumentosData {
  files: File[];
  documentos: { nombre: string; tipoDoc: string; idActividades: number; entregaId: number; usuarioId: number }[];
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

  const updateDocumentoWithFile = async (id: number, data: { nombre: string; tipoDoc: string }, file?: File): Promise<Documento> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.updateDocumentoWithFile(id, data, file);
      return result;
    } catch (err) {
      console.error('Error updating documento with file:', err);
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

  const downloadDocumento = async (id: number): Promise<Blob> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.downloadDocumento(id);
      return result;
    } catch (err) {
      console.error('Error downloading documento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const viewDocumento = async (id: number): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.viewDocumento(id);
      return result;
    } catch (err) {
      console.error('Error viewing documento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea un acuse en PDF cuando se crea una actividad
   * @param actividad - La actividad recién creada
   * @param usuarioId - ID del usuario que creó la actividad
   * @param entregaId - ID de la entrega asociada (debe existir en la BD)
   */
  const createActividadAcuse = async (actividad: Actividad, usuarioId: number, entregaId: number): Promise<Documento> => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentoService.createActividadAcuse(actividad, usuarioId, entregaId);
      return result;
    } catch (err) {
      console.error('Error creating actividad acuse:', err);
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
    updateDocumentoWithFile,
    deleteDocumento,
    uploadDocumentos,
    downloadDocumento,
    viewDocumento,
    createActividadAcuse,
  };
};