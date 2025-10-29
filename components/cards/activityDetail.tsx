"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export function ModalWithTabs({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <Tabs defaultValue="apartado1" className="w-full p-3">
                <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-border h-auto p-0 rounded-none">
                <TabsTrigger
                    value="apartado1"
                    className="rounded-none data-[state=active]:bg-blue-200 data-[state=active]:shadow-none data-[state=inactive]:hover:bg-blue-800 data-[state=inactive]:hover:text-white transition-colors py-3"
                >
                    Apartado 1
                </TabsTrigger>
                <TabsTrigger
                    value="apartado2"
                    className="rounded-none data-[state=active]:bg-blue-200 data-[state=active]:shadow-none data-[state=inactive]:hover:bg-blue-800 data-[state=inactive]:hover:text-white transition-colors py-3"
                >
                    Apartado 2
                </TabsTrigger>
                </TabsList>
                <TabsContent value="apartado1" className="space-y-4 py-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Contenido del Apartado 1</h3>
                    <p className="text-muted-foreground">
                    Aquí puedes agregar el contenido que necesites para el primer apartado. Puede incluir formularios,
                    texto, imágenes o cualquier otro componente.
                    </p>
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm">Ejemplo de contenido adicional</p>
                    </div>
                </div>
                </TabsContent>

                <TabsContent value="apartado2" className="space-y-4 py-4">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Contenido del Apartado 2</h3>
                    <p className="text-muted-foreground">
                    Este es el contenido del segundo apartado. Puedes personalizar cada sección según tus necesidades
                    específicas.
                    </p>
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm">Otro ejemplo de contenido</p>
                    </div>
                </div>
                </TabsContent>
            </Tabs>
            </DialogHeader>
        </DialogContent>
        </Dialog>
    )
}
