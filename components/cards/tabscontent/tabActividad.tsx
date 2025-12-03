import React from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, User, Clock, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Actividad } from "@/types/actividad"

interface InfoCardProps {
    icon: any
    label: string
    value: string | number
}

const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
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

interface TabActividadProps {
    loading: boolean
    fullActivity: Actividad | null
    statusList: any[]
    usuarios: any[]
    shouldShowCompleteButton: boolean
    handleCompleteTask: () => void
    isUpdatingStatus: boolean
}

export const TabActividad: React.FC<TabActividadProps> = ({
    loading,
    fullActivity,
    statusList,
    usuarios,
    shouldShowCompleteButton,
    handleCompleteTask,
    isUpdatingStatus,
}) => {
    return (
        <div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
        </div>
    )
}