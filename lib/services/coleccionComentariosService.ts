import { ColeccionComentarios } from '../../types/coleccionComentarios';
import BaseService from './baseService';

class ColeccionComentariosService extends BaseService {
    private baseUrl = '/api/coleccion-comentario';

    async getColeccionComentarios(): Promise<ColeccionComentarios[]> {
        return this.fetchWithAuth(this.baseUrl);
    }

    async addComentariosToColeccion(id: number, comentarioIds: number[]): Promise<ColeccionComentarios> {
        return this.fetchWithAuth(`${this.baseUrl}/${id}/comentarios`, {
        method: 'PUT',
        body: JSON.stringify({ comentarioIds }),
        });
    }
}

export const coleccionComentariosService = new ColeccionComentariosService();
export const { getColeccionComentarios, addComentariosToColeccion } = coleccionComentariosService;