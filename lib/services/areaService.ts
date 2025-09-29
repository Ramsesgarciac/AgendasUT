import { Area } from '../../types/area';

const colors: Area['color'][] = ['primary', 'secondary', 'accent', 'chart-4', 'chart-5'];

export const getAreas = async (): Promise<Area[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/area', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch areas');
  }
  const data = await response.json();
  return data.map((area: any, index: number) => ({
    id: area.id.toString(),
    name: area.nombre,
    activities: area.actividades || [],
    color: colors[index % colors.length],
  }));
};