import { useState, useEffect } from 'react';
import { getUsuarios } from '../lib/services/usuarioService';
import { Usuario } from '../types/usuario';

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsuarios = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchUsuarios();
    }, []);

    return { usuarios, loading, error };
};