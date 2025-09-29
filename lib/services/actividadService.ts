import { Actividad } from '../../types/actividad';

export const getActividades = async (): Promise<Actividad[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/actividades', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch actividades');
  }
  return response.json();
};