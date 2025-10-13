"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDocumentos } from "@/hooks/useDocumentos"
import { useActividades } from "@/hooks/useActividades"
import { DocumentForm } from "@/types/documento"
import { Actividad } from "@/types/actividad"
import { Plus, Trash2 } from "lucide-react"

interface DocumentCreateProps {
  activityId: number
  actividad?: Actividad | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentCreate({ activityId, actividad: propActividad, isOpen, onClose }: DocumentCreateProps) {
  const { uploadDocumentos, loading, error } = useDocumentos()
  const { actividades } = useActividades()
  const [documentos, setDocumentos] = useState<DocumentForm[]>([
    { nombre: "", tipoDoc: "", file: null }
  ])

  const actividad = propActividad || actividades.find(act => act.id === activityId) || null

  const addDocument = () => {
    setDocumentos([...documentos, { nombre: "", tipoDoc: "", file: null }])
  }

  const removeDocument = (index: number) => {
    setDocumentos(documentos.filter((_, i) => i !== index))
  }

  const updateDocument = (index: number, field: keyof DocumentForm, value: string | File | null) => {
    const newDocumentos = [...documentos]
    newDocumentos[index] = { ...newDocumentos[index], [field]: value }
    setDocumentos(newDocumentos)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validDocumentos = documentos.filter(d => d.nombre && d.tipoDoc && d.file)
    if (validDocumentos.length === 0) {
      alert("Agregue al menos un documento completo")
      return
    }

    const files = validDocumentos.map(d => d.file!)
    const docsData = validDocumentos.map(d => ({
      nombre: d.nombre,
      tipoDoc: d.tipoDoc,
      idActividades: activityId
    }))

    try {
      await uploadDocumentos({ files, documentos: docsData })
      onClose()
      setDocumentos([{ nombre: "", tipoDoc: "", file: null }])
    } catch (err) {
      console.error("Error subiendo documentos:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Documentos para Actividad #{activityId}</DialogTitle>
          {actividad && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="text-lg"><strong>Área:</strong> {actividad.area.name} | <strong>Asunto:</strong> {actividad.asunto}</p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="h-80 overflow-y-auto space-y-4">
            {documentos.map((doc, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Documento {index + 1}</h4>
                  {documentos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                      className="text-gray-500 hover:text-red-500 hover:bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`nombre-${index}`}>Nombre</Label>
                    <Input
                      id={`nombre-${index}`}
                      value={doc.nombre}
                      onChange={(e) => updateDocument(index, 'nombre', e.target.value)}
                      placeholder="Nombre del documento"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`tipoDoc-${index}`}>Tipo de Documento</Label>
                    <Input
                      id={`tipoDoc-${index}`}
                      value={doc.tipoDoc}
                      onChange={(e) => updateDocument(index, 'tipoDoc', e.target.value)}
                      placeholder="Tipo de documento"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`file-${index}`}>Archivo</Label>
                  <Input
                    id={`file-${index}`}
                    type="file"
                    onChange={(e) => updateDocument(index, 'file', e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addDocument} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Otro Documento
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Subiendo..." : "Subir Documentos"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}