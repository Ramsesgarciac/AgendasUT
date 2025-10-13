    "use client"

    import { Badge } from "@/components/ui/badge"
    import { FileText, Calendar } from "lucide-react"

    interface Activity {
    id: string
    subject: string
    fechaLimite: Date | string
    }

    interface Area {
    id: number
    name: string
    activities: Activity[]
    }

    interface ActivityTableProps {
    filteredAreas: Area[]
    formatDate: (dateString: string) => string
    }

    export function ActivityTable({ filteredAreas, formatDate }: ActivityTableProps) {
    return (
        <table className="w-full border-collapse border border-border rounded-lg">
        {/* Table Header */}
        <thead className="sticky top-0 bg-blue-500 z-10">
            <tr>
            {filteredAreas.map((area) => (
                <th
                key={area.id}
                className="border border-border p-2 lg:p-4 text-center min-w-[150px] lg:min-w-[200px] text-white"
                >
                <div className="flex items-center justify-center gap-2">
                    <span className="font-semibold text-lg lg:text-lg">{area.name}</span>
                    <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                    {area.activities.length}
                    </Badge>
                </div>
                </th>
            ))}
            </tr>
        </thead>

        {/* Table Body */}
        <tbody>
            <tr className="h-full">
            {filteredAreas.map((area) => (
                <td key={area.id} className="border border-border p-2 text-center lg:p-4 align-top h-full">
                <div className="space-y-2 lg:space-y-3">
                    {area.activities.length === 0 ? (
                    <div className="text-center py-4 lg:py-8 text-muted-foreground">
                        <FileText className="w-4 h-4 lg:w-6 lg:h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No hay actividades</p>
                    </div>
                    ) : (
                    area.activities.map((activity) => (
                        <div
                        key={activity.id}
                        className="p-2 lg:p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                        <h4 className="font-medium text-xs text-foreground mb-1 lg:mb-2 text-pretty">
                            {activity.subject}
                        </h4>
                        <div className="flex items-center justify-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            Fecha Límite: {formatDate(activity.fechaLimite as unknown as string)}
                        </div>
                        </div>
                    ))
                    )}
                </div>
                </td>
            ))}
            </tr>
        </tbody>
        </table>
    )
    }