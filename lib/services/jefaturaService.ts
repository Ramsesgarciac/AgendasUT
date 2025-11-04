import { Jefatura } from '../../types/jefatura';

export const getJefaturas = async (): Promise<Jefatura[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('http://localhost:3001/jefatura', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch jefaturas');
  }
  const data = await response.json();
  return data;
};