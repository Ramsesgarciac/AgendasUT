import { useState, useEffect, useCallback } from 'react';
import { actividadService } from '../lib/services/actividadService';
import { getTipoActividades } from '../lib/services/tipoActividadService';
import { documentoService } from '../lib/services/documentoService';
import { TipoActividad } from '../types/tipoActividad';
import { Actividad } from '../types/actividad';

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 50; // Actividades por página

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
      const actividadesResponse = await actividadService.getActividades(1, limit);
      setActividades(actividadesResponse.data);
      setTotalPages(actividadesResponse.meta.totalPages);
      setTotalItems(actividadesResponse.meta.total);
      setCurrentPage(actividadesResponse.meta.page);
      setHasMore(actividadesResponse.meta.page < actividadesResponse.meta.totalPages);
    } catch (err) {
      console.error('❌ Error refreshing actividades:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actividadesResponse, tipoActividadesData] = await Promise.all([
          actividadService.getActividades(1, limit), // Primera página
          getTipoActividades()
        ]);

        // Extraer datos y metadata de la respuesta paginada
        setActividades(actividadesResponse.data);
        setTotalPages(actividadesResponse.meta.totalPages);
        setTotalItems(actividadesResponse.meta.total);
        setCurrentPage(actividadesResponse.meta.page);
        setHasMore(actividadesResponse.meta.page < actividadesResponse.meta.totalPages);

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

    window.addEventListener('actividadStatusUpdated', handleActivityStatusUpdate as EventListener)

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
      if (typeof window !== 'undefined' && (window as any).unregisterActividadUpdateCallback) {
        (window as any).unregisterActividadUpdateCallback(handleActivityUpdateCallback)
      }
    }
  }, [refreshActividades])

  const createActividadHandler = async (data: CreateActividadData, entregaId?: number): Promise<Actividad> => {
    console.log('🚀 ========== INICIANDO CREACIÓN DE ACTIVIDAD ==========');
    console.log('📝 Data recibida:', data);
    console.log('📦 EntregaId recibido:', entregaId);

    try {
      // PASO 1: Crear la actividad
      console.log('📝 PASO 1: Creando actividad en la base de datos...');
      const nuevaActividad = await actividadService.createActividad(data);
      console.log('✅ Actividad creada exitosamente:', nuevaActividad);

      // PASO 2: Actualizar el estado local inmediatamente
      console.log('📊 PASO 2: Actualizando estado local...');
      setActividades(prev => [...prev, nuevaActividad]);
      console.log('✅ Estado local actualizado');


      console.log('🎉 ========== CREACIÓN COMPLETADA ==========');
      return nuevaActividad;

    } catch (error) {
      console.error('❌ ========== ERROR CRÍTICO EN CREACIÓN ==========');
      console.error('Error:', error);
      throw error;
    }
  };

  const updateActividadHandler = async (id: number, data: UpdateActividadData): Promise<Actividad> => {
    try {
      const actividadActualizada = await actividadService.updateActividad(id, data);
      // Actualizar el estado local
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

      console.log('📡 useActividades: Notified all callbacks about status update');
      return actividadActualizada;
    } catch (error) {
      console.error('❌ useActividades: Error updating actividad status:', error);
      throw error;
    }
  };

  // Function to load more activities (infinite scroll)
  const loadMoreActividades = useCallback(async () => {
    if (!hasMore || loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const actividadesResponse = await actividadService.getActividades(nextPage, limit);

      // Append new activities to existing ones
      setActividades(prev => [...prev, ...actividadesResponse.data]);
      setTotalPages(actividadesResponse.meta.totalPages);
      setTotalItems(actividadesResponse.meta.total);
      setCurrentPage(actividadesResponse.meta.page);
      setHasMore(actividadesResponse.meta.page < actividadesResponse.meta.totalPages);
    } catch (err) {
      console.error('❌ Error loading more actividades:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, limit]);

  return {
    actividades,
    tipoActividades,
    loading,
    loadingMore,
    error,
    // Pagination info
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    // Functions
    createActividad: createActividadHandler,
    updateActividad: updateActividadHandler,
    updateActividadStatus: updateActividadStatusHandler,
    getActividadById: getActividadByIdHandler,
    loadMoreActividades,
    registerUpdateCallback,
    unregisterUpdateCallback
  };
};