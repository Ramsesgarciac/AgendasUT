import { useState, useEffect } from 'react';
import { getEntregas } from '../lib/services/entregaService';
import { Entrega } from '../types/entrega';

export const useEntregas = () => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntregas = async () => {
      try {
        setLoading(true);
        const data = await getEntregas();
        setEntregas(data);
      } catch (err) {
        console.error('Error fetching entregas:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchEntregas();
  }, []);

  return {
    entregas,
    loading,
    error,
  };
};