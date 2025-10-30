import { Status } from '../../types/status';
import BaseService from './baseService';

class StatusService extends BaseService {
  private baseUrl = '/api/status';

  getStatus = async (): Promise<Status[]> => {
    return this.fetchWithAuth(this.baseUrl);
  };
}

export const statusService = new StatusService();
export const { getStatus } = statusService;