    import { useState, useEffect } from 'react';
    import { comentarioService } from '../lib/services/comentarioService';
    import { Comentario } from '../types/comentario';

    interface CreateComentarioData {
    contenido: string;
    idActividad: number;
    idUsuario: number;
    idColeccion?: number;
    }

    export const useComentarios = () => {
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchComentarios = async () => {
        try {
          const data = await comentarioService.getComentarios();
          setComentarios(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      };
      fetchComentarios();
    }, []);
  
    const createComentarioHandler = async (data: CreateComentarioData): Promise<Comentario> => {
      try {
        const nuevoComentario = await comentarioService.createComentario(data);
        // Opcional: Actualizar el estado local
        setComentarios(prev => [...prev, nuevoComentario]);
        return nuevoComentario;
      } catch (error) {
        console.error('Error creating comentario:', error);
        throw error;
      }
    };

    return {
        comentarios,
        loading,
        error,
        createComentario: createComentarioHandler
    };
    };