"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, StickyNote, Edit, Trash2 } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  area: string
}

const areas = [
  "Desarrollo",
  "Marketing",
  "Ventas",
  "RRHH",
  "Finanzas",
  "Operaciones",
  "Soporte",
  "Calidad",
  "Investigación",
]

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Reunión de equipo",
    content: "Discutir los objetivos del próximo trimestre y asignar responsabilidades.",
    createdAt: "2024-01-15",
    area: "RRHH",
  },
  {
    id: "2",
    title: "Ideas para proyecto",
    content: "Implementar sistema de notificaciones push y mejorar la interfaz de usuario.",
    createdAt: "2024-02-14",
    area: "Desarrollo",
  },
  {
    id: "3",
    title: "Estrategia de marketing",
    content: "Revisar documentación de la nueva API antes de la implementación.",
    createdAt: "2024-03-13",
    area: "Marketing",
  },
  {
    id: "4",
    title: "Análisis de ventas",
    content: "Revisar las métricas del último trimestre.",
    createdAt: "2024-02-20",
    area: "Ventas",
  },
  {
    id: "5",
    title: "Reunión de directores",
    content: "Discutir los objetivos del próximo trimestre y asignar responsabilidades.",
    createdAt: "2024-01-15",
    area: "RRHH",
  },
  {
    id: "6",
    title: "Revision documentos",
    content: "Implementar sistema de notificaciones push y mejorar la interfaz de usuario.",
    createdAt: "2024-02-14",
    area: "Desarrollo",
  },
  {
    id: "7",
    title: "Reunion",
    content: "Revisar documentación de la nueva API antes de la implementación.",
    createdAt: "2024-03-13",
    area: "Marketing",
  },
  {
    id: "8",
    title: "Análisis de resultados",
    content: "Revisar las métricas del último trimestre.",
    createdAt: "2024-02-20",
    area: "Ventas",
  },
]

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState({ title: "", content: "", area: "" })
  const [selectedMonth, setSelectedMonth] = useState<string>("all")

  const getMonthFromDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  const getMonthName = (monthValue: string) => {
    if (monthValue === "all") return "Todos los meses"
    const [year, month] = monthValue.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const availableMonths = Array.from(new Set(notes.map((note) => getMonthFromDate(note.createdAt)))).sort((a, b) =>
    b.localeCompare(a),
  )

  const filteredNotes =
    selectedMonth === "all" ? notes : notes.filter((note) => getMonthFromDate(note.createdAt) === selectedMonth)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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

  const handleCreateNote = () => {
    if (newNote.title.trim() && newNote.content.trim() && newNote.area) {
      console.log("Nueva nota:", newNote)
      setNotes([...notes, { id: String(notes.length + 1), ...newNote, createdAt: new Date().toISOString() }])
      setNewNote({ title: "", content: "", area: "" })
      setIsDialogOpen(false)
    }
  }

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(notes.filter((note) => note.id !== noteId))
  }

  const handleEditNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    setNewNote({ title: note.title, content: note.content, area: note.area })
    setIsDialogOpen(true)
  }

  const handleCardClick = (note: Note) => {
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
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Nota</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título de la nota"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
                <Textarea
                  placeholder="Descripción de la nota..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="min-h-[100px]"
                />
                <Select value={newNote.area} onValueChange={(value) => setNewNote({ ...newNote, area: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreateNote} className="flex-1">
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
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
                <CardTitle className="text-lg line-clamp-2 mb-3">{note.title}</CardTitle>
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="outline" className={getAreaColor(note.area)}>
                    {note.area}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 bg-transparent"
                    onClick={(e) => handleEditNote(note, e)}
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

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Nota</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedNote.title}</h3>
                <Badge variant="outline" className={getAreaColor(selectedNote.area)}>
                  {selectedNote.area}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción:</h4>
                <p className="text-sm leading-relaxed">{selectedNote.content}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Fecha de creación:</h4>
                <p className="text-sm">{formatDate(selectedNote.createdAt)}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="flex-1">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
