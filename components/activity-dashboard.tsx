"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Plus,
  Calendar,
  FileText,
  ChevronDown,
  Home,
  StickyNote,
  CalendarDays,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Notes } from "@/components/notes"
import { CalendarComponent } from "@/components/calendar"
import { Area, Activity } from '@/types/area';
import { useAreas } from '@/hooks/useAreas';
import { useActividades } from '@/hooks/useActividades';

const getColorClasses = (color: Area["color"]) => {
  const colorMap = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    secondary: "bg-secondary/10 border-secondary/20 text-secondary",
    accent: "bg-accent/10 border-accent/20 text-accent-foreground",
    "chart-4": "bg-chart-4/10 border-chart-4/20 text-chart-4",
    "chart-5": "bg-chart-5/10 border-chart-5/20 text-chart-5",
  }
  return colorMap[color]
}

export default function ActivityDashboard() {
  const { areas, loading, error } = useAreas();
  const { actividades } = useActividades();
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"dashboard" | "notes" | "calendar">("dashboard")
  const [formData, setFormData] = useState({
    subject: "",
    area: "",
    instance: "",
    dueDate: "",
    activityType: "",
    note: "",
  })

  // Cerrar sidebar en móvil al cambiar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initialize selectedAreaIds when areas load
  useEffect(() => {
    if (areas.length > 0) {
      setSelectedAreaIds(areas.map((area) => area.id));
    }
  }, [areas]);

  const areasWithActivities = useMemo(() => areas.map(area => ({ ...area, activities: actividades.filter(act => act.area.id === area.id).map(act => ({ id: act.id.toString(), subject: act.asunto, date: new Date(act.fechaLimite).toISOString().split('T')[0] })) })), [areas, actividades]);

  const filteredAreas = selectedAreaIds.length === 0 ? [] : areasWithActivities.filter((area) => selectedAreaIds.includes(area.id))

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleAreaToggle = (areaId: number) => {
    setSelectedAreaIds((prev) => (prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]))
  }

  const handleSelectAll = () => {
    setSelectedAreaIds(areasWithActivities.map((area) => area.id))
  }

  const handleClearAll = () => {
    setSelectedAreaIds([])
  }

  const getSelectedAreasText = () => {
    if (selectedAreaIds.length === 0) return "Ningún área seleccionada"
    if (selectedAreaIds.length === areasWithActivities.length) return "Todas las áreas"
    if (selectedAreaIds.length === 1) {
      const area = areasWithActivities.find((a) => a.id === selectedAreaIds[0])
      return area?.name || ""
    }
    return `${selectedAreaIds.length} áreas seleccionadas`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nueva actividad:", formData)
    setIsModalOpen(false)
    setFormData({
      subject: "",
      area: "",
      instance: "",
      dueDate: "",
      activityType: "",
      note: "",
    })
  }

  const renderDashboardContent = () => {
    if (currentView === "notes") {
      return <Notes />
    }

    if (currentView === "calendar") {
      return <CalendarComponent />
    }

    if (loading) {
      return <div className="h-full flex items-center justify-center">Loading areas...</div>;
    }

    if (error) {
      return <div className="h-full flex items-center justify-center">Error loading areas: {error}</div>;
    }

    return (
      <>
        {selectedAreaIds.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No hay áreas seleccionadas</h3>
              <p className="text-sm">Selecciona al menos un área para ver las actividades</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex h-full">
              <div className="w-full">
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
                                    {formatDate(activity.date)}
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
              </div>
            </div>

            <div className="md:hidden overflow-auto">
              <div className="space-y-4">
                {filteredAreas.map((area) => (
                  <div key={area.id} className="border border-border rounded-lg bg-card">
                    {/* Area Header */}
                    <div className="p-4 border-b border-border bg-blue-500">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-white">{area.name}</h3>
                        <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
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
                            <div key={activity.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                              <h4 className="font-medium text-sm text-foreground mb-2 text-pretty">
                                {activity.subject}
                              </h4>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(activity.date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#1F355E] text-white transform transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        h-full
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-blue-800 flex items-center justify-between">
            {!isSidebarCollapsed && <h2 className="text-lg font-semibold">UTVCO</h2>}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-white hover:bg-blue-800 p-1 h-8 w-8"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-blue-800 p-1 h-8 w-8"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {/* Home/Tablero */}
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === "dashboard"
                    ? "bg-blue-800 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
                onClick={() => setCurrentView("dashboard")}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Tablero</span>}
              </button>

              {/* Notas */}
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === "notes"
                    ? "bg-blue-800 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
                onClick={() => setCurrentView("notes")}
              >
                <StickyNote className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Notas</span>}
              </button>

              {/* Calendario */}
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentView === "calendar"
                    ? "bg-blue-800 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
                onClick={() => setCurrentView("calendar")}
              >
                <CalendarDays className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Calendario</span>}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} overflow-hidden`}
      >
        <div className="p-4 md:p-6 lg:p-8 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>

              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  {currentView === "dashboard" && "Tablero de Actividades"}
                  
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {currentView === "dashboard" && "Gestiona las actividades de todas las áreas de la UTVCO"}
                </p>
              </div>
            </div>

            {currentView === "dashboard" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[250px] justify-between bg-transparent">
                      <span className="truncate">{getSelectedAreasText()}</span>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <div className="p-3 border-b border-border">
                      <div className="flex justify-between items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs">
                          Seleccionar todas
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
                          Limpiar
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {areasWithActivities.map((area) => (
                        <div
                          key={area.id}
                          className="flex items-center space-x-2 p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleAreaToggle(area.id)}
                        >
                          <Checkbox
                            checked={selectedAreaIds.includes(area.id)}
                            onChange={() => handleAreaToggle(area.id)}
                          />
                          <span className="text-sm flex-1">{area.name}</span>
                          <Badge variant="outline" className={`${getColorClasses(area.color)} text-xs`}>
                            {area.activities.length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">Crear Nueva Actividad</DialogTitle>
                    </DialogHeader>

                    <Card className="border-0 shadow-none">
                      <CardContent className="p-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Asunto */}
                          <div className="space-y-2">
                            <Label htmlFor="subject" className="text-sm font-medium">
                              Asunto
                            </Label>
                            <Input
                              id="subject"
                              placeholder="Ingresa el asunto de la actividad"
                              value={formData.subject}
                              onChange={(e) => handleInputChange("subject", e.target.value)}
                              required
                              className="w-full"
                            />
                          </div>

                          {/* Área */}
                          <div className="space-y-2">
                            <Label htmlFor="area" className="text-sm font-medium">
                              Área
                            </Label>
                            <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un área" />
                              </SelectTrigger>
                              <SelectContent>
                                {areasWithActivities.map((area) => (
                                  <SelectItem key={area.id} value={area.id.toString()}>
                                    {area.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Instancia + Fecha Límite en la misma fila */}
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Instancia */}
                            <div className="flex-1 space-y-2">
                              <Label htmlFor="instance" className="text-sm font-medium">
                                Instancia
                              </Label>
                              <Input
                                id="instance"
                                placeholder="Ingresa la instancia"
                                value={formData.instance}
                                onChange={(e) => handleInputChange("instance", e.target.value)}
                                className="w-full"
                              />
                            </div>

                            {/* Fecha Límite */}
                            <div className="flex-1 space-y-2">
                              <Label htmlFor="dueDate" className="text-sm font-medium">
                                Fecha Límite *
                              </Label>
                              <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                                required
                                className="w-full"
                              />
                            </div>
                          </div>
                          {/* Tipo de Actividad */}
                          <div className="space-y-2">
                            <Label htmlFor="activityType" className="text-sm font-medium">
                              Tipo de Actividad
                            </Label>
                            <Input
                              id="activityType"
                              placeholder="Ingresa la actividad"
                              value={formData.activityType}
                              onChange={(e) => handleInputChange("activityType", e.target.value)}
                              className="w-full"
                            />
                          </div>

                          {/* Nota */}
                          <div className="space-y-2">
                            <Label htmlFor="note" className="text-sm font-medium">
                              Agregar Nota
                            </Label>
                            <Textarea
                              id="note"
                              placeholder="Agrega una nota o descripción adicional..."
                              value={formData.note}
                              onChange={(e) => handleInputChange("note", e.target.value)}
                              className="w-full min-h-[100px] resize-none"
                            />
                          </div>

                          {/* Botones */}
                          <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              Crear Actividad
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">{renderDashboardContent()}</div>
      </div>
    </div>
  )
}

export { ActivityDashboard }
