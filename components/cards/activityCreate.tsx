import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useJefaturas } from "@/hooks/useJefaturas"
import { ComboboxInput } from "@/components/ui/combobox-input"
import { useMemo } from "react"

interface ActivityCreateProps {
    formData: {
        subject: string;
        descripcion: string;
        area: string;
        instanciaEmisora: string;
        instanciaReceptora: string;
        dueDate: string;
        activityType: string;
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
    const { jefaturas, loading: jefaturasLoading, error: jefaturasError } = useJefaturas();

    // Filtrar y mapear jefaturas según el área seleccionada
    const jefaturasOptions = useMemo(() => {
        if (!formData.area || jefaturas.length === 0) return [];
        
        return jefaturas
            .filter((jefatura) => jefatura.area.id === parseInt(formData.area))
            .map((jefatura) => ({
                value: jefatura.nombre,
                label: jefatura.nombre
            }));
    }, [formData.area, jefaturas]);

    return (
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                    Crear Nueva Actividad
                </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-4" id="activity-form">
                    {/* Asunto */}
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">
                            Asunto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="subject"
                            placeholder="Ingresa el asunto de la actividad"
                            value={formData.subject}
                            onChange={(e) => handleInputChange("subject", e.target.value)}
                            required
                            className="w-full border-2"
                            maxLength={100}
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="descripcion" className="text-sm font-medium">
                            Descripción
                        </Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Ingresa la descripción de la actividad"
                            value={formData.descripcion}
                            onChange={(e) => handleInputChange("descripcion", e.target.value)}
                            className="w-full min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Área */}
                    <div className="space-y-2">
                        <Label htmlFor="area" className="text-sm font-medium">
                            Área <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={formData.area} 
                            onValueChange={(value) => {
                                handleInputChange("area", value);
                                // Limpiar las instancias al cambiar de área
                                handleInputChange("instanciaEmisora", "");
                                handleInputChange("instanciaReceptora", "");
                            }} 
                            required
                        >
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

                    {/* Instancia Emisora e Instancia Receptora */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Instancia Emisora */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="instanciaEmisora" className="text-sm font-medium">
                                Instancia Emisora
                            </Label>
                            <ComboboxInput
                                value={formData.instanciaEmisora}
                                onValueChange={(value) => handleInputChange("instanciaEmisora", value)}
                                options={jefaturasOptions}
                                placeholder={
                                    !formData.area 
                                        ? "Primero selecciona un área" 
                                        : jefaturasLoading 
                                        ? "Cargando..." 
                                        : "Selecciona o escribe..."
                                }
                                disabled={!formData.area || jefaturasLoading}
                                emptyMessage="No hay jefaturas disponibles"
                            />
                        </div>

                        {/* Instancia Receptora */}
                        <div className="space-y-2 min-w-0">
                            <Label htmlFor="instanciaReceptora" className="text-sm font-medium">
                                Instancia Receptora
                            </Label>
                            <ComboboxInput
                                value={formData.instanciaReceptora}
                                onValueChange={(value) => handleInputChange("instanciaReceptora", value)}
                                options={jefaturasOptions}
                                placeholder={
                                    !formData.area 
                                        ? "Primero selecciona un área" 
                                        : jefaturasLoading 
                                        ? "Cargando..." 
                                        : "Selecciona o escribe..."
                                }
                                disabled={!formData.area || jefaturasLoading}
                                emptyMessage="No hay jefaturas disponibles"
                            />
                        </div>
                    </div>

                    {/* Mostrar error si existe */}
                    {jefaturasError && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                            <strong>Error:</strong> {jefaturasError}
                        </div>
                    )}

                    {/* Fecha Límite y Tipo de Actividad */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Fecha Límite */}
                        <div className="space-y-2">
                            <Label htmlFor="dueDate" className="text-sm font-medium">
                                Fecha Límite <span className="text-red-500">*</span>
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
                                placeholder="Ej: Reunión, Tarea..."
                                value={formData.activityType}
                                onChange={(e) => handleInputChange("activityType", e.target.value)}
                                className="w-full"
                            />
                        </div>
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
                </form>
            </div>

            {/* Botones - Footer fijo */}
            <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/50">
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        form="activity-form"
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Crear Actividad
                    </Button>
                </div>
            </div>
        </DialogContent>
    )
}