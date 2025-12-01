"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, User, Clock, FileText, AlertCircle, Edit2, Trash2, FileIcon, Eye, Plus, CheckCircle } from "lucide-react"
import { getActividadById } from "@/lib/services/actividadService"
import { Actividad } from "@/types/actividad"
import { useStatus } from "@/hooks/useStatus"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useDocumentos } from "@/hooks/useDocumentos"
import { useActividades } from "@/hooks/useActividades"
import { Documento } from "@/types/documento"
import { DocumentCreate } from "./documentCreate"

const DocumentEdit = dynamic(() => import('./documentEdit').then(mod => ({ default: mod.DocumentEdit })), {
    loading: () => <div className="flex items-center justify-center p-4">Cargando...</div>,
    ssr: false
})

interface ModalWithTabsProps {
    children: React.ReactNode
    activity: { id: number; subject: string; date: string }
    statusList?: any[]
    usuarios?: any[]
}

export function ModalWithTabs({ children, activity, statusList: propStatusList, usuarios: propUsuarios }: ModalWithTabsProps) {
    const [open, setOpen] = useState(false)
    const [fullActivity, setFullActivity] = useState<Actividad | null>(null)
    const [loading, setLoading] = useState(false)
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isCreateMode, setIsCreateMode] = useState(false)
    const [activeTab, setActiveTab] = useState("apartado1")
    
    const { status: hookStatusList } = propStatusList ? { status: propStatusList } : useStatus()
    const { usuarios: hookUsuarios } = propUsuarios ? { usuarios: propUsuarios } : useUsuarios()
    const { updateActividadStatus } = useActividades()
    const statusList = propStatusList || hookStatusList
    const usuarios = propUsuarios || hookUsuarios
    const { getDocumentos, getDocumentosByActividad, deleteDocumento, viewDocumento, loading: documentosLoading } = useDocumentos()
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    // ============================================
    // NUEVA FUNCIÓN: Contar usuarios únicos en documentos
    // ============================================
    const uniqueUsersCount = useMemo(() => {
        if (!documentos || documentos.length === 0) {
            console.log('📊 No hay documentos para contar usuarios, total docs:', documentos?.length);
            return 0;
        }

        // Extraer todos los usuarioId únicos de los documentos
        const uniqueUserIds = new Set<number>();
        
        documentos.forEach(doc => {
            const userId = doc.usuario?.id || doc.usuarioId;
            console.log('📄 Documento:', doc.id, 'Usuario:', userId, 'Nombre:', doc.nombre);
            if (userId && userId > 0) {
                uniqueUserIds.add(userId);
            }
        });

        const count = uniqueUserIds.size;
        console.log(`📊 Usuarios únicos encontrados: ${count}`, Array.from(uniqueUserIds));
        
        return count;
    }, [documentos]);

    // Calcular si se debe mostrar el botón de completar
    const shouldShowCompleteButton = useMemo(() => {
        console.log('🔍 Evaluando shouldShowCompleteButton...');
        console.log('  - Status ID:', fullActivity?.status.id);
        console.log('  - Documentos totales:', documentos.length);
        console.log('  - Usuarios únicos:', uniqueUsersCount);
        
        // No mostrar si la actividad ya está completada
        if (fullActivity?.status.id === 3) {
            console.log('❌ Botón oculto: actividad ya completada');
            return false;
        }

        // Mostrar solo si hay más de 1 usuario
        const shouldShow = uniqueUsersCount > 1;
        console.log(`🔍 ¿Mostrar botón completar? ${shouldShow} (${uniqueUsersCount} usuarios únicos)`);
        
        return shouldShow;
    }, [fullActivity?.status.id, documentos.length, uniqueUsersCount]);

    // Register for status update notifications
    useEffect(() => {
        const handleActivityUpdate = (payload: any) => {
            if (payload.type === 'STATUS_UPDATE' && fullActivity && payload.actividadId === fullActivity.id) {
                console.log('🔄 ActivityDetail: Received status update via callback:', payload)
                // Update the local activity state
                setFullActivity(prev => prev ? {
                    ...prev,
                    status: statusList.find(s => s.id === payload.statusId) || prev.status
                } : null)
            }
        }

        // Register with the global callback system
        if (typeof window !== 'undefined') {
            // Register for global callbacks
            if (!(window as any).registerActividadUpdateCallback) {
                (window as any).registerActividadUpdateCallback = (callback: Function) => {
                    if (!(window as any).updateCallbacks) {
                        (window as any).updateCallbacks = new Set()
                    }
                    (window as any).updateCallbacks.add(callback)
                }
                (window as any).unregisterActividadUpdateCallback = (callback: Function) => {
                    if ((window as any).updateCallbacks) {
                        (window as any).updateCallbacks.delete(callback)
                    }
                }
            }
            (window as any).registerActividadUpdateCallback(handleActivityUpdate)
        }

        return () => {
            if (typeof window !== 'undefined' && (window as any).unregisterActividadUpdateCallback) {
                (window as any).unregisterActividadUpdateCallback(handleActivityUpdate)
            }
        }
    }, [fullActivity?.id, statusList])

    const handleCompleteTask = useCallback(async () => {
        if (!fullActivity) return
        
        if (!confirm('¿Estás seguro de que deseas completar esta tarea?')) return
        
        setIsUpdatingStatus(true)
        try {
            console.log('🚀 Starting task completion for activity:', activity.id)
            
            await updateActividadStatus(activity.id, 3) // Status ID 3 for "Terminada"
            
            // Wait a bit to ensure the backend has processed the update
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Refresh the activity data to show the updated status
            const updatedActivity = await getActividadById(activity.id)
            console.log('✅ Activity status updated:', updatedActivity.status)
            setFullActivity(updatedActivity)
            
            // Dispatch event to notify ALL components about the update
            console.log('📡 Dispatching status update event:', { actividadId: activity.id, newStatus: 3 })
            const statusUpdateEvent = new CustomEvent('actividadStatusUpdated', {
                detail: {
                    actividadId: activity.id,
                    newStatus: 3,
                    timestamp: Date.now(),
                    fullActivity: updatedActivity
                }
            })
            window.dispatchEvent(statusUpdateEvent)
            
            // Also notify via the global callback system if available
            if (typeof window !== 'undefined' && (window as any).updateCallbacks) {
                (window as any).updateCallbacks.forEach((callback: Function) => {
                    try {
                        callback({
                            type: 'STATUS_UPDATE',
                            actividadId: activity.id,
                            statusId: 3,
                            actividad: updatedActivity,
                            timestamp: Date.now()
                        })
                    } catch (error) {
                        console.error('Error in update callback:', error)
                    }
                })
            }
            
            alert('Tarea completada exitosamente')
        } catch (error) {
            console.error('❌ Error completing task:', error)
            alert('Error al completar la tarea')
        } finally {
            setIsUpdatingStatus(false)
        }
    }, [fullActivity, activity.id, updateActividadStatus])

    // Cargar datos solo cuando el modal se abre
    useEffect(() => {
        if (!open) return;

        let isMounted = true;

        const loadActivityData = async () => {
            setLoading(true)
            
            try {
                const actividadData = await getActividadById(activity.id)
                if (isMounted) {
                    setFullActivity(actividadData)
                }
            } catch (error) {
                console.error('Error loading activity details:', error)
                if (isMounted) {
                    setFullActivity(null)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadActivityData()

        return () => {
            isMounted = false;
        }
    }, [open, activity.id])

    // Cargar documentos cuando se abre el modal
    useEffect(() => {
        if (!open) return;

        let isMounted = true;

        const loadDocumentos = async () => {
            try {
                const allDocs = await getDocumentos();
                const docs = allDocs.filter(doc => doc.idActividades === activity.id || doc.actividad?.id === activity.id);
                if (isMounted) {
                    setDocumentos(docs)
                    console.log('📄 Documentos cargados:', docs.length);
                }
            } catch (error) {
                console.error('Error loading documents:', error)
                if (isMounted) {
                    setDocumentos([])
                }
            }
        }

        loadDocumentos()

        return () => {
            isMounted = false;
        }
    }, [open, activity.id])

    const loadDocumentos = useCallback(async () => {
        try {
            const allDocs = await getDocumentos();
            const docs = allDocs.filter(doc => doc.idActividades === activity.id || doc.actividad?.id === activity.id);
            setDocumentos(docs)
            console.log('📄 Documentos recargados:', docs.length);
        } catch (error) {
            console.error('Error loading documents:', error)
            setDocumentos([])
        }
    }, [activity.id, getDocumentos])

    const handleDeleteDocumento = useCallback(async (docId: number) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) return
        
        try {
            await deleteDocumento(docId)
            setDocumentos(prev => prev.filter(doc => doc.id !== docId))
        } catch (error) {
            console.error('Error deleting document:', error)
            alert('Error al eliminar el documento')
        }
    }, [deleteDocumento])

    const handleViewDocumento = useCallback(async (doc: Documento) => {
        try {
            const url = await viewDocumento(doc.id)
            window.open(url, '_blank')
            setTimeout(() => URL.revokeObjectURL(url), 10000)
        } catch (error) {
            console.error('Error al abrir el documento:', error)
            alert('Error al abrir el documento. Inténtalo de nuevo.')
        }
    }, [viewDocumento])

    const handleEditDocumento = useCallback((doc: Documento) => {
        setSelectedDoc(doc)
        setIsEditMode(true)
    }, [])

    const InfoCard = useCallback(({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="mt-0.5 p-2 rounded-full bg-blue-500 text-white">
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900 break-words">{String(value)}</p>
            </div>
        </div>
    ), [])

    // Separar documentos regulares y acuses
    const { regularDocs, acuseDocs } = useMemo(() => {
        const regular = documentos.filter(doc => doc.tipoDoc !== 'Acuse');
        const acuse = documentos.filter(doc => doc.tipoDoc === 'Acuse');
        return { regularDocs: regular, acuseDocs: acuse };
    }, [documentos]);

    const renderDocumentItem = useCallback((doc: Documento, isAcuse: boolean = false) => (
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
    ), [handleViewDocumento, handleEditDocumento, handleDeleteDocumento])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[70vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        {fullActivity?.asunto || "Detalles de Actividad"}
                    </DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-lg p-1 mb-4">
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
                            Documentación
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
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-5 h-5" />
                                            <h3 className="font-bold text-lg">Descripción</h3>
                                        </div>
                                        <p className="text-blue-50 leading-relaxed">
                                            {fullActivity.descripcion || "Sin descripción disponible"}
                                        </p>
                                    </div>

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

                                    {/* ============================================ */}
                                    {/* BOTÓN COMPLETAR CON VALIDACIÓN DE USUARIOS */}
                                    {/* ============================================ */}
                                    {shouldShowCompleteButton && (
                                        <div className="mt-6 flex justify-center">
                                            <Button
                                                onClick={handleCompleteTask}
                                                disabled={isUpdatingStatus}
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUpdatingStatus ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Completando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 mr-2" />
                                                        Completar Tarea
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
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
                                    loadDocumentos()
                                }}
                                onSuccess={loadDocumentos}
                            />
                            <DocumentCreate
                                activityId={activity.id}
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
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}