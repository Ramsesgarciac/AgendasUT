import { useState, useEffect, useCallback } from 'react';
import { actividadService } from '../lib/services/actividadService';
import { getTipoActividades } from '../lib/services/tipoActividadService';
import { TipoActividad } from '../types/tipoActividad';
import { Actividad } from '../types/actividad';
import { useWebSocket } from './useWebSocket';

interface CreateActividadData {
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
}

interface UpdateActividadData {
  asunto: string;
  descripcion: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: string;
  idArea: number;
  statusId: number;
}

export const useActividades = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [tipoActividades, setTipoActividades] = useState<TipoActividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const { sendMessage } = useWebSocket('ws://localhost:8080');

  // Callback to notify parent components of updates - use global system
  const [updateCallbacks, setUpdateCallbacks] = useState<Set<Function>>(new Set());

  // Initialize global callback system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!(window as any).registerActividadUpdateCallback) {
        (window as any).registerActividadUpdateCallback = (callback: Function) => {
          if (!(window as any).updateCallbacks) {
            (window as any).updateCallbacks = new Set();
          }
          (window as any).updateCallbacks.add(callback);
        };
        (window as any).unregisterActividadUpdateCallback = (callback: Function) => {
          if ((window as any).updateCallbacks) {
            (window as any).updateCallbacks.delete(callback);
          }
        };
      }
    }
  }, []);

  const registerUpdateCallback = useCallback((callback: Function) => {
    setUpdateCallbacks(prev => new Set([...prev, callback]));

    // Also register globally
    if (typeof window !== 'undefined') {
      (window as any).registerActividadUpdateCallback?.(callback);
    }
  }, []);

  const unregisterUpdateCallback = useCallback((callback: Function) => {
    setUpdateCallbacks(prev => {
      const newSet = new Set(prev);
      newSet.delete(callback);
      return newSet;
    });

    // Also unregister globally
    if (typeof window !== 'undefined') {
      (window as any).unregisterActividadUpdateCallback?.(callback);
    }
  }, []);

  const notifyUpdateCallbacks = (payload: any) => {
    // Notify local callbacks
    updateCallbacks.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in local update callback:', error);
      }
    });
    
    // Notify global callbacks
    if (typeof window !== 'undefined' && (window as any).updateCallbacks) {
      (window as any).updateCallbacks.forEach((callback: Function) => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in global update callback:', error);
        }
      });
    }
  };

  // Function to refresh activities data
  const refreshActividades = useCallback(async () => {
    try {
      console.log('🔄 useActividades: Refreshing activities data...')
      const actividadesData = await actividadService.getActividades();
      setActividades(actividadesData);
      console.log('✅ useActividades: Activities data refreshed')
    } catch (err) {
      console.error('❌ Error refreshing actividades:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actividadesData, tipoActividadesData] = await Promise.all([
          actividadService.getActividades(),
          getTipoActividades()
        ]);

        setActividades(actividadesData);
        setTipoActividades(tipoActividadesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Listen for status updates to refresh activities automatically
  useEffect(() => {
    const handleActivityStatusUpdate = (event: CustomEvent) => {
      const { actividadId } = event.detail
      console.log('🔄 useActividades: Status update detected, refreshing activities:', actividadId)
      // Refresh activities after a short delay to ensure backend has processed the update
      setTimeout(() => {
        refreshActividades()
      }, 300)
    }

    const handleActivityUpdateCallback = (payload: any) => {
      if (payload.type === 'STATUS_UPDATE') {
        console.log('🔄 useActividades: Status update via callback, refreshing activities:', payload.actividadId)
        setTimeout(() => {
          refreshActividades()
        }, 300)
      }
    }

    const handleWebSocketStatusUpdate = (event: CustomEvent) => {
      const { actividadId, statusId, actividad } = event.detail;
      console.log('🔄 useActividades: Status update via WebSocket:', actividadId, statusId);
      // Update local state immediately
      setActividades(prev => prev.map(act => act.id === actividadId ? actividad : act));
    };

    window.addEventListener('actividadStatusUpdated', handleActivityStatusUpdate as EventListener)
    window.addEventListener('wsStatusUpdate', handleWebSocketStatusUpdate as EventListener)

    // Register for global callback system
    if (typeof window !== 'undefined') {
      if (!(window as any).registerActividadUpdateCallback) {
        (window as any).registerActividadUpdateCallback = (callback: Function) => {
          if (!(window as any).updateCallbacks) {
            (window as any).updateCallbacks = new Set()
          }
          (window as any).updateCallbacks.add(callback)
        }
        (window as any).unregisterActividadUpdateCallback = (callback: Function) => {
          if ((window as any).updateCallbacks) {
            (window as any).updateCallbacks.delete(callback)
          }
        }
      }
      (window as any).registerActividadUpdateCallback(handleActivityUpdateCallback)
    }

    return () => {
      window.removeEventListener('actividadStatusUpdated', handleActivityStatusUpdate as EventListener)
      window.removeEventListener('wsStatusUpdate', handleWebSocketStatusUpdate as EventListener)
      if (typeof window !== 'undefined' && (window as any).unregisterActividadUpdateCallback) {
        (window as any).unregisterActividadUpdateCallback(handleActivityUpdateCallback)
      }
    }
  }, [refreshActividades])

  const createActividadHandler = async (data: CreateActividadData): Promise<Actividad> => {
    try {
      const nuevaActividad = await actividadService.createActividad(data);
      // Opcional: Actualizar el estado local
      setActividades(prev => [...prev, nuevaActividad]);
      return nuevaActividad;
    } catch (error) {
      console.error('Error creating actividad:', error);
      throw error;
    }
  };

  const updateActividadHandler = async (id: number, data: UpdateActividadData): Promise<Actividad> => {
    try {
      const actividadActualizada = await actividadService.updateActividad(id, data);
      // Opcional: Actualizar el estado local
      setActividades(prev => prev.map(act => act.id === id ? actividadActualizada : act));
      return actividadActualizada;
    } catch (error) {
      console.error('Error updating actividad:', error);
      throw error;
    }
  };

  const getActividadByIdHandler = async (id: number): Promise<Actividad> => {
    try {
      return await actividadService.getActividadById(id);
    } catch (error) {
      console.error('Error fetching actividad by id:', error);
      throw error;
    }
  };

  const updateActividadStatusHandler = async (actividadId: number, statusId: number): Promise<Actividad> => {
    try {
      console.log('🔄 useActividades: Starting status update for activity:', actividadId, 'to status:', statusId);
      
      const actividadActualizada = await actividadService.updateActividadStatus(actividadId, statusId);
      console.log('✅ useActividades: Received updated activity:', actividadActualizada);
      
      // Update the local state immediately
      setActividades(prev => {
        const newActividades = prev.map(act => act.id === actividadId ? actividadActualizada : act);
        console.log('🎯 useActividades: Updated local state with new activities');
        return newActividades;
      });

      // Notify all registered callbacks immediately
      notifyUpdateCallbacks({ type: 'STATUS_UPDATE', actividadId, statusId, actividad: actividadActualizada });

      // Send WebSocket message for real-time updates
      sendMessage({
        type: 'STATUS_UPDATE',
        actividadId,
        statusId,
        actividad: actividadActualizada,
        timestamp: Date.now()
      });

      console.log('📡 useActividades: Notified all callbacks and sent WebSocket message about status update');
      return actividadActualizada;
    } catch (error) {
      console.error('❌ useActividades: Error updating actividad status:', error);
      throw error;
    }
  };

  return {
    actividades,
    tipoActividades,
    loading,
    error,
    createActividad: createActividadHandler,
    updateActividad: updateActividadHandler,
    updateActividadStatus: updateActividadStatusHandler,
    getActividadById: getActividadByIdHandler,
    registerUpdateCallback,
    unregisterUpdateCallback
  };
};