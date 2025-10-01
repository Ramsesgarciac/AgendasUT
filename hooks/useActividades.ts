import { useState, useEffect } from 'react';
import { getActividades, createActividad } from '../lib/services/actividadService';
import { Actividad } from '../types/actividad';

interface CreateActividadData {
  asunto: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: string;
  idArea: number;
  idUserCreate: number;
  statusId: number;
  crearColeccionComentarios: boolean;
}

export const useActividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const data = await getActividades();
        setActividades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchActividades();
  }, []);

  const createActividadHandler = async (data: CreateActividadData): Promise<Actividad> => {
    try {
      const nuevaActividad = await createActividad(data);
      // Opcional: Actualizar el estado local
      setActividades(prev => [...prev, nuevaActividad]);
      return nuevaActividad;
    } catch (error) {
      console.error('Error creating actividad:', error);
      throw error;
    }
  };

  return {
    actividades,
    loading,
    error,
    createActividad: createActividadHandler
  };
};