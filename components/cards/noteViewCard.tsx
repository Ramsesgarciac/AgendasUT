import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Nota } from "@/types/nota"

interface NoteViewCardProps {
    selectedNote: Nota | null
    isViewDialogOpen: boolean
    setIsViewDialogOpen: (open: boolean) => void
    formatDate: (date: Date) => string
    getAreaColor: (area: string) => string
}

export function NoteViewCard({ selectedNote, isViewDialogOpen, setIsViewDialogOpen, formatDate, getAreaColor }: NoteViewCardProps) {
    return (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
            <DialogTitle>Detalles de la Nota</DialogTitle>
            </DialogHeader>
            {selectedNote && (
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedNote.nombre}</h3>
                    <div className="flex gap-2">
                        <Badge variant="outline" className={getAreaColor(selectedNote.area.name)}>
                            {selectedNote.area.name}
                        </Badge>
                        {Array.isArray(selectedNote.tiposActividad) ? selectedNote.tiposActividad.map((tipo) => (
                            <Badge key={tipo.id} variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                {tipo.nombre}
                            </Badge>
                        )) : null}
                    </div>
                </div>
                <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción:</h4>
                <p className="text-sm leading-relaxed">{selectedNote.nota}</p>
                </div>
                <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Fecha de creación:</h4>
                <p className="text-sm">{formatDate(selectedNote.fechaCreacion)}</p>
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
    )
}