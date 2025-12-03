"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getActividadById } from "@/lib/services/actividadService"
import { Actividad } from "@/types/actividad"
import { useStatus } from "@/hooks/useStatus"
import { useUsuarios } from "@/hooks/useUsuarios"
import { useDocumentos } from "@/hooks/useDocumentos"
import { useActividades } from "@/hooks/useActividades"
import { Documento } from "@/types/documento"
import { TabDocumento } from "./tabscontent/tabDocumento"
import { TabActividad } from "./tabscontent/tabActividad"


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


    // Separar documentos regulares y acuses
    const { regularDocs, acuseDocs } = useMemo(() => {
        const regular = documentos.filter(doc => doc.tipoDoc !== 'Acuse');
        const acuse = documentos.filter(doc => doc.tipoDoc === 'Acuse');
        return { regularDocs: regular, acuseDocs: acuse };
    }, [documentos]);


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
                            <TabActividad
                                loading={loading}
                                fullActivity={fullActivity}
                                statusList={statusList}
                                usuarios={usuarios}
                                shouldShowCompleteButton={shouldShowCompleteButton}
                                handleCompleteTask={handleCompleteTask}
                                isUpdatingStatus={isUpdatingStatus}
                            />
                        </TabsContent>

                        <TabsContent value="apartado2" className="mt-0">
                            <TabDocumento
                                selectedDoc={selectedDoc}
                                isEditMode={isEditMode}
                                setIsEditMode={setIsEditMode}
                                setSelectedDoc={setSelectedDoc}
                                loadDocumentos={loadDocumentos}
                                activityId={activity.id}
                                fullActivity={fullActivity}
                                isCreateMode={isCreateMode}
                                setIsCreateMode={setIsCreateMode}
                                documentosLoading={documentosLoading}
                                documentos={documentos}
                                uniqueUsersCount={uniqueUsersCount}
                                regularDocs={regularDocs}
                                acuseDocs={acuseDocs}
                                handleViewDocumento={handleViewDocumento}
                                handleEditDocumento={handleEditDocumento}
                                handleDeleteDocumento={handleDeleteDocumento}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}