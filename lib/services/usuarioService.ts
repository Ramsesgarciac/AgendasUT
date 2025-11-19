import { Usuario } from '../../types/usuario';
import BaseService from './baseService';

interface LoginRequest {
  email: string;
  contraseña: string;
}

interface LoginResponse {
  message: string;
  usuario: Usuario;
  access_token: string;
}

class UsuarioService extends BaseService {
  private baseUrl = '/api/usuario';
  private authUrl = 'http://localhost:3001/auth/login';

  getUsuarios = async (): Promise<Usuario[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };

  login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    return this.fetchWithoutAuth(this.authUrl, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  };
}

export const usuarioService = new UsuarioService();
export const { getUsuarios, login } = usuarioService;