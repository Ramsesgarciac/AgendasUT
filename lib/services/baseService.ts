class BaseService {
  // Cache en memoria para requests duplicados
  private static requestCache = new Map<string, {
    data: any;
    timestamp: number;
    promise?: Promise<any>;
  }>();
  
  private static CACHE_DURATION = 30000; // 30 segundos

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
      : null;
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // Limpia cache expirado
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of BaseService.requestCache.entries()) {
      if (now - value.timestamp > BaseService.CACHE_DURATION) {
        BaseService.requestCache.delete(key);
      }
    }
  }

  protected async fetchWithAuth(url: string, options: RequestInit = {}) {
    const baseHeaders = this.getAuthHeaders();
    const headers: Record<string, string> = {
      ...(baseHeaders as Record<string, string>),
      ...(options.headers as Record<string, string>),
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const method = options.method || 'GET';
    const cacheKey = `${method}:${url}`;

    // Solo cachear GET requests
    if (method === 'GET') {
      this.cleanExpiredCache();

      // Si hay un request en progreso, retornar la misma promesa
      const cached = BaseService.requestCache.get(cacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        
        // Si el request está en progreso, esperar
        if (cached.promise) {
          return cached.promise;
        }
        
        // Si está en cache y no expiró, retornar data cacheada
        if (age < BaseService.CACHE_DURATION) {
          console.log(`✓ Cache hit: ${url} (${Math.round(age/1000)}s old)`);
          return cached.data;
        }
      }

      // Crear nueva promesa y cachearla inmediatamente
      const requestPromise = this.executeRequest(url, { ...options, headers });
      
      BaseService.requestCache.set(cacheKey, {
        data: null,
        timestamp: Date.now(),
        promise: requestPromise
      });

      try {
        const data = await requestPromise;
        
        // Guardar resultado en cache
        BaseService.requestCache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        
        return data;
      } catch (error) {
        // Remover del cache en caso de error
        BaseService.requestCache.delete(cacheKey);
        throw error;
      }
    }

    // POST, PUT, DELETE: no cachear, invalidar cache relacionado
    if (method !== 'GET') {
      // Invalidar cache relacionado
      const baseUrl = url.split('?')[0].split('/').slice(0, -1).join('/');
      for (const key of BaseService.requestCache.keys()) {
        if (key.includes(baseUrl)) {
          BaseService.requestCache.delete(key);
        }
      }
    }

    return this.executeRequest(url, { ...options, headers });
  }

  private async executeRequest(url: string, options: RequestInit) {
    const response = await fetch(url, {
      ...options,
      // Deshabilitar cache para evitar problemas con respuestas API
      cache: 'no-cache',
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        // Ignore
      }
      throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
    }

    return response.json();
  }

  protected async fetchWithoutAuth(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  protected async fetchWithAuthBlob(url: string, options: RequestInit = {}): Promise<Response> {
    const baseHeaders = this.getAuthHeaders();
    const headers: Record<string, string> = {
      ...(baseHeaders as Record<string, string>),
      ...(options.headers as Record<string, string>),
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    return fetch(url, {
      ...options,
      headers,
      cache: 'no-cache',
    });
  }

  // Método para limpiar cache manualmente
  public static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of BaseService.requestCache.keys()) {
        if (key.includes(pattern)) {
          BaseService.requestCache.delete(key);
        }
      }
    } else {
      BaseService.requestCache.clear();
    }
  }
}

export default BaseService;