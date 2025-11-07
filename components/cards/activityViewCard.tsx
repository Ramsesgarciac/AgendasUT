import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@heroui/badge"
import { Calendar, FileText } from "lucide-react"
import { Area } from "@/types/area"
import { ModalWithTabs } from "./activityDetail"

interface ActivityViewCardProps {
    area: Area
    formatDate: (dateString: string) => string
    statusList?: any[]
    usuarios?: any[]
}

//restore
export function ActivityViewCard({ area, formatDate, statusList, usuarios }: ActivityViewCardProps) {
    return (
        <div className="border border-border rounded-lg bg-card">
        {/* Area Header */}
        <div className="p-4 border-b border-border bg-blue-500">
            <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">{area.name}</h3>
            <Badge variant="flat" className="bg-white/20 border-white/30 text-white">
                {area.activities.length}
            </Badge>
            </div>
        </div>

        {/* Activities List */}
        <div className="p-4">
            {area.activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
                <FileText className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No hay actividades</p>
            </div>
            ) : (
            <div className="space-y-3">
                {area.activities.map((activity) => (
                  <ModalWithTabs key={activity.id} activity={{ id: parseInt(activity.id), subject: activity.subject, date: activity.date }} statusList={statusList} usuarios={usuarios}>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                      <h4 className="font-medium text-sm text-foreground mb-2 text-pretty">
                        {activity.subject.slice(0,32)}{activity.subject.length > 24 ? '...' : ''}
                      </h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        Fecha Límite: {formatDate(activity.date)}
                      </div>
                    </div>
                  </ModalWithTabs>
                ))}
            </div>
            )}
        </div>
        </div>
    )
}