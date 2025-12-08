"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@heroui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ChevronDown, Menu, FileText } from "lucide-react"

// Dynamic imports con suspense
const Notes = dynamic(() => import("@/app/notes/page").then(mod => ({ default: mod.Notes })), {
  loading: () => <div className="flex items-center justify-center h-full">Cargando notas...</div>,
  ssr: false
});

const CalendarComponent = dynamic(() => import("@/app/calendar/page").then(mod => ({ default: mod.CalendarComponent })), {
  loading: () => <div className="flex items-center justify-center h-full">Cargando calendario...</div>,
  ssr: false
});

const ActivityCreate = dynamic(() => import('@/components/cards/activityCreate').then(mod => ({ default: mod.ActivityCreate })), {
  loading: () => <div className="flex items-center justify-center p-4">Cargando...</div>,
  ssr: false
});

const DocumentCreate = dynamic(() => import('@/components/cards/documentCreate').then(mod => ({ default: mod.DocumentCreate })), {
  loading: () => <div className="flex items-center justify-center p-4">Cargando...</div>,
  ssr: false
});

const ActivityTable = dynamic(() => import('@/components/tables/activityTable').then(mod => ({ default: mod.ActivityTable })), {
  loading: () => <div className="flex items-center justify-center p-4">Cargando tabla...</div>,
  ssr: false
});

const ActivityViewCard = dynamic(() => import('@/components/cards/activityViewCard').then(mod => ({ default: mod.ActivityViewCard })), {
  loading: () => <div className="flex items-center justify-center p-4">Cargando tarjetas...</div>,
  ssr: false
});

const SidebarHeader = dynamic(() => import('@/components/nav/sidebar').then(mod => ({ default: mod.SidebarHeader })), {
  loading: () => <div className="h-16 bg-blue-500"></div>,
  ssr: false
});

const SidebarNav = dynamic(() => import('@/components/nav/sidebar').then(mod => ({ default: mod.SidebarNav })), {
  loading: () => <div className="flex-1 bg-blue-500"></div>,
  ssr: false
});

const SidebarFooter = dynamic(() => import('@/components/nav/sidebar').then(mod => ({ default: mod.SidebarFooter })), {
  loading: () => <div className="h-16 bg-blue-500"></div>,
  ssr: false
});

import { Area } from '@/types/area';
import { Actividad } from '@/types/actividad';
import { useAreas } from '@/hooks/useAreas';
import { useActividades } from '@/hooks/useActividades';
import { useTipoActividades } from '@/hooks/useTipoActividades';
import { useTipoAreas } from '@/hooks/useTipoAreas';
import { useComentarios } from '@/hooks/useComentarios';
import { useColeccionComentarios } from '@/hooks/useColeccionComentarios';
import { useStatus } from '@/hooks/useStatus';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useDocumentos } from '@/hooks/useDocumentos';

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
  // Hooks - cargar solo una vez
  const { areas, loading: areasLoading, error: areasError } = useAreas();
  const { actividades, loading: actividadesLoading, error: actividadesError, createActividad } = useActividades();
  const { tipoActividades } = useTipoActividades();
  const { tipoAreas, loading: tipoAreasLoading, error: tipoAreasError } = useTipoAreas();
  const { createComentario } = useComentarios();
  const { status: statusList } = useStatus();
  const { usuarios } = useUsuarios();
  const { user } = useAuth();
  const { createAcuseActividad } = useDocumentos(); // NUEVO: Hook para crear acuse

  const loading = areasLoading || actividadesLoading || tipoAreasLoading;
  const error = areasError || actividadesError || tipoAreasError;

  // Estados
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([])
  const [selectedTipoAreaId, setSelectedTipoAreaId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [createdActivityId, setCreatedActivityId] = useState<number | null>(null)
  const [createdActivity, setCreatedActivity] = useState<Actividad | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState<"dashboard" | "notes" | "calendar">("dashboard")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    descripcion: "",
    area: "",
    instanciaEmisora: "",
    instanciaReceptora: "",
    dueDate: "",
    activityType: "",
    comment: "",
  })

  // Responsive sidebar
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

  // Initialize selectedAreaIds - solo cuando areas cambia y user está disponible
  useEffect(() => {
    if (areas.length > 0 && user && user.areas && selectedAreaIds.length === 0) {
      const userAreaIds = user.areas.map((area) => area.id);
      setSelectedAreaIds(userAreaIds);
    }
  }, [areas.length, user]); // Dependencia incluye user

  // Initialize selectedTipoAreaId
  useEffect(() => {
    if (tipoAreas.length > 0 && selectedTipoAreaId === null) {
      setSelectedTipoAreaId(tipoAreas[0].id);
    }
  }, [tipoAreas.length]); // Dependencia optimizada

  // Memoización pesada - solo recalcular cuando cambian areas o actividades
  const areasWithActivities = useMemo(() => {
    if (!areas.length || !actividades.length) return areas;
    
    return areas.map(area => ({
      ...area,
      activities: actividades
        .filter(act => act.area.id === area.id)
        .map(act => ({
          ...act,
          id: act.id.toString(),
          subject: act.asunto,
          date: act.fechaLimite.toString(),
          // Ensure status is properly mapped, with fallback
          status: act.status || statusList.find(s => s.id === (act as any).statusId) || { id: 1, nombre: "En Proceso" }
        }))
    }));
  }, [areas, actividades, statusList]);

  const filteredAreasByTipo = useMemo(() => {
    if (selectedTipoAreaId === null) return areasWithActivities;
    return areasWithActivities.filter((area) => area.tipoArea?.id === selectedTipoAreaId);
  }, [areasWithActivities, selectedTipoAreaId]);

  const filteredAreas = useMemo(() => {
    if (selectedAreaIds.length === 0) return [];
    return filteredAreasByTipo.filter((area) => selectedAreaIds.includes(area.id));
  }, [filteredAreasByTipo, selectedAreaIds]);

  // Funciones memoizadas
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }, []);

  const handleAreaToggle = useCallback((areaId: number) => {
    setSelectedAreaIds((prev) => 
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId]
    )
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAreaIds(filteredAreasByTipo.map((area) => area.id))
  }, [filteredAreasByTipo]);

  const handleClearAll = useCallback(() => {
    setSelectedAreaIds([])
  }, []);

  const handleTipoAreaSelect = useCallback((tipoAreaId: number) => {
    setSelectedTipoAreaId(tipoAreaId)
  }, []);

  const getSelectedTipoAreasText = useCallback(() => {
    if (selectedTipoAreaId === null) return "Ningún tipo de área seleccionada"
    const tipoArea = tipoAreas.find((ta) => ta.id === selectedTipoAreaId)
    return tipoArea?.nombre || ""
  }, [selectedTipoAreaId, tipoAreas]);

  const getSelectedAreasText = useCallback(() => {
    if (selectedAreaIds.length === 0) return "Ningún área seleccionada"
    if (selectedAreaIds.length === areasWithActivities.length) return "Todas las áreas"
    if (selectedAreaIds.length === 1) {
      const area = areasWithActivities.find((a) => a.id === selectedAreaIds[0])
      return area?.name || ""
    }
    return `${selectedAreaIds.length} áreas seleccionadas`
  }, [selectedAreaIds, areasWithActivities]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, []);

  // ============================================
  // FUNCIÓN ACTUALIZADA CON CREACIÓN DE ACUSE
  // ============================================
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const userId = user?.id || 1;
      
      // ============================================
      // PASO 1: CREAR LA ACTIVIDAD
      // ============================================
      console.log('📝 Paso 1: Creando actividad...');
      
      const payload: any = {
        asunto: formData.subject,
        descripcion: formData.descripcion,
        instanciaReceptora: formData.instanciaReceptora,
        instanciaEmisora: formData.instanciaEmisora,
        tipoActividad: formData.activityType,
        fechaLimite: formData.dueDate,
        idArea: parseInt(formData.area),
        idUserCreate: userId,
        statusId: 1,
        crearColeccionComentarios: true,
      };
      
      const nuevaActividad = await createActividad(payload);
      console.log('✅ Actividad creada exitosamente:', nuevaActividad);

      // Enriquecer con área y status
      const areaSeleccionada = areas.find(a => a.id === parseInt(formData.area));
      const defaultStatus = statusList.find(s => s.id === payload.statusId) || { id: payload.statusId, nombre: "En Proceso" };
      
      if (areaSeleccionada) {
        nuevaActividad.area = areaSeleccionada;
      }
      nuevaActividad.status = defaultStatus;

      // ============================================
      // PASO 2: CREAR EL ACUSE DE LA ACTIVIDAD
      // ============================================
      console.log('📄 Paso 2: Generando acuse para actividad ID:', nuevaActividad.id);
      
      try {
        // Para acuses de creación de actividad, no hay entrega aún
        // Usar 0 como entregaId temporal hasta que se cree una entrega real
        const entregaId = 0;

        await createAcuseActividad(nuevaActividad, userId, entregaId);
        console.log('✅ Acuse creado y asociado a la actividad');
        
      } catch (acuseError) {
        // Si falla el acuse, NO fallar todo el proceso
        // La actividad ya está creada correctamente
        console.warn('⚠️ No se pudo crear el acuse automáticamente:', acuseError);
        
        // Opcional: Puedes mostrar una notificación al usuario
        // toast?.({
        //   title: "Actividad creada",
        //   description: "La actividad se creó correctamente, pero no se pudo generar el acuse automático.",
        // });
      }

      // ============================================
      // PASO 3: AGREGAR COMENTARIO INICIAL (Opcional)
      // ============================================
      if (formData.comment.trim()) {
        console.log('💬 Paso 3: Agregando comentario inicial...');
        createComentario({
          contenido: formData.comment,
          idActividad: nuevaActividad.id,
          idUsuario: userId,
        }).catch(err => console.error("⚠️ Error creando comentario:", err));
      }

      // ============================================
      // PASO 4: LIMPIAR Y CERRAR
      // ============================================
      
      // Cerrar modal y abrir diálogo de documento
      setIsModalOpen(false)
      setCreatedActivityId(nuevaActividad.id);
      setCreatedActivity(nuevaActividad);
      setShowDocumentDialog(true);

      // Resetear form
      setFormData({
        subject: "",
        descripcion: "",
        area: "",
        instanciaEmisora: "",
        instanciaReceptora: "",
        dueDate: "",
        activityType: "",
        comment: "",
      })
      
      console.log('🎉 Proceso completado exitosamente');
      
    } catch (error) {
      console.error("❌ Error creando actividad:", error);
      // Aquí puedes agregar notificación de error si tienes sistema de toast
      // toast?.({ title: "Error", description: "No se pudo crear la actividad" });
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, createActividad, areas, createComentario, createAcuseActividad, user, statusList]);

  const renderDashboardContent = useCallback(() => {
    if (currentView === "notes") return <Notes />
    if (currentView === "calendar") return <CalendarComponent />

    if (loading) {
      return <div className="h-full flex items-center justify-center">Cargando áreas...</div>;
    }

    if (error) {
      return <div className="h-full flex items-center justify-center">Error: {error}</div>;
    }

    if (selectedAreaIds.length === 0) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay áreas seleccionadas</h3>
            <p className="text-sm">Selecciona al menos un área para ver las actividades</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="hidden md:flex h-full">
          <ActivityTable 
            filteredAreas={filteredAreas} 
            formatDate={formatDate} 
            statusList={statusList} 
            usuarios={usuarios} 
          />
        </div>

        <div className="md:hidden overflow-auto">
          <div className="space-y-4">
            {filteredAreas.map((area) => (
              <ActivityViewCard 
                key={area.id} 
                area={area} 
                formatDate={formatDate}
                usuarios={usuarios}
                actividades={actividades}
              />
            ))}
          </div>
        </div>
      </>
    );
  }, [currentView, loading, error, selectedAreaIds, filteredAreas, formatDate, statusList, usuarios]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-[#1F355E] text-white transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          h-full
        `}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <SidebarNav
            currentView={currentView}
            setCurrentView={setCurrentView}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <SidebarFooter
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 pl-2 overflow-hidden">
        <div className="pl-0 pr-2 pt-2 pb-2 md:pl-1 md:pr-4 md:pt-4 md:pb-4 lg:pl-2 lg:pr-6 lg:pt-6 lg:pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>

              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                  {currentView === "dashboard" && "Tablero de Actividades"}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {currentView === "dashboard" && `Gestiona las actividades de ${getSelectedTipoAreasText().toLowerCase()} de la UTVCO`}
                </p>
              </div>
            </div>

            {currentView === "dashboard" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[250px] justify-between bg-transparent">
                      <span className="truncate">{getSelectedTipoAreasText()}</span>
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="end">
                    <div className="max-h-[300px] overflow-y-auto">
                      {tipoAreas.map((tipoArea) => (
                        <div
                          key={tipoArea.id}
                          className="flex items-center space-x-2 p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleTipoAreaSelect(tipoArea.id)}
                        >
                          <input
                            type="radio"
                            name="tipoArea"
                            checked={selectedTipoAreaId === tipoArea.id}
                            onChange={() => handleTipoAreaSelect(tipoArea.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm flex-1">{tipoArea.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

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
                      {filteredAreasByTipo.map((area) => (
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
                          <Badge variant="flat" className={`${getColorClasses(area.color)} text-xs`}>
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
                  <ActivityCreate
                    formData={formData}
                    areasWithActivities={areasWithActivities}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    setIsModalOpen={setIsModalOpen}
                    isSubmitting={isSubmitting}
                  />
                </Dialog>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 pl-0 pr-2 pt-2 pb-2 md:pl-1 md:pr-4 md:pt-4 md:pb-4 lg:pl-2 lg:pr-6 lg:pt-6 lg:pb-6 overflow-auto">
          {renderDashboardContent()}
        </div>
      </div>

      {createdActivityId && createdActivity && (
        <DocumentCreate
          activityId={createdActivityId}
          actividad={createdActivity}
          isOpen={showDocumentDialog}
          onClose={() => setShowDocumentDialog(false)}
        />
      )}
    </div>
  )
}

export { ActivityDashboard }