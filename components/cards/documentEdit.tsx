"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDocumentos } from "@/hooks/useDocumentos"
import { Documento } from "@/types/documento"
import { Save, X } from "lucide-react"

interface DocumentEditProps {
  documento: Documento | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentEdit({ documento, isOpen, onClose, onSuccess }: DocumentEditProps) {
  const { updateDocumentoWithFile, loading, error } = useDocumentos()
  const [formData, setFormData] = useState({
    nombre: "",
    tipoDoc: "",
    archivo: null as File | null
  })

  useEffect(() => {
    if (documento) {
      setFormData({
        nombre: documento.nombre,
        tipoDoc: documento.tipoDoc,
        archivo: null
      })
    }
  }, [documento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documento) return

    try {
      await updateDocumentoWithFile(documento.id, {
        nombre: formData.nombre,
        tipoDoc: formData.tipoDoc
      }, formData.archivo || undefined)

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error("Error updating documento:", err)
    }
  }

  const handleClose = () => {
    setFormData({ nombre: "", tipoDoc: "", archivo: null })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Documento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre del documento"
              required
            />
          </div>

          <div>
            <Label htmlFor="tipoDoc">Tipo de Documento</Label>
            <Input
              id="tipoDoc"
              value={formData.tipoDoc}
              onChange={(e) => setFormData(prev => ({ ...prev, tipoDoc: e.target.value }))}
              placeholder="Tipo de documento"
              required
            />
          </div>

          <div>
            <Label htmlFor="archivo">Nuevo Archivo (opcional)</Label>
            <Input
              id="archivo"
              type="file"
              onChange={(e) => setFormData(prev => ({ ...prev, archivo: e.target.files?.[0] || null }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selecciona un archivo para reemplazar el actual (opcional)
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}