import { useState, useEffect } from 'react';
import { getColeccionComentarios, addComentariosToColeccion } from '../lib/services/coleccionComentariosService';
import { ColeccionComentarios } from '../types/coleccionComentarios';

export const useColeccionComentarios = () => {
    const [coleccionComentarios, setColeccionComentarios] = useState<ColeccionComentarios[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchColeccionComentarios = async () => {
        try {
            const data = await getColeccionComentarios();
            setColeccionComentarios(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
        };
        fetchColeccionComentarios();
    }, []);

    const addComentariosHandler = async (id: number, comentarioIds: number[]): Promise<ColeccionComentarios> => {
        try {
        const updatedColeccion = await addComentariosToColeccion(id, comentarioIds);
        // Opcional: Actualizar el estado local
        setColeccionComentarios(prev =>
            prev.map(col => col.id === id ? updatedColeccion : col)
        );
        return updatedColeccion;
        } catch (error) {
        console.error('Error adding comentarios to coleccion:', error);
        throw error;
        }
    };

    return {
        coleccionComentarios,
        loading,
        error,
        addComentariosToColeccion: addComentariosHandler
    };
};