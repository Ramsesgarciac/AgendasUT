"use client"

import { HeroUIProvider } from "@heroui/system"
import { AuthProvider } from "../lib/contexts/AuthContext"
import { TipoActividadProvider } from "../lib/contexts/TipoActividadContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <TipoActividadProvider>
          {children}
        </TipoActividadProvider>
      </AuthProvider>
    </HeroUIProvider>
  )
}