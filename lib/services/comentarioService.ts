import { Comentario } from '../../types/comentario';
import BaseService from './baseService';

class ComentarioService extends BaseService {
    private baseUrl = '/api/comentarios';

    async getComentarios(): Promise<Comentario[]> {
        return this.fetchWithAuth(this.baseUrl);
    }

    async createComentario(data: {
        contenido: string;
        idActividad: number;
        idUsuario: number;
        idColeccion?: number;
    }): Promise<Comentario> {
        return this.fetchWithAuth(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        });
    }
}

export const comentarioService = new ComentarioService();
export const { getComentarios, createComentario } = comentarioService;