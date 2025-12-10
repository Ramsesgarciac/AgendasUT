import { Badge } from "@heroui/badge"
import { Calendar, FileText, Loader2, ChevronDown } from "lucide-react"
import { Area } from "@/types/area"
import { ModalWithTabs } from "./activityDetail"
import { useActividadesByArea } from "@/hooks/useActividadesByArea"

interface ActivityViewCardProps {
    area: Area
    formatDate: (dateString: string) => string
    usuarios?: any[]
}

export function ActivityViewCard({
    area,
    formatDate,
    usuarios = []
}: ActivityViewCardProps) {

    // Usar el hook para cargar actividades paginadas de esta área
    const {
        actividades,
        loading,
        loadingMore,
        hasMore,
        totalItems,
        currentPage,
        totalPages,
        loadMore
    } = useActividadesByArea(area.id, 10);

    // Mostrar loading state durante carga inicial
    if (loading) {
        return (
            <div className="border border-border rounded-lg bg-card">
                {/* Area Header */}
                <div className="p-4 border-b border-border bg-blue-500">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-white">{area.name}</h3>
                        <Badge variant="flat" className="bg-white/20 border-white/30 text-white">
                            ...
                        </Badge>
                    </div>
                </div>

                {/* Loading State */}
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Cargando actividades...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg bg-card">
            {/* Area Header */}
            <div className="p-4 border-b border-border bg-blue-500">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-white">{area.name}</h3>
                    <Badge variant="flat" className="bg-white/20 border-white/30 text-white">
                        {actividades.length} / {totalItems}
                    </Badge>
                </div>
            </div>

            {/* Activities List */}
            <div className="p-4">
                {actividades.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <FileText className="w-5 h-5 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No hay actividades en esta área</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {actividades.map((activity) => (
                                <ModalWithTabs
                                    key={activity.id}
                                    activity={{
                                        id: activity.id,
                                        subject: activity.asunto,
                                        date: activity.fechaLimite.toString()
                                    }}
                                    usuarios={usuarios}
                                >
                                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                                        <h4 className="font-medium text-sm text-foreground mb-2 text-pretty">
                                            {activity.asunto.slice(0, 32)}{activity.asunto.length > 32 ? '...' : ''}
                                        </h4>
                                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            Fecha Límite: {formatDate(activity.fechaLimite.toString())}
                                        </div>
                                    </div>
                                </ModalWithTabs>
                            ))}
                        </div>

                        {/* Botón "Ver más" */}
                        {hasMore && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xs text-muted-foreground">
                                        Página {currentPage} de {totalPages}
                                    </p>
                                    <button
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="w-full px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Cargando...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3" />
                                                Ver más actividades
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
