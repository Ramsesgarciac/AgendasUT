import { useState, useEffect } from 'react';
import { getNotas, createNota, updateNota, deleteNota } from '../lib/services/notaService';
import { Nota } from '../types/nota';

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

  const addNota = async (notaData: { nombre: string; nota: string; idUserCreate: number; idArea: number; tipoActividadId: number }) => {
    try {
      const newNota = await createNota(notaData);
      setNotas(prev => [...prev, newNota]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create nota');
    }
  };

  const updateNotaState = async (id: number, notaData: { nombre: string; nota: string; idArea: number }) => {
    try {
      const updatedNota = await updateNota(id, notaData);
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

  const handleCreateNote = async (newNote: { title: string; content: string; area: string }, areas: any[], setNewNote: (note: { title: string; content: string; area: string }) => void, setIsDialogOpen: (open: boolean) => void) => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.area) {
      const area = areas.find(a => a.name === newNote.area);
      if (area) {
        try {
          await addNota({
            nombre: newNote.title,
            nota: newNote.content,
            idUserCreate: 1, // Assuming user id 1
            idArea: area.id,
            tipoActividadId: 1, // Assuming type id 1
          });
          setNewNote({ title: "", content: "", area: "" })
          setIsDialogOpen(false)
        } catch (err) {
          console.error('Failed to create note:', err);
        }
      }
    }
  };

  const handleEditNote = async (nota: Nota, newNote: { title: string; content: string; area: string }, areas: any[], setNewNote: (note: { title: string; content: string; area: string }) => void, setIsEditDialogOpen: (open: boolean) => void) => {
    const area = areas.find(a => a.name === newNote.area);
    if (area) {
      try {
        await updateNotaState(nota.id, {
          nombre: newNote.title,
          nota: newNote.content,
          idArea: area.id,
        });
        setNewNote({ title: "", content: "", area: "" })
        setIsEditDialogOpen(false)
      } catch (err) {
        console.error('Failed to edit note:', err);
      }
    }
  };

  return { notas, loading, error, addNota, handleCreateNote, handleEditNote, deleteNotaState };
};