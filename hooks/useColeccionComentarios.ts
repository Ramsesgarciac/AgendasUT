import { useState, useEffect } from 'react';
import { coleccionComentariosService } from '../lib/services/coleccionComentariosService';
import { ColeccionComentarios } from '../types/coleccionComentarios';

export const useColeccionComentarios = () => {
  const [coleccionComentarios, setColeccionComentarios] = useState<ColeccionComentarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColeccionComentarios = async () => {
    try {
      const data = await coleccionComentariosService.getColeccionComentarios();
      setColeccionComentarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColeccionComentarios();
  }, []);

  const addComentariosHandler = async (id: number, comentarioIds: number[]): Promise<ColeccionComentarios> => {
    try {
      const updatedColeccion = await coleccionComentariosService.addComentariosToColeccion(id, comentarioIds);
      // Opcional: Actualizar el estado local
      setColeccionComentarios(prev =>
        prev.map(col => col.id === id ? updatedColeccion : col)
      );
      return updatedColeccion;
    } catch (error) {
      console.error('Error adding comentarios to coleccion:', error);
      throw error;
    }
  };

  return {
    coleccionComentarios,
    loading,
    error,
    refetch: fetchColeccionComentarios,
    addComentariosToColeccion: addComentariosHandler
  };
};