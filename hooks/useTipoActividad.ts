import { useState, useEffect } from 'react';
import { getTipoActividades } from '../lib/services/tipoActividadService';
import { createActividad } from '../lib/services/actividadService';
import { TipoActividad } from '../types/tipoActividad';
import { Actividad } from '../types/actividad';

export const useTipoActividad = () => {
  const [tipoActividades, setTipoActividades] = useState<TipoActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching tipo actividades...');
        const data = await getTipoActividades();
        console.log('Tipo actividades data:', data);
        setTipoActividades(data);
      } catch (err) {
        console.error('Error fetching tipo actividades:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const createActividadHandler = async (data: {
    asunto: string;
    instanciaReceptora: string;
    instanciaEmisora: string;
    tipoActividad: string;
    fechaLimite: string;
    idArea: number;
    idUserCreate: number;
    statusId: number;
    crearColeccionComentarios: boolean;
  }): Promise<Actividad> => {
    return await createActividad(data);
  };

  return { tipoActividades, loading, error, createActividad: createActividadHandler };
};