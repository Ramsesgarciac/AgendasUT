import { useState, useEffect } from 'react';
import { getTipoActividades } from '../lib/services/tipoActividadService';
import { TipoActividad } from '../types/tipoActividad';

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

  return { tipoActividades, loading, error };
};