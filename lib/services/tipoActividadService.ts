import { TipoActividad } from '../../types/tipoActividad';

export const getTipoActividades = async (): Promise<TipoActividad[]> => {
  const response = await fetch('http://localhost:3001/tipo-actividad');
  if (!response.ok) {
    throw new Error('Failed to fetch tipo actividades');
  }
  return await response.json();
};