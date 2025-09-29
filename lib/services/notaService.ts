import { Nota } from '../../types/nota';

export const getNotas = async (): Promise<Nota[]> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/notas', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch notas');
  }
  const data = await response.json();
  return data.map((nota: any) => ({
    ...nota,
    fechaCreacion: new Date(nota.fechaCreacion),
    area: nota.area ? { ...nota.area, name: nota.area.nombre } : nota.area,
  }));
};

export const createNota = async (notaData: { nombre: string; nota: string; idUserCreate: number; idArea: number; tipoActividadId: number }): Promise<Nota> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/notas', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notaData),
  });
  if (!response.ok) {
    throw new Error('Failed to create nota');
  }
  const data = await response.json();
  return {
    ...data,
    fechaCreacion: new Date(data.fechaCreacion),
    area: data.area ? { ...data.area, name: data.area.nombre } : data.area,
  };
};

export const updateNota = async (id: number, notaData: { nombre: string; nota: string; idArea: number }): Promise<Nota> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`/api/notas/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notaData),
  });
  if (!response.ok) {
    throw new Error('Failed to update nota');
  }
  const data = await response.json();
  return {
    ...data,
    fechaCreacion: new Date(data.fechaCreacion),
    area: data.area ? { ...data.area, name: data.area.nombre } : data.area,
  };
};