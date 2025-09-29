import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Nota } from "@/types/nota"

interface NoteDeleteProps {
    nota: Nota | null
    isDeleteDialogOpen: boolean
    setIsDeleteDialogOpen: (open: boolean) => void
    onConfirmDelete: () => void
}

export function NoteDelete({ nota, isDeleteDialogOpen, setIsDeleteDialogOpen, onConfirmDelete }: NoteDeleteProps) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
            <p>¿Estás seguro de que quieres eliminar la nota "{nota?.nombre}"?</p>
            <div className="flex gap-2 pt-2">
                <Button onClick={onConfirmDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                Eliminar
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
                Cancelar
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    )
}