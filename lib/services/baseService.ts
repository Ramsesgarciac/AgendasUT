class BaseService {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
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

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export default BaseService;