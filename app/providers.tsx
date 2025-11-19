"use client"

import { HeroUIProvider } from "@heroui/system"
import { AuthProvider } from "../lib/contexts/AuthContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  )
}