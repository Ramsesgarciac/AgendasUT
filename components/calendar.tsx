"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location?: string
  type: "meeting" | "deadline" | "event" | "reminder"
}

interface Activity {
  id: string
  subject: string
  date: string
  area: string
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Reunión de equipo",
    date: "2024-01-15",
    time: "10:00",
    location: "Sala de juntas",
    type: "meeting",
  },
  {
    id: "2",
    title: "Entrega de proyecto",
    date: "2024-01-18",
    time: "17:00",
    type: "deadline",
  },
  {
    id: "3",
    title: "Conferencia de tecnología",
    date: "2024-01-20",
    time: "09:00",
    location: "Centro de convenciones",
    type: "event",
  },
  {
    id: "4",
    title: "Revisión de código",
    date: "2024-01-22",
    time: "14:30",
    type: "reminder",
  },
]

const mockActivities: Activity[] = [
  { id: "1", subject: "Revisar código frontend", date: "2024-01-15", area: "Desarrollo" },
  { id: "2", subject: "Implementar API REST", date: "2024-01-16", area: "Desarrollo" },
  { id: "3", subject: "Testing unitario", date: "2024-01-17", area: "Desarrollo" },
  { id: "4", subject: "Campaña redes sociales", date: "2024-01-15", area: "Marketing" },
  { id: "5", subject: "Análisis de métricas", date: "2024-01-18", area: "Marketing" },
  { id: "6", subject: "Reunión con cliente", date: "2024-01-16", area: "Ventas" },
  { id: "7", subject: "Propuesta comercial", date: "2024-01-19", area: "Ventas" },
  { id: "8", subject: "Seguimiento leads", date: "2024-01-20", area: "Ventas" },
  { id: "11", subject: "Revisión presupuesto", date: "2024-01-18", area: "Finanzas" },
  { id: "12", subject: "Reporte mensual", date: "2024-01-22", area: "Finanzas" },
  { id: "13", subject: "Estudio de mercado", date: "2024-01-21", area: "Operaciones" },
  { id: "14", subject: "Análisis competencia", date: "2024-01-25", area: "Operaciones" },
  { id: "15", subject: "Resolver tickets", date: "2024-01-16", area: "Soporte" },
  { id: "16", subject: "Actualizar documentación", date: "2024-01-20", area: "Soporte" },
  { id: "17", subject: "Revisión QA", date: "2024-01-17", area: "Calidad" },
  { id: "18", subject: "Certificación ISO", date: "2024-01-24", area: "Calidad" },
  { id: "19", subject: "Estudio de mercado", date: "2024-01-21", area: "Investigación" },
  { id: "20", subject: "Análisis competencia", date: "2024-01-25", area: "Investigación" },
]

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function CalendarComponent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useState<Event[]>(mockEvents)
  const [activities] = useState<Activity[]>(mockActivities)

  const getEventTypeColor = (type: Event["type"]) => {
    const colors = {
      meeting: "bg-blue-100 text-blue-800 border-blue-200",
      deadline: "bg-red-100 text-red-800 border-red-200",
      event: "bg-green-100 text-green-800 border-green-200",
      reminder: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return colors[type]
  }

  const getEventTypeLabel = (type: Event["type"]) => {
    const labels = {
      meeting: "Reunión",
      deadline: "Fecha límite",
      event: "Evento",
      reminder: "Recordatorio",
    }
    return labels[type]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateString)
  }

  const getActivitiesForDate = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return activities.filter((activity) => activity.date === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)

  const upcomingEvents = [
    ...events.filter((event) => new Date(event.date) >= new Date()),
    ...activities
      .filter((activity) => new Date(activity.date) >= new Date())
      .map((activity) => ({
        id: activity.id,
        title: activity.subject,
        date: activity.date,
        time: "Todo el día",
        type: "reminder" as const,
        area: activity.area,
      })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Calendario</h2>
        <p className="text-muted-foreground">Organiza tus eventos y actividades</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const dayActivities = day ? getActivitiesForDate(day) : []
                  const totalItems = dayEvents.length + dayActivities.length

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border border-border rounded-md
                        ${day ? "bg-background hover:bg-muted/50" : "bg-muted/20"}
                        ${
                          day === new Date().getDate() &&
                          currentDate.getMonth() === new Date().getMonth() &&
                          currentDate.getFullYear() === new Date().getFullYear()
                            ? "bg-primary/10 border-primary"
                            : ""
                        }
                      `}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium mb-1">{day}</div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div key={event.id} className="text-xs p-1 rounded bg-blue-500/20 text-blue-700 truncate">
                                {event.title}
                              </div>
                            ))}
                            {dayActivities.slice(0, Math.max(0, 2 - dayEvents.length)).map((activity) => (
                              <div
                                key={activity.id}
                                className="text-xs p-1 rounded bg-green-500/20 text-green-700 truncate"
                              >
                                {activity.subject}
                              </div>
                            ))}
                            {totalItems > 2 && (
                              <div className="text-xs text-muted-foreground">+{totalItems - 2} más</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No hay eventos próximos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className={`${getEventTypeColor(event.type)} text-xs`}>
                          {"area" in event ? event.area : getEventTypeLabel(event.type)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </div>
                        {event.location && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
