import { TipoArea } from '../../types/tipoArea';

export const getTipoAreas = async (): Promise<TipoArea[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/tipo-area', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch tipo areas');
  }
  const data = await response.json();
  return data.map((tipoArea: any) => ({
    id: tipoArea.id,
    nombre: tipoArea.nombre,
    areas: tipoArea.areas || [],
  }));
};