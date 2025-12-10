"use client"

import React from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table"
import { Spinner } from "@heroui/spinner"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { Area } from "@/types/area"
import { ModalWithTabs } from "@/components/cards/activityDetail"
import { useActividadesByArea } from "@/hooks/useActividadesByArea"

interface ActivityTableProps {
    filteredAreas: Area[]
    formatDate: (dateString: string) => string
    statusList?: any[]
    usuarios?: any[]
}

// Hook personalizado para cargar actividades de múltiples áreas
function useMultipleAreasActivities(areas: Area[]) {
    const [actividadesByArea, setActividadesByArea] = React.useState<Record<number, any[]>>({})
    const [loadingByArea, setLoadingByArea] = React.useState<Record<number, boolean>>({})

    React.useEffect(() => {
        // Inicializar estados
        const initialActividades: Record<number, any[]> = {}
        const initialLoading: Record<number, boolean> = {}

        areas.forEach(area => {
            initialActividades[area.id] = []
            initialLoading[area.id] = true
        })

        setActividadesByArea(initialActividades)
        setLoadingByArea(initialLoading)
    }, [areas.map(a => a.id).join(',')])

    return { actividadesByArea, loadingByArea, setActividadesByArea, setLoadingByArea }
}

// Componente que carga actividades de un área y actualiza el estado padre
function AreaDataLoader({
    areaId,
    onDataLoaded
}: {
    areaId: number
    onDataLoaded: (areaId: number, actividades: any[], loading: boolean) => void
}) {
    const { actividades, loading } = useActividadesByArea(areaId, 100)

    React.useEffect(() => {
        onDataLoaded(areaId, actividades, loading)
    }, [areaId, actividades, loading, onDataLoaded])

    return null // Este componente no renderiza nada
}

export function ActivityTable({ filteredAreas, formatDate, statusList, usuarios }: ActivityTableProps) {
    const { actividadesByArea, loadingByArea, setActividadesByArea, setLoadingByArea } = useMultipleAreasActivities(filteredAreas)

    const handleDataLoaded = React.useCallback((areaId: number, actividades: any[], loading: boolean) => {
        setActividadesByArea(prev => ({ ...prev, [areaId]: actividades }))
        setLoadingByArea(prev => ({ ...prev, [areaId]: loading }))
    }, [setActividadesByArea, setLoadingByArea])

    const getEffectiveActivity = (activity: any) => {
        const now = new Date()
        const deadline = new Date(activity.fechaLimite)

        if (deadline < now && activity.status.nombre !== "Terminada") {
            const dezfasadaStatus = statusList?.find(s => s.id === 2)
            if (dezfasadaStatus) {
                return {
                    ...activity,
                    status: dezfasadaStatus
                }
            }
        }

        return activity
    }

    const getStatusColor = (statusName: string): string => {
        switch (statusName) {
            case "En Proceso":
                return "bg-amber-100 text-gray-900 border-amber-100"
            case "Dezfasada":
                return "bg-rose-200 text-gray-900 border-rose-300"
            case "Terminada":
                return "bg-emerald-200 text-gray-950 border-emerald-300"
            default:
                return "bg-slate-400 text-slate-950 border-slate-500"
        }
    }

    // Calcular el número máximo de filas
    const maxRows = React.useMemo(() => {
        const counts = Object.values(actividadesByArea).map(acts => acts.length)
        return Math.max(...counts, 20) // Mínimo 20 filas
    }, [actividadesByArea])

    return (
        <>
            {/* Data loaders invisibles */}
            {filteredAreas.map(area => (
                <AreaDataLoader
                    key={area.id}
                    areaId={area.id}
                    onDataLoaded={handleDataLoaded}
                />
            ))}

            <Table
                isHeaderSticky
                aria-label="Tabla de actividades por área"
                classNames={{
                    base: "max-h-[780px] overflow-scroll",
                    table: "min-h-[400px]",
                    th: "bg-blue-500 text-white",
                }}
            >
                <TableHeader className="sticky top-0 z-20 bg-blue-500 h-16 w-full">
                    {filteredAreas.map((area) => (
                        <TableColumn
                            key={area.id}
                            style={{ width: `${100 / filteredAreas.length}%` }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold text-base">{area.name}</span>
                            </div>
                        </TableColumn>
                    ))}
                </TableHeader>
                <TableBody>
                    {Array.from({ length: maxRows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {filteredAreas.map((area) => {
                                const actividades = actividadesByArea[area.id] || []
                                const loading = loadingByArea[area.id]
                                const activity = actividades[rowIndex]

                                // Loading state
                                if (loading && rowIndex === 0) {
                                    return (
                                        <TableCell key={area.id}>
                                            <div className="flex justify-center py-4">
                                                <Spinner size="sm" />
                                            </div>
                                        </TableCell>
                                    )
                                }

                                // Empty state
                                if (!activity) {
                                    if (rowIndex === 0 && actividades.length === 0) {
                                        return (
                                            <TableCell key={area.id}>
                                                <div className="text-center py-6 text-default-400">
                                                    <FileText className="w-5 h-5 mx-auto mb-2 opacity-40" />
                                                    <p className="text-xs">Sin actividades</p>
                                                </div>
                                            </TableCell>
                                        )
                                    }
                                    return <TableCell key={area.id}>{null}</TableCell>
                                }

                                // Activity cell
                                return (
                                    <TableCell key={area.id}>
                                        <ModalWithTabs
                                            activity={{
                                                id: activity.id,
                                                subject: activity.asunto,
                                                date: activity.fechaLimite.toString()
                                            }}
                                            statusList={statusList}
                                            usuarios={usuarios}
                                        >
                                            <div className="group p-4 rounded-xl bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer">
                                                <h4 className="font-semibold text-sm text-gray-800 mb-4 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                                                    {activity.asunto.slice(0, 35)}{activity.asunto.length > 35 ? '...' : ''}
                                                </h4>

                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-900 group-hover:text-blue-600" />
                                                        <span className="font-medium">
                                                            {formatDate(activity.fechaLimite.toString())}
                                                        </span>
                                                    </div>

                                                    {(() => {
                                                        const effectiveActivity = getEffectiveActivity(activity)
                                                        return (
                                                            <Badge className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-2 shadow-sm ${getStatusColor(effectiveActivity.status.nombre)}`}>
                                                                {effectiveActivity.status.nombre}
                                                            </Badge>
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        </ModalWithTabs>
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
