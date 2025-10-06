import { Actividad } from '../../types/actividad';
import BaseService from './baseService';

class ActividadService extends BaseService {
  private baseUrl = '/api/actividades';

  getActividades = async (): Promise<Actividad[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };

  createActividad = async (data: {
    asunto: string;
    descripcion?: string;
    instanciaReceptora: string;
    instanciaEmisora: string;
    tipoActividad: string;
    fechaLimite: string;
    idArea: number;
    idUserCreate: number;
    statusId: number;
    crearColeccionComentarios: boolean;
  }): Promise<Actividad> => {
    return this.fetchWithAuth(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  updateActividad = async (id: number, data: {
    asunto: string;
    descripcion: string;
    instanciaReceptora: string;
    instanciaEmisora: string;
    tipoActividad: string;
    fechaLimite: string;
    idArea: number;
    statusId: number;
  }): Promise<Actividad> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };
}

export const actividadService = new ActividadService();
export const { getActividades, createActividad, updateActividad } = actividadService;