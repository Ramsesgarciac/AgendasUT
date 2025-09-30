import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Area } from "@/types/area"

interface NoteCreateProps {
  newNote: { title: string; content: string; area: string }
  setNewNote: (note: { title: string; content: string; area: string }) => void
  areas: Area[]
  handleCreateNoteLocal: () => void
  isDialogOpen: boolean
  setIsDialogOpen: (open: boolean) => void
}

export function NoteCreate({ newNote, setNewNote, areas, handleCreateNoteLocal, isDialogOpen, setIsDialogOpen }: NoteCreateProps) {
  return (
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

        <div className="flex gap-2 pt-2">
          <div className="flex-1">
            <Select value={newNote.area} onValueChange={(value) => setNewNote({ ...newNote, area: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={newNote.area} onValueChange={(value) => setNewNote({ ...newNote, area: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleCreateNoteLocal} className="flex-1">
            Guardar
          </Button>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
            Cancelar
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}