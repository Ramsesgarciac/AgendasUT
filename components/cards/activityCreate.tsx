    import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
    import { Card, CardContent } from "@/components/ui/card"
    import { Input } from "@/components/ui/input"
    import { Label } from "@/components/ui/label"
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
    import { Textarea } from "@/components/ui/textarea"
    import { Button } from "@/components/ui/button"
    import { useComentarios } from "@/hooks/useComentarios"

    interface ActivityCreateProps {
      formData: {
        subject: string;
        area: string;
        instanciaEmisora: string;
        instanciaReceptora: string;
        dueDate: string;
        activityType: string;
        note: string;
        comment: string;
      };
      areasWithActivities: any[];
      handleInputChange: (field: string, value: string) => void;
      handleSubmit: (e: React.FormEvent) => Promise<void>;
      setIsModalOpen: (open: boolean) => void;
    }

    export function ActivityCreate({
      formData,
      areasWithActivities,
      handleInputChange,
      handleSubmit,
      setIsModalOpen
    }: ActivityCreateProps) {
    return (
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
                {/* Instancia Emisora */}
                <div className="flex-1 space-y-2">
                    <Label htmlFor="instanciaEmisora" className="text-sm font-medium">
                    Instancia Emisora
                    </Label>
                    <Input
                    id="instanciaEmisora"
                    placeholder="Ingresa la instancia emisora"
                    value={formData.instanciaEmisora}
                    onChange={(e) => handleInputChange("instanciaEmisora", e.target.value)}
                    className="w-full"
                    />
                </div>

                <div className="flex-1 space-y-2">
                    <Label htmlFor="instanciaReceptora" className="text-sm font-medium">
                    Instancia Receptora
                    </Label>
                    <Input
                    id="instanciaReceptora"
                    placeholder="Ingresa la instancia receptora"
                    value={formData.instanciaReceptora}
                    onChange={(e) => handleInputChange("instanciaReceptora", e.target.value)}
                    className="w-full"
                    />
                </div>
                </div>

                {/* Fecha Límite */}
                <div className="space-y-2">
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
                {/* Tipo de Actividad */}
                <div className="space-y-2">
                    <Label htmlFor="activityType" className="text-sm font-medium">
                        Tipo de Actividad
                    </Label>
                    <Input
                        id="activityType"
                        placeholder="Ingresa el tipo de actividad"
                        value={formData.activityType}
                        onChange={(e) => handleInputChange("activityType", e.target.value)}
                        className="w-full"
                    />
                </div>
    
                {/* Comentario */}
                <div className="space-y-2">
                    <Label htmlFor="comment" className="text-sm font-medium">
                        Comentario
                    </Label>
                    <Textarea
                        id="comment"
                        placeholder="Agrega un comentario inicial..."
                        value={formData.comment}
                        onChange={(e) => handleInputChange("comment", e.target.value)}
                        className="w-full min-h-[80px] resize-none"
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
    )
}