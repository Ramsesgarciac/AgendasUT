import { TipoActividad } from '../../types/tipoActividad';

export const getTipoActividades = async (): Promise<TipoActividad[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/tipo-actividad', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  console.log('Response status:', response.status);
  if (!response.ok) {
    throw new Error('Failed to fetch tipo actividades');
  }
  const data = await response.json();
  console.log('Fetched data:', data);
  return data;
};