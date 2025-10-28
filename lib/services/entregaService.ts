import { Entrega } from '../../types/entrega';

export const getEntregas = async (): Promise<Entrega[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/entrega', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch entregas');
  }
  const data = await response.json();
  return data;
};