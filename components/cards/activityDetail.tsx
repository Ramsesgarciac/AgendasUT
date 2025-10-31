"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, User, Clock, FileText, AlertCircle } from "lucide-react"
import { getActividadById } from "@/lib/services/actividadService"
import { Actividad } from "@/types/actividad"
import { useStatus } from "@/hooks/useStatus"
import { useUsuarios } from "@/hooks/useUsuarios"

interface ModalWithTabsProps {
    children: React.ReactNode
    activity: { id: number; subject: string; date: string }
}

export function ModalWithTabs({ children, activity }: ModalWithTabsProps) {
    const [open, setOpen] = useState(false)
    const [fullActivity, setFullActivity] = useState<Actividad | null>(null)
    const [loading, setLoading] = useState(false)
    const { status: statusList } = useStatus()
    const { usuarios } = useUsuarios()

    useEffect(() => {
        if (open && activity.id) {
            setLoading(true)
            getActividadById(activity.id)
                .then(setFullActivity)
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [open, activity.id])

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
                                            {fullActivity.descripcion}
                                        </p>
                                    </div>

                                    {/* Grid de información */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoCard 
                                            icon={Building2}
                                            label="Instancia Receptora"
                                            value={fullActivity.instanciaReceptora}
                                        />
                                        <InfoCard 
                                            icon={Building2}
                                            label="Instancia Emisora"
                                            value={fullActivity.instanciaEmisora}
                                        />
                                        <InfoCard 
                                            icon={FileText}
                                            label="Tipo de Actividad"
                                            value={fullActivity.tipoActividad}
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
                                                {new Date(fullActivity.fechaLimite).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                <p className="text-xs font-medium text-green-700">Fecha de Creación</p>
                                            </div>
                                            <p className="text-base font-bold text-green-900">
                                                {new Date(fullActivity.fechaCreacion).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-purple-600" />
                                                <p className="text-xs font-medium text-purple-700">Estado</p>
                                            </div>
                                            <p className="text-base font-bold text-purple-900">
                                                {statusList.find(s => s.id === fullActivity.status.id)?.nombre || fullActivity.status.id}
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

                        <TabsContent value="apartado2" className="space-y-6 mt-0">
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                    <h3 className="font-bold text-xl text-gray-900 mb-3">Detalles Adicionales</h3>
                                    <p className="text-gray-600 leading-relaxed mb-4">
                                        Este apartado está disponible para mostrar información complementaria sobre la actividad, 
                                        como archivos adjuntos, comentarios, historial de cambios o cualquier otro dato relevante.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="p-4 rounded-lg bg-white border border-indigo-200">
                                            <p className="text-sm font-medium text-gray-700">Archivos Adjuntos</p>
                                            <p className="text-xs text-gray-500 mt-1">Sección por configurar</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white border border-indigo-200">
                                            <p className="text-sm font-medium text-gray-700">Comentarios</p>
                                            <p className="text-xs text-gray-500 mt-1">Sección por configurar</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}