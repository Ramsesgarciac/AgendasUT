"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, User, Clock, FileText, AlertCircle, Download, Edit2, Trash2, FileIcon, Eye } from "lucide-react"
import { getActividadById } from "@/lib/services/actividadService"
import { Actividad } from "@/types/actividad"
import { useStatus } from "@/hooks/useStatus"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useDocumentos } from "@/hooks/useDocumentos"
import { Documento } from "@/types/documento"
import { DocumentEdit } from "./documentEdit"

interface ModalWithTabsProps {
    children: React.ReactNode
    activity: { id: number; subject: string; date: string }
}

export function ModalWithTabs({ children, activity }: ModalWithTabsProps) {
    const [open, setOpen] = useState(false)
    const [fullActivity, setFullActivity] = useState<Actividad | null>(null)
    const [loading, setLoading] = useState(false)
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const { status: statusList } = useStatus()
    const { usuarios } = useUsuarios()
    const { getDocumentos, deleteDocumento, downloadDocumento, viewDocumento, loading: documentosLoading } = useDocumentos()

    useEffect(() => {
        if (open && activity.id) {
            setLoading(true)
            
            // Cargar actividad
            getActividadById(activity.id)
                .then(actividadData => {
                    setFullActivity(actividadData)
                })
                .catch(error => {
                    console.error('Error loading activity details:', error)
                    setFullActivity(null)
                })
                .finally(() => {
                    setLoading(false)
                })

            // Cargar documentos en paralelo pero sin afectar el loading de la actividad
            loadDocumentos()
        }
    }, [open, activity.id])

    const loadDocumentos = async () => {
        try {
            const docs = await getDocumentos()
            const filteredDocs = docs.filter(doc => doc.actividad?.id === activity.id)
            setDocumentos(filteredDocs)
        } catch (error) {
            console.error('Error loading documents:', error)
            setDocumentos([])
        }
    }

    const handleDeleteDocumento = async (docId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return
        
        try {
            await deleteDocumento(docId)
            setDocumentos(prev => prev.filter(doc => doc.id !== docId))
        } catch (error) {
            console.error('Error deleting document:', error)
            alert('Error al eliminar el documento')
        }
    }

    const handleViewDocumento = async (doc: Documento) => {
        try {
            // Obtener la URL del documento para visualizar
            const url = await viewDocumento(doc.id)

            // Abrir en una nueva pestaña
            window.open(url, '_blank')

            // Limpiar la URL del blob después de un tiempo para liberar memoria
            setTimeout(() => URL.revokeObjectURL(url), 10000)
        } catch (error) {
            console.error('Error al abrir el documento:', error)
            alert('Error al abrir el documento. Inténtalo de nuevo.')
        }
    }

    const handleEditDocumento = (doc: Documento) => {
        setSelectedDoc(doc)
        setIsEditMode(true)
    }

    const getFileIcon = (tipoDoc: string) => {
        const tipo = tipoDoc.toLowerCase()
        if (tipo.includes('pdf')) return '📄'
        if (tipo.includes('doc')) return '📝'
        if (tipo.includes('xls') || tipo.includes('excel')) return '📊'
        if (tipo.includes('img') || tipo.includes('image') || tipo.includes('png') || tipo.includes('jpg')) return '🖼️'
        return '📎'
    } // Removí getDocumentos de las dependencias

    const InfoCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="mt-0.5 p-2 rounded-full bg-blue-500 text-white">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900 break-words">{String(value)}</p>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {fullActivity?.asunto || "Detalles de Actividad"}
                    </DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="apartado1" className="w-full flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1 mb-4">
                        <TabsTrigger
                            value="apartado1"
                            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all py-2.5 font-medium"
                        >
                            Información General
                        </TabsTrigger>
                        <TabsTrigger
                            value="apartado2"
                            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all py-2.5 font-medium"
                        >
                            Detalles Adicionales
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <TabsContent value="apartado1" className="space-y-6 mt-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Cargando información...</p>
                                </div>
                            ) : fullActivity ? (
                                <>
                                    {/* Descripción destacada */}
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5" />
                                            <h3 className="font-bold text-lg">Descripción</h3>
                                        </div>
                                        <p className="text-blue-50 leading-relaxed">
                                            {fullActivity.descripcion || "Sin descripción disponible"}
                                        </p>
                                    </div>

                                    {/* Grid de información */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoCard
                                            icon={Building2}
                                            label="Instancia Receptora"
                                            value={fullActivity.instanciaReceptora || "No especificada"}
                                        />
                                        <InfoCard
                                            icon={Building2}
                                            label="Instancia Emisora"
                                            value={fullActivity.instanciaEmisora || "No especificada"}
                                        />
                                        <InfoCard
                                            icon={FileText}
                                            label="Tipo de Actividad"
                                            value={fullActivity.tipoActividad || "No especificado"}
                                        />
                                        <InfoCard
                                            icon={User}
                                            label="Usuario Creador"
                                            value={usuarios.find(u => u.id === fullActivity.userCreate.id)?.rol || String(fullActivity.userCreate.id)}
                                        />
                                    </div>

                                    {/* Fechas y estado */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-amber-600" />
                                                <p className="text-xs font-medium text-amber-700">Fecha Límite</p>
                                            </div>
                                            <p className="text-base font-bold text-amber-900">
                                                {fullActivity.fechaLimite ? new Date(fullActivity.fechaLimite).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : "No especificada"}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                <p className="text-xs font-medium text-green-700">Fecha de Creación</p>
                                            </div>
                                            <p className="text-base font-bold text-green-900">
                                                {fullActivity.fechaCreacion ? new Date(fullActivity.fechaCreacion).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : "No especificada"}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-purple-600" />
                                                <p className="text-xs font-medium text-purple-700">Estado</p>
                                            </div>
                                            <p className="text-base font-bold text-purple-900">
                                                {statusList.find(s => s.id === fullActivity.status.id)?.nombre || String(fullActivity.status.id)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <AlertCircle className="w-16 h-16 text-gray-400" />
                                    <p className="text-gray-500 font-medium">No se pudo cargar la información de la actividad.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="apartado2" className="mt-0">
                            <DocumentEdit
                                documento={selectedDoc}
                                isOpen={isEditMode}
                                onClose={() => {
                                    setIsEditMode(false)
                                    setSelectedDoc(null)
                                    loadDocumentos() // Recargar documentos después de editar
                                }}
                                onSuccess={() => {
                                    loadDocumentos() // Recargar documentos después de guardar
                                }}
                            />
                            {documentosLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-gray-500 font-medium">Cargando documentos...</p>
                                </div>
                            ) : documentos.length > 0 ? (
                                <div className="space-y-3">
                                    {documentos.map(doc => (
                                        <div
                                            key={doc.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Icon and Info */}
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                            {doc.nombre}
                                                        </h4>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 mt-1">
                                                            {doc.tipoDoc}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDocumento(doc)}
                                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1.5" />
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditDocumento(doc)}
                                                        className="hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-1.5" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteDocumento(doc.id)}
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                        <FileIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay documentos adjuntos</h3>
                                    <p className="text-sm text-gray-500">
                                        Aún no se han subido documentos para esta actividad
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}