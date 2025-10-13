import { useState, useEffect } from 'react';
import { actividadService } from '../lib/services/actividadService';
import { getTipoActividades } from '../lib/services/tipoActividadService';
import { TipoActividad } from '../types/tipoActividad';
import { Actividad } from '../types/actividad';

interface CreateActividadData {
  asunto: string;
  descripcion?: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: string;
  idArea: number;
  idUserCreate: number;
  statusId: number;
  crearColeccionComentarios: boolean;
}

interface UpdateActividadData {
  asunto: string;
  descripcion: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: string;
  idArea: number;
  statusId: number;
}

export const useActividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [tipoActividades, setTipoActividades] = useState<TipoActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actividadesData, tipoActividadesData] = await Promise.all([
          actividadService.getActividades(),
          getTipoActividades()
        ]);

        setActividades(actividadesData);
        setTipoActividades(tipoActividadesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createActividadHandler = async (data: CreateActividadData): Promise<Actividad> => {
    try {
      const nuevaActividad = await actividadService.createActividad(data);
      // Opcional: Actualizar el estado local
      setActividades(prev => [...prev, nuevaActividad]);
      return nuevaActividad;
    } catch (error) {
      console.error('Error creating actividad:', error);
      throw error;
    }
  };

  const updateActividadHandler = async (id: number, data: UpdateActividadData): Promise<Actividad> => {
    try {
      const actividadActualizada = await actividadService.updateActividad(id, data);
      // Opcional: Actualizar el estado local
      setActividades(prev => prev.map(act => act.id === id ? actividadActualizada : act));
      return actividadActualizada;
    } catch (error) {
      console.error('Error updating actividad:', error);
      throw error;
    }
  };

  const getActividadByIdHandler = async (id: number): Promise<Actividad> => {
    try {
      return await actividadService.getActividadById(id);
    } catch (error) {
      console.error('Error fetching actividad by id:', error);
      throw error;
    }
  };

  return {
    actividades,
    tipoActividades,
    loading,
    error,
    createActividad: createActividadHandler,
    updateActividad: updateActividadHandler,
    getActividadById: getActividadByIdHandler
  };
};