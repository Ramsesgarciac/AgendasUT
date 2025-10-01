"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, StickyNote, Edit, Trash2, ChevronDown } from "lucide-react"
import { useNotas } from '@/hooks/useNotas';
import { useMemo } from 'react';
import { NoteViewCard } from '@/components/cards/noteViewCard';
import { NoteCreate } from '@/components/cards/noteCreate';
import { NoteEdit } from '@/components/cards/noteEdit';
import { NoteDelete } from '@/components/cards/noteDelete';
import { Nota } from '@/types/nota';
import { useAreas } from '@/hooks/useAreas';
import { useTipoActividad } from '@/hooks/useTipoActividad';

export function Notes() {
  const { notas, handleCreateNote, handleEditNote, deleteNotaState } = useNotas();
  const { areas } = useAreas();
  const { tipoActividades } = useTipoActividad();
  const [notes, setNotes] = useState<Nota[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Nota | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [notaToDelete, setNotaToDelete] = useState<Nota | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", area: "", tipoActividad: "" })
  const [editNote, setEditNote] = useState({ title: "", content: "", area: "", tipoActividad: "" })
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedTipoActividadIds, setSelectedTipoActividadIds] = useState<number[]>([])

  const fixedNotas = useMemo(() => notas.map(nota => ({ ...nota, area: areas.find(a => a.id === nota.area.id) || nota.area })), [notas, areas])

  useEffect(() => {
    setNotes(fixedNotas)
  }, [fixedNotas])

  useEffect(() => {
    if (tipoActividades.length > 0) {
      setSelectedTipoActividadIds(tipoActividades.map(ta => ta.id))
    }
  }, [tipoActividades])

  const getMonthFromDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  const getMonthName = (monthValue: string) => {
    if (monthValue === "all") return "Todos los meses"
    const [year, month] = monthValue.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const availableMonths = Array.from(new Set(notes.map((note) => getMonthFromDate(note.fechaCreacion)))).sort((a, b) =>
    b.localeCompare(a),
  )

  const filteredNotes = notes
    .filter((note) => selectedMonth === "all" || getMonthFromDate(note.fechaCreacion) === selectedMonth)
    .filter((note) => selectedTipoActividadIds.length > 0 && Array.isArray(note.tiposActividad) && note.tiposActividad.some((ta) => selectedTipoActividadIds.includes(ta.id)))

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getAreaColor = (area: string) => {
    const colors = {
      Desarrollo: "bg-blue-100 text-blue-800 border-blue-200",
      Marketing: "bg-green-100 text-green-800 border-green-200",
      Ventas: "bg-purple-100 text-purple-800 border-purple-200",
      RRHH: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Finanzas: "bg-red-100 text-red-800 border-red-200",
      Operaciones: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Soporte: "bg-pink-100 text-pink-800 border-pink-200",
      Calidad: "bg-teal-100 text-teal-800 border-teal-200",
      Investigación: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[area as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleCreateNoteLocal = () => handleCreateNote(newNote, areas, tipoActividades, setNewNote, setIsDialogOpen);

  const handleTipoActividadToggle = (id: number) => {
    setSelectedTipoActividadIds((prev) => (prev.includes(id) ? prev.filter((tipoId) => tipoId !== id) : [...prev, id]))
  }

  const handleSelectAllTipo = () => {
    setSelectedTipoActividadIds(tipoActividades.map(ta => ta.id))
  }

  const handleClearAllTipo = () => {
    setSelectedTipoActividadIds([])
  }

  const getSelectedTipoText = () => {
    if (selectedTipoActividadIds.length === 0) return "Ningún tipo seleccionado"
    if (selectedTipoActividadIds.length === tipoActividades.length) return "Todos los tipos"
    if (selectedTipoActividadIds.length === 1) {
      const tipo = tipoActividades.find((ta) => ta.id === selectedTipoActividadIds[0])
      return tipo?.nombre || ""
    }
    return `${selectedTipoActividadIds.length} tipos seleccionados`
  }

  const handleEditNoteLocal = () => {
    if (selectedNota) {
      handleEditNote(selectedNota, editNote, areas, tipoActividades, setEditNote, setIsEditDialogOpen);
    }
  };

  const openEditDialog = (note: Nota, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNota(note);
    setEditNote({ title: note.nombre, content: note.nota, area: note.area.name, tipoActividad: (Array.isArray(note.tiposActividad) ? note.tiposActividad[0]?.nombre : "") || "" });
    setIsEditDialogOpen(true);
  };

  const handleDeleteNote = (nota: Nota, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotaToDelete(nota)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (notaToDelete) {
      await deleteNotaState(notaToDelete.id)
      setIsDeleteDialogOpen(false)
      setNotaToDelete(null)
    }
  }

  const handleCardClick = (note: Nota) => {
    setSelectedNote(note)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mis Notas</h2>
          <p className="text-muted-foreground">Organiza tus ideas y recordatorios</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-48 border border-border bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md font-medium">
              <SelectValue placeholder="Filtrar por mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[250px] justify-between bg-transparent">
                <span className="truncate">{getSelectedTipoText()}</span>
                <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="end">
              <div className="p-3 border-b border-border">
                <div className="flex justify-between items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAllTipo} className="text-xs">
                    Seleccionar todos
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClearAllTipo} className="text-xs">
                    Limpiar
                  </Button>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {tipoActividades.map((tipo) => (
                  <div
                    key={tipo.id}
                    className="flex items-center space-x-2 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleTipoActividadToggle(tipo.id)}
                  >
                    <Checkbox
                      checked={selectedTipoActividadIds.includes(tipo.id)}
                      onChange={() => handleTipoActividadToggle(tipo.id)}
                    />
                    <span className="text-sm flex-1">{tipo.nombre}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Nota
              </Button>
            </DialogTrigger>
            <NoteCreate
              newNote={newNote}
              setNewNote={setNewNote}
              areas={areas}
              tipoActividades={tipoActividades}
              handleCreateNoteLocal={handleCreateNoteLocal}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />
          </Dialog>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <StickyNote className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No hay notas</h3>
          <p className="text-sm text-muted-foreground">
            {selectedMonth === "all" ? "Crea tu primera nota para comenzar" : "No hay notas para este mes"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => handleCardClick(note)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2 mb-3">{note.nombre}</CardTitle>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getAreaColor(note.area.name)}>
                      {note.area.name}
                    </Badge>
                    {Array.isArray(note.tiposActividad) && note.tiposActividad.length > 0 && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        {note.tiposActividad[0].nombre}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(note.fechaCreacion)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 bg-transparent"
                    onClick={(e) => openEditDialog(note, e)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={(e) => handleDeleteNote(note, e)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <NoteViewCard
        selectedNote={selectedNote}
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        formatDate={formatDate}
        getAreaColor={getAreaColor}
      />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedNota && (
          <NoteEdit
            nota={selectedNota}
            newNote={editNote}
            setNewNote={setEditNote}
            areas={areas}
            tipoActividades={tipoActividades}
            handleEditNoteLocal={handleEditNoteLocal}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
          />
        )}
      </Dialog>

      <NoteDelete
        nota={notaToDelete}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </div>
  )
}
