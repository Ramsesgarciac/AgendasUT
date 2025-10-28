import { Jefatura } from '../../types/jefatura';
import BaseService from './baseService';

class JefaturaService extends BaseService {
    // Usa la URL directa del backend
    private baseUrl = 'http://localhost:3001/jefatura';

    async getJefaturas(): Promise<Jefatura[]> {
        return this.fetchWithAuth(this.baseUrl);
    }

    async createJefatura(data: {
        nombre: string;
        areaId: number;
    }): Promise<Jefatura> {
        return this.fetchWithAuth(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateJefatura(id: number, data: {
        nombre?: string;
        areaId?: number;
    }): Promise<Jefatura> {
        return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteJefatura(id: number): Promise<void> {
        return this.fetchWithAuth(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
        });
    }
}

// Crear una instancia única del servicio
const jefaturaServiceInstance = new JefaturaService();

// Exportar los métodos vinculados a la instancia
export const getJefaturas = () => jefaturaServiceInstance.getJefaturas();
export const createJefatura = (data: { nombre: string; areaId: number }) => 
    jefaturaServiceInstance.createJefatura(data);
export const updateJefatura = (id: number, data: { nombre?: string; areaId?: number }) => 
    jefaturaServiceInstance.updateJefatura(id, data);
export const deleteJefatura = (id: number) => 
    jefaturaServiceInstance.deleteJefatura(id);

// También exportar la instancia por si se necesita
export default jefaturaServiceInstance;