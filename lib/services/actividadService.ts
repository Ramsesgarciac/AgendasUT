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

export const createActividad = async (data: {
  asunto: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: string;
  idArea: number;
  idUserCreate: number;
  statusId: number;
  crearColeccionComentarios: boolean;
}): Promise<Actividad> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch('/api/actividades', {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create actividad');
  }
  return response.json();
};