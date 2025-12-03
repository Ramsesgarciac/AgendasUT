import React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Plus, FileIcon, Eye, Edit2, Trash2 } from "lucide-react"
import { Documento } from "@/types/documento"
import { DocumentCreate } from "../documentCreate"

const DocumentEdit = dynamic(() => import('../documentEdit').then(mod => ({ default: mod.DocumentEdit })), {
    loading: () => <div className="flex items-center justify-center p-4">Cargando...</div>,
    ssr: false
})

interface TabDocumentoProps {
    selectedDoc: Documento | null
    isEditMode: boolean
    setIsEditMode: (value: boolean) => void
    setSelectedDoc: (doc: Documento | null) => void
    loadDocumentos: () => void
    activityId: number
    fullActivity: any
    isCreateMode: boolean
    setIsCreateMode: (value: boolean) => void
    documentosLoading: boolean
    documentos: Documento[]
    uniqueUsersCount: number
    regularDocs: Documento[]
    acuseDocs: Documento[]
    handleViewDocumento: (doc: Documento) => void
    handleEditDocumento: (doc: Documento) => void
    handleDeleteDocumento: (docId: number) => void
}

export const TabDocumento: React.FC<TabDocumentoProps> = ({
    selectedDoc,
    isEditMode,
    setIsEditMode,
    setSelectedDoc,
    loadDocumentos,
    activityId,
    fullActivity,
    isCreateMode,
    setIsCreateMode,
    documentosLoading,
    documentos,
    uniqueUsersCount,
    regularDocs,
    acuseDocs,
    handleViewDocumento,
    handleEditDocumento,
    handleDeleteDocumento,
}) => {
    const renderDocumentItem = (doc: Documento, isAcuse: boolean = false) => (
        <div
            key={doc.id}
            className={`rounded-lg border hover:shadow-md transition-all duration-200 p-4 ${
                isAcuse ? 'bg-green-50 border-green-200 hover:border-green-300' : 'bg-white border-gray-200 hover:border-indigo-300'
            }`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {doc.nombre}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                isAcuse ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                                {doc.tipoDoc}
                            </span>
                            {(doc.usuario?.id || doc.usuarioId) && (
                                <span className="text-xs text-gray-500">
                                    Usuario ID: {doc.usuario?.id || doc.usuarioId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

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
                    {!isAcuse && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="mt-0">
            <DocumentEdit
                documento={selectedDoc}
                isOpen={isEditMode}
                onClose={() => {
                    setIsEditMode(false)
                    setSelectedDoc(null)
                    loadDocumentos()
                }}
                onSuccess={loadDocumentos}
            />
            <DocumentCreate
                activityId={activityId}
                actividad={fullActivity}
                isOpen={isCreateMode}
                onClose={() => {
                    setIsCreateMode(false)
                    loadDocumentos()
                }}
            />
            {documentosLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Cargando documentos...</p>
                </div>
            ) : documentos.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800">Documentos</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                {uniqueUsersCount} usuario(s) único(s) en documentos
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateMode(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Documento
                        </Button>
                    </div>

                    {regularDocs.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-base font-medium text-gray-700">Documentos Regulares</h4>
                            {regularDocs.map(doc => renderDocumentItem(doc, false))}
                        </div>
                    )}

                    {acuseDocs.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-base font-medium text-gray-700">Acuses de Recepción</h4>
                            {acuseDocs.map(doc => renderDocumentItem(doc, true))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <FileIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay documentos adjuntos</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Aún no se han subido documentos para esta actividad
                    </p>
                    <Button
                        onClick={() => setIsCreateMode(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Documento
                    </Button>
                </div>
            )}
        </div>
    )
}