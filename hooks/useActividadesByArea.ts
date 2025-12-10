import { useState, useCallback, useEffect } from 'react';
import { actividadService } from '../lib/services/actividadService';
import { Actividad } from '../types/actividad';

interface UseActividadesByAreaResult {
    actividades: Actividad[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

export const useActividadesByArea = (areaId: number, initialLimit: number = 10): UseActividadesByAreaResult => {
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // Función para cargar actividades (primera carga o refresh)
    const loadActividades = useCallback(async (page: number = 1, append: boolean = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await actividadService.getActividadesByArea(areaId, page, initialLimit);

            if (append) {
                setActividades(prev => [...prev, ...response.data]);
            } else {
                setActividades(response.data);
            }

            setCurrentPage(response.meta.page);
            setTotalPages(response.meta.totalPages);
            setTotalItems(response.meta.total);
            setHasMore(response.meta.page < response.meta.totalPages);
            setError(null);
        } catch (err) {
            console.error(`Error loading activities for area ${areaId}:`, err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [areaId, initialLimit]);

    // Función para cargar más actividades
    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore) return;
        await loadActividades(currentPage + 1, true);
    }, [hasMore, loadingMore, currentPage, loadActividades]);

    // Función para refrescar (volver a la primera página)
    const refresh = useCallback(async () => {
        await loadActividades(1, false);
    }, [loadActividades]);

    // Cargar automáticamente al montar
    useEffect(() => {
        loadActividades(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [areaId]); // Solo recargar si cambia el areaId

    return {
        actividades,
        loading,
        loadingMore,
        error,
        currentPage,
        totalPages,
        totalItems,
        hasMore,
        loadMore,
        refresh
    };
};
