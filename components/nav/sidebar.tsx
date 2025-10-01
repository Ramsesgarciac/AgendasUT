import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Home, StickyNote, CalendarDays } from "lucide-react"

interface SidebarHeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
}

export function SidebarHeader({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  setIsSidebarOpen
}: SidebarHeaderProps) {
  return (
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
  )
}

interface SidebarNavProps {
  currentView: "dashboard" | "notes" | "calendar";
  setCurrentView: (view: "dashboard" | "notes" | "calendar") => void;
  isSidebarCollapsed: boolean;
}

export function SidebarNav({
  currentView,
  setCurrentView,
  isSidebarCollapsed
}: SidebarNavProps) {
  return (
    <nav className="flex-1 p-4">
      <div className="space-y-2">
        {/* Home/Tablero */}
        <button
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            currentView === "dashboard"
              ? "bg-blue-800 text-white"
              : "text-blue-100 hover:bg-blue-800 hover:text-white"
          } ${isSidebarCollapsed ? "justify-center" : ""}`}
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
          } ${isSidebarCollapsed ? "justify-center" : ""}`}
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
          } ${isSidebarCollapsed ? "justify-center" : ""}`}
          onClick={() => setCurrentView("calendar")}
        >
          <CalendarDays className="w-5 h-5 flex-shrink-0" />
          {!isSidebarCollapsed && <span className="font-medium">Calendario</span>}
        </button>
      </div>
    </nav>
  )
}