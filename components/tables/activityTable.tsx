"use client"

import React from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table"
import { Spinner } from "@heroui/spinner"
import { useInfiniteScroll } from "@heroui/use-infinite-scroll"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { Area } from "@/types/area"
import { ModalWithTabs } from "@/components/cards/activityDetail"
import { actividadService } from "@/lib/services/actividadService"

interface ActivityTableProps {
    filteredAreas: Area[]
    formatDate: (dateString: string) => string
    statusList?: any[]
    usuarios?: any[]
}

export function ActivityTable({ filteredAreas, formatDate, statusList, usuarios }: ActivityTableProps) {
    const [actividadesByArea, setActividadesByArea] = React.useState<Record<number, any[]>>({})
    const [pageByArea, setPageByArea] = React.useState<Record<number, number>>({})
    const [hasMoreByArea, setHasMoreByArea] = React.useState<Record<number, boolean>>({})
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasMore, setHasMore] = React.useState(false)

    // Inicializar estados
    React.useEffect(() => {
        const initialActividades: Record<number, any[]> = {}
        const initialPages: Record<number, number> = {}
        const initialHasMore: Record<number, boolean> = {}

        filteredAreas.forEach(area => {
            initialActividades[area.id] = []
            initialPages[area.id] = 1
            initialHasMore[area.id] = true
        })

        setActividadesByArea(initialActividades)
        setPageByArea(initialPages)
        setHasMoreByArea(initialHasMore)
    }, [filteredAreas.map(a => a.id).join(',')])

    // Cargar datos iniciales
    React.useEffect(() => {
        if (filteredAreas.length === 0) return

        const loadInitialData = async () => {
            setIsLoading(true)
            const promises = filteredAreas.map(async (area) => {
                try {
                    const response = await actividadService.getActividadesByArea(area.id, 1, 15)
                    return {
                        areaId: area.id,
                        data: response.data,
                        hasMore: response.meta.page < response.meta.totalPages
                    }
                } catch (error) {
                    console.error(`Error loading area ${area.id}:`, error)
                    return {
                        areaId: area.id,
                        data: [],
                        hasMore: false
                    }
                }
            })

            const results = await Promise.all(promises)

            const newActividades: Record<number, any[]> = {}
            const newHasMore: Record<number, boolean> = {}
            let anyHasMore = false

            results.forEach(result => {
                newActividades[result.areaId] = result.data
                newHasMore[result.areaId] = result.hasMore
                if (result.hasMore) anyHasMore = true
            })

            setActividadesByArea(newActividades)
            setHasMoreByArea(newHasMore)
            setHasMore(anyHasMore)
            setIsLoading(false)
        }

        loadInitialData()
    }, [filteredAreas.map(a => a.id).join(',')])

    // Función para cargar más datos - OPTIMIZADA
    const loadMore = React.useCallback(async () => {
        // Evitar múltiples cargas simultáneas
        if (isLoading) return

        // Verificar si realmente hay más datos
        const areasWithMore = filteredAreas.filter(area => hasMoreByArea[area.id])
        if (areasWithMore.length === 0) {
            setHasMore(false)
            return
        }

        setIsLoading(true)

        // Cargar solo las áreas que tienen más datos
        const promises = areasWithMore.map(async (area) => {
            try {
                const nextPage = (pageByArea[area.id] || 1) + 1
                const response = await actividadService.getActividadesByArea(area.id, nextPage, 15)
                return {
                    areaId: area.id,
                    data: response.data,
                    hasMore: response.meta.page < response.meta.totalPages,
                    page: nextPage
                }
            } catch (error) {
                console.error(`Error loading more for area ${area.id}:`, error)
                return {
                    areaId: area.id,
                    data: [],
                    hasMore: false,
                    page: pageByArea[area.id]
                }
            }
        })

        // Actualizar estados de forma optimizada
        const results = await Promise.all(promises)

        // Batch state updates
        setActividadesByArea(prev => {
            const updated = { ...prev }
            results.forEach(result => {
                if (result.data.length > 0) {
                    updated[result.areaId] = [...(prev[result.areaId] || []), ...result.data]
                }
            })
            return updated
        })

        setPageByArea(prev => {
            const updated = { ...prev }
            results.forEach(result => {
                updated[result.areaId] = result.page
            })
            return updated
        })

        setHasMoreByArea(prev => {
            const updated = { ...prev }
            let anyHasMore = false
            results.forEach(result => {
                updated[result.areaId] = result.hasMore
                if (result.hasMore) anyHasMore = true
            })
            setHasMore(anyHasMore)
            return updated
        })

        setIsLoading(false)
    }, [filteredAreas, isLoading, hasMoreByArea, pageByArea])

    const [loaderRef, scrollerRef] = useInfiniteScroll({
        hasMore,
        onLoadMore: loadMore,
    })

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
        return Math.max(...counts, 1)
    }, [actividadesByArea])

    return (
        <Table
            isHeaderSticky
            aria-label="Tabla de actividades por área con scroll infinito"
            baseRef={scrollerRef}
            bottomContent={
                hasMore ? (
                    <div className="flex w-full justify-center">
                        <Spinner ref={loaderRef} color="default" />
                    </div>
                ) : null
            }
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
                            <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-xs">
                                {actividadesByArea[area.id]?.length || 0}
                            </Badge>
                        </div>
                    </TableColumn>
                ))}
            </TableHeader>
            <TableBody
                isLoading={isLoading && maxRows === 1}
                loadingContent={<Spinner color="default" />}
            >
                {Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {filteredAreas.map((area) => {
                            const actividades = actividadesByArea[area.id] || []
                            const activity = actividades[rowIndex]

                            // Empty state
                            if (!activity) {
                                if (rowIndex === 0 && actividades.length === 0 && !isLoading) {
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
    )
}
