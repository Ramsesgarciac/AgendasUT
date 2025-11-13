"use client"

import React from "react"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table"
import { Spinner } from "@heroui/spinner"
import { useInfiniteScroll } from "@heroui/use-infinite-scroll"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { Area, Activity } from "@/types/area"
import { ModalWithTabs } from "@/components/cards/activityDetail"

interface ActivityTableProps {
    filteredAreas: Area[]
    formatDate: (dateString: string) => string
    statusList?: any[]
    usuarios?: any[]
}

export function ActivityTable({ filteredAreas, formatDate, statusList, usuarios }: ActivityTableProps) {
    const [displayedActivities, setDisplayedActivities] = React.useState<Record<number, Activity[]>>({})
    const [hasMore, setHasMore] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const INITIAL_ITEMS = 8
    const ITEMS_PER_LOAD = 3

    const getEffectiveActivity = (activity: Activity) => {
        const now = new Date()
        const deadline = new Date(activity.fechaLimite)

        // If deadline has passed and status is not "Terminada", change to "Dezfasada"
        if (deadline < now && activity.status.nombre !== "Terminada") {
            const dezfasadaStatus = statusList?.find(s => s.id === 2) // ID 2 is "Dezfasada"
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

    // Initialize displayed activities
    React.useEffect(() => {
        if (filteredAreas.length > 0) {
            setIsLoading(true)
            const initial: Record<number, Activity[]> = {}
            filteredAreas.forEach(area => {
                initial[area.id] = area.activities.slice(0, INITIAL_ITEMS)
            })
            setDisplayedActivities(initial)

            // Check if there are more items to load
            const hasMoreItems = filteredAreas.some(area => area.activities.length > INITIAL_ITEMS)
            setHasMore(hasMoreItems)

            // Simulate loading delay
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
        }
    }, [filteredAreas])

    const loadMore = React.useCallback(() => {
        if (isLoading) return
        
        setIsLoading(true)
        
        // Simulate async loading
        setTimeout(() => {
            const newDisplayed: Record<number, Activity[]> = {}
            let hasMoreItems = false
            
            filteredAreas.forEach(area => {
                const currentCount = displayedActivities[area.id]?.length || 0
                const newCount = Math.min(currentCount + ITEMS_PER_LOAD, area.activities.length)
                newDisplayed[area.id] = area.activities.slice(0, newCount)
                
                if (newCount < area.activities.length) {
                    hasMoreItems = true
                }
            })
            
            setDisplayedActivities(newDisplayed)
            setHasMore(hasMoreItems)
            setIsLoading(false)
        }, 300)
    }, [filteredAreas, displayedActivities, isLoading])

    const [loaderRef, scrollerRef] = useInfiniteScroll({
        hasMore,
        onLoadMore: loadMore,
    })

    // Get max rows needed
    const maxRows = React.useMemo(() => {
        return Math.max(...Object.values(displayedActivities).map(acts => acts.length), 1)
    }, [displayedActivities])

    return (
        <Table
            isHeaderSticky
            aria-label="Tabla de actividades por área"
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
                                {area.activities.length}
                            </Badge>
                        </div>
                    </TableColumn>
                ))}
            </TableHeader>
            <TableBody
                isLoading={isLoading}
                loadingContent={<Spinner color="default" />}
            >
                {Array.from({ length: maxRows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {filteredAreas.map((area) => {
                            const activity = displayedActivities[area.id]?.[rowIndex]
                            
                            return (
                                <TableCell key={area.id}>
                                    {activity ? (
                                        <ModalWithTabs activity={{ id: parseInt(activity.id), subject: activity.subject, date: activity.date}} statusList={statusList} usuarios={usuarios}>
                                            <div className="group p-4 rounded-xl bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer">
                                                {/* Título de la actividad */}
                                                <h4 className="font-semibold text-sm text-gray-800 mb-4 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                                                    {activity.subject.slice(0,35)}{activity.subject.length > 35 ? '...' : ''}
                                                </h4>
                                                
                                                {/* Fecha y Estado en la misma línea */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-gray-900 group-hover:text-blue-600" />
                                                        <span className="font-medium">
                                                            {formatDate(activity.date)}
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
                                    ) : rowIndex === 0 && displayedActivities[area.id]?.length === 0 ? (
                                        <div className="text-center py-6 text-default-400">
                                            <FileText className="w-5 h-5 mx-auto mb-2 opacity-40" />
                                            <p className="text-xs">Sin actividades</p>
                                        </div>
                                    ) : null}
                                </TableCell>
                            )
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}