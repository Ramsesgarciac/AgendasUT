import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@heroui/badge"
import { Calendar, FileText, AlertCircle } from "lucide-react"
import { Area } from "@/types/area"
import { ModalWithTabs } from "./activityDetail"
import { useStatus } from "@/hooks/useStatus"
import { useActividades } from "@/hooks/useActividades"

interface ActivityViewCardProps {
    area: Area
    formatDate: (dateString: string) => string
    statusList?: any[]
    usuarios?: any[]
}

//restore
export function ActivityViewCard({ area, formatDate, statusList, usuarios }: ActivityViewCardProps) {
    const { status: hookStatusList } = useStatus()
    const { actividades } = useActividades()
    const statusListToUse = statusList || hookStatusList
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
                {area.activities.map((activity) => {
                  // Find the full activity data from the actividades hook to get status
                  const fullActivity = actividades.find(act => act.id === parseInt(activity.id))
                  const activityStatus = statusListToUse.find(s => s.id === fullActivity?.status?.id)

                  return (
                    <ModalWithTabs key={activity.id} activity={{ id: parseInt(activity.id), subject: activity.subject, date: activity.date }} statusList={statusList} usuarios={usuarios}>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                        <h4 className="font-medium text-sm text-foreground mb-2 text-pretty">
                          {activity.subject.slice(0,32)}{activity.subject.length > 24 ? '...' : ''}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                          <Calendar className="w-3 h-3 mr-1" />
                          Fecha Límite: {formatDate(activity.date)}
                        </div>
                        {activityStatus ? (
                          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="w-3 h-3 text-purple-600" />
                              <p className="text-xs font-medium text-purple-700">Estado</p>
                            </div>
                            <p className="text-sm font-bold text-purple-900">
                              {activityStatus.nombre}
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Estado no disponible
                          </div>
                        )}
                      </div>
                    </ModalWithTabs>
                  )
                })}
            </div>
            )}
        </div>
        </div>
    )
}