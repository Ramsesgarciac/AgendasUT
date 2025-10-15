"use client"

import React from "react"
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
} from "@heroui/react"
import { useInfiniteScroll } from "@heroui/use-infinite-scroll"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar } from "lucide-react"
import { Area, Activity } from "@/types/area"
//se necesita el props para rrealizar que la card de createactividades tenga en cuenta la la lista de areas
interface ActivityTableProps {
    filteredAreas: Area[]
    formatDate: (dateString: string) => string
}

export function ActivityTable({ filteredAreas, formatDate }: ActivityTableProps) {
    const [displayedActivities, setDisplayedActivities] = React.useState<Record<number, Activity[]>>({})
    const [hasMore, setHasMore] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const INITIAL_ITEMS = 8
    const ITEMS_PER_LOAD = 3

    // Initialize displayed activities
    React.useEffect(() => {
        setIsLoading(true)
        const initial: Record<number, Activity[]> = {}
        filteredAreas.forEach(area => {
            initial[area.id] = area.activities.slice(0, INITIAL_ITEMS)
        })
        setDisplayedActivities(initial)
        
        // Check if there are more items to load
        const hasMoreItems = filteredAreas.some(area => area.activities.length > INITIAL_ITEMS)
        setHasMore(hasMoreItems)
        setIsLoading(false)
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
                        className="min-w-[150px] lg:min-w-[100px]"
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
                                        <div className="p-3 rounded-lg bg-default-50 border border-default-200 hover:bg-default-100 transition-all duration-200 cursor-pointer shadow-sm">
                                            <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">
                                                {activity.subject.slice(0, 24)}{activity.subject.length > 24 ? '...' : ''}    
                                            </h4>
                                            <div className="flex items-center text-xs text-default-500">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                                <span className="truncate">
                                                    {formatDate(activity.date)}
                                                </span>
                                            </div>
                                        </div>
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