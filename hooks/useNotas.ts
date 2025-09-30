import { useState, useEffect } from 'react';
import { getNotas, createNota, updateNota, deleteNota } from '../lib/services/notaService';
import { Nota } from '../types/nota';
import { TipoActividad } from '../types/tipoActividad';

export const useNotas = () => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const data = await getNotas();
        setNotas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchNotas();
  }, []);

  const addNota = async (notaData: { nombre: string; nota: string; idUserCreate: number; idArea: number; tipoActividadId: number }, tipoActividad?: TipoActividad) => {
    try {
      const newNota = await createNota(notaData);
      if (tipoActividad) {
        newNota.tiposActividad = [tipoActividad];
      }
      setNotas(prev => [...prev, newNota]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create nota');
    }
  };

  const updateNotaState = async (id: number, notaData: { nombre: string; nota: string; idArea: number; tipoActividadId: number; idUserCreate: number }, newTipoActividad?: TipoActividad) => {
    try {
      const currentNota = notas.find(n => n.id === id);
      const updatedNota = await updateNota(id, notaData);
      // Update tiposActividad based on the new selection
      if (newTipoActividad) {
        updatedNota.tiposActividad = [newTipoActividad];
      } else if (!updatedNota.tiposActividad && currentNota) {
        updatedNota.tiposActividad = currentNota.tiposActividad;
      }
      setNotas(prev => prev.map(nota => nota.id === id ? updatedNota : nota));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update nota');
    }
  };

  const deleteNotaState = async (id: number) => {
    try {
      await deleteNota(id);
      setNotas(prev => prev.filter(nota => nota.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete nota');
    }
  };

  const handleCreateNote = async (newNote: { title: string; content: string; area: string; tipoActividad: string }, areas: any[], tipoActividades: TipoActividad[], setNewNote: (note: { title: string; content: string; area: string; tipoActividad: string }) => void, setIsDialogOpen: (open: boolean) => void) => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.area && newNote.tipoActividad) {
      const area = areas.find(a => a.name === newNote.area);
      const tipoActividad = tipoActividades.find(ta => ta.nombre === newNote.tipoActividad);
      if (area && tipoActividad) {
        try {
          await addNota({
            nombre: newNote.title,
            nota: newNote.content,
            idUserCreate: 1, // Assuming user id 1
            idArea: area.id,
            tipoActividadId: tipoActividad.id,
          }, tipoActividad);
          setNewNote({ title: "", content: "", area: "", tipoActividad: "" })
          setIsDialogOpen(false)
        } catch (err) {
          console.error('Failed to create note:', err);
        }
      }
    }
  };

  const handleEditNote = async (nota: Nota, newNote: { title: string; content: string; area: string; tipoActividad: string }, areas: any[], tipoActividades: TipoActividad[], setNewNote: (note: { title: string; content: string; area: string; tipoActividad: string }) => void, setIsEditDialogOpen: (open: boolean) => void) => {
    const area = areas.find(a => a.name === newNote.area);
    const tipoActividad = tipoActividades.find(ta => ta.nombre === newNote.tipoActividad);
    if (area) {
      try {
        await updateNotaState(nota.id, {
          nombre: newNote.title,
          nota: newNote.content,
          idArea: area.id,
          tipoActividadId: tipoActividad?.id || 0,
          idUserCreate: nota.userCreate.id,
        }, tipoActividad);
        setNewNote({ title: "", content: "", area: "", tipoActividad: "" })
        setIsEditDialogOpen(false)
      } catch (err) {
        console.error('Failed to edit note:', err);
      }
    }
  };

  return { notas, loading, error, addNota, handleCreateNote, handleEditNote, deleteNotaState };
};