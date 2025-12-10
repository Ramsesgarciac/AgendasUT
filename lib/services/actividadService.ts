import { Actividad } from '../../types/actividad';
import BaseService from './baseService';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ActividadService extends BaseService {
  private baseUrl = '/api/actividades';

  getActividades = async (page: number = 1, limit: number = 50): Promise<PaginatedResponse<Actividad>> => {
    const url = `${this.baseUrl}?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(url);
  };

  getActividadById = async (id: number): Promise<Actividad> => {
    return this.fetchWithAuth(`${this.baseUrl}/${id}`);
  };

  getActividadesByArea = async (areaId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Actividad>> => {
    const url = `${this.baseUrl}/area/${areaId}?page=${page}&limit=${limit}`;
    return this.fetchWithAuth(url);
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

  updateActividadStatus = async (actividadId: number, statusId: number): Promise<Actividad> => {
    return this.fetchWithAuth(`${this.baseUrl}/${actividadId}/status/${statusId}`, {
      method: 'PATCH',
    });
  };
}

export const actividadService = new ActividadService();
export const { getActividades, getActividadById, createActividad, updateActividad, updateActividadStatus } = actividadService;