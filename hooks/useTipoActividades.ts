import { useTipoActividadesContext } from '../lib/contexts/TipoActividadContext';

// Este hook ahora usa el contexto global para evitar múltiples peticiones
export const useTipoActividades = () => {
  return useTipoActividadesContext();
};
