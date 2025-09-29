"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, StickyNote, Edit, Trash2 } from "lucide-react"
import { useNotas } from '@/hooks/useNotas';
import { useMemo } from 'react';
import { NoteViewCard } from '@/components/cards/noteViewCard';
import { NoteCreate } from '@/components/cards/noteCreate';
import { NoteEdit } from '@/components/cards/noteEdit';
import { Nota } from '@/types/nota';
import { useAreas } from '@/hooks/useAreas';


export function Notes() {
  const { notas, handleCreateNote, handleEditNote } = useNotas();
  const { areas } = useAreas();
  const [notes, setNotes] = useState<Nota[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Nota | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", area: "" })
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  useEffect(() => {
    setNotes(notas)
  }, [notas])

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

  const filteredNotes =
    selectedMonth === "all" ? notes : notes.filter((note) => getMonthFromDate(note.fechaCreacion) === selectedMonth)

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

  const handleCreateNoteLocal = () => handleCreateNote(newNote, areas, setNewNote, setIsDialogOpen);

  const handleEditNoteLocal = () => {
    if (selectedNota) {
      handleEditNote(selectedNota, newNote, areas, setNewNote, setIsEditDialogOpen);
    }
  };

  const openEditDialog = (note: Nota, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNota(note);
    setNewNote({ title: note.nombre, content: note.nota, area: note.area.name });
    setIsEditDialogOpen(true);
  };

  const handleDeleteNote = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(notes.filter((note) => note.id !== noteId))
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
            <SelectTrigger className="w-full sm:w-48">
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
                  <Badge variant="outline" className={getAreaColor(note.area.name)}>
                    {note.area.name}
                  </Badge>
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
                    onClick={(e) => handleDeleteNote(note.id, e)}
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
            newNote={newNote}
            setNewNote={setNewNote}
            areas={areas}
            handleEditNoteLocal={handleEditNoteLocal}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
          />
        )}
      </Dialog>
    </div>
  )
}
