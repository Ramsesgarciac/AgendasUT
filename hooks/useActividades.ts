import { useState, useEffect } from 'react';
import { getActividades } from '../lib/services/actividadService';
import { Actividad } from '../types/actividad';

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

  return { actividades, loading, error };
};