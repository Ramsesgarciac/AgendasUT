import { Badge } from "@heroui/badge"
import { Calendar, FileText, AlertCircle } from "lucide-react"
import { Area } from "@/types/area"
import { Status } from "@/types/status"
import { ModalWithTabs } from "./activityDetail"
import { useMemo } from "react"

interface ActivityViewCardProps {
    area: Area
    formatDate: (dateString: string) => string
    usuarios?: any[]
    // Actividades completas del padre
    actividades?: any[]
}

export function ActivityViewCard({ 
    area, 
    formatDate, 
    usuarios = [],
    actividades = []
}: ActivityViewCardProps) {
    
    // Crear un mapa de actividades por ID para búsqueda O(1)
    const actividadesMap = useMemo(() => {
        const map = new Map();
        actividades.forEach(act => {
            map.set(act.id, act);
        });
        return map;
    }, [actividades]);

    // Pre-procesar las actividades del área con su información completa
    const enrichedActivities = useMemo(() => {
        return area.activities.map(activity => {
            const fullActivity = actividadesMap.get(parseInt(activity.id));
            
            return {
                ...activity,
                fullActivity,
                status: fullActivity?.status || null // Extraer el status directamente
            };
        });
    }, [area.activities, actividadesMap]);

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
                        {enrichedActivities.map(({ id, subject, date, status }) => (
                            <ModalWithTabs 
                                key={id} 
                                activity={{ 
                                    id: parseInt(id), 
                                    subject, 
                                    date 
                                }} 
                                
                                usuarios={usuarios}
                            >
                                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <h4 className="font-medium text-sm text-foreground mb-2 text-pretty">
                                        {subject.slice(0, 32)}{subject.length > 32 ? '...' : ''}
                                    </h4>
                                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Fecha Límite: {formatDate(date)}
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