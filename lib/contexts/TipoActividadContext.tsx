"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TipoActividad } from '@/types/tipoActividad';
import { getTipoActividades } from '@/lib/services/tipoActividadService';

interface TipoActividadContextType {
    tipoActividades: TipoActividad[];
    loading: boolean;
    error: string | null;
}

const TipoActividadContext = createContext<TipoActividadContextType | undefined>(undefined);

export const useTipoActividadesContext = () => {
    const context = useContext(TipoActividadContext);
    if (context === undefined) {
        throw new Error('useTipoActividadesContext must be used within a TipoActividadProvider');
    }
    return context;
};

interface TipoActividadProviderProps {
    children: ReactNode;
}

export const TipoActividadProvider: React.FC<TipoActividadProviderProps> = ({ children }) => {
    const [tipoActividades, setTipoActividades] = useState<TipoActividad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Solo intentar cargar si hay un token
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getTipoActividades();
                setTipoActividades(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching tipo actividades:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Escuchar cambios en el storage (cuando el usuario se loguea)
        const handleStorageChange = () => {
            fetchData();
        };

        window.addEventListener('storage', handleStorageChange);

        // También escuchar un evento personalizado para login
        window.addEventListener('user-logged-in', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('user-logged-in', handleStorageChange);
        };
    }, []);

    const value: TipoActividadContextType = {
        tipoActividades,
        loading,
        error,
    };

    return <TipoActividadContext.Provider value={value}>{children}</TipoActividadContext.Provider>;
};
