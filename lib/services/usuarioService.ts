import { Usuario } from '../../types/usuario';
import BaseService from './baseService';

class UsuarioService extends BaseService {
  private baseUrl = '/api/usuario';

  getUsuarios = async (): Promise<Usuario[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };
}

export const usuarioService = new UsuarioService();
export const { getUsuarios } = usuarioService;