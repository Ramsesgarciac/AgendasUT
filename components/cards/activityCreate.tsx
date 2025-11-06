import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useJefaturas } from "@/hooks/useJefaturas"
import { ComboboxEditable } from "@/components/ui/combobox-editable" // Importa el nuevo componente

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
   isSubmitting?: boolean;
}

export function ActivityCreate({
   formData,
   areasWithActivities,
   handleInputChange,
   handleSubmit,
   setIsModalOpen,
   isSubmitting = false
}: ActivityCreateProps) {
    const { jefaturas } = useJefaturas();

    // Filter jefaturas by selected area
    const filteredJefaturas = formData.area
        ? jefaturas.filter(jefatura => jefatura.area.id.toString() === formData.area)
        : [];

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Crear Nueva Actividad</DialogTitle>
            </DialogHeader>

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
                        Área
                    </Label>
                    <Select value={formData.area} onValueChange={(value) => handleInputChange("area", value)} required>
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

                {/* Instancias con Combobox Editable */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Instancia Emisora */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="instanciaEmisora" className="text-sm font-medium">
                            Instancia Emisora
                        </Label>
                        <ComboboxEditable
                            value={formData.instanciaEmisora}
                            onChange={(value) => handleInputChange("instanciaEmisora", value)}
                            options={filteredJefaturas}
                            placeholder="Selecciona o escribe instancia emisora"
                            emptyMessage="No se encontraron instancias."
                        />
                    </div>

                    {/* Instancia Receptora */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="instanciaReceptora" className="text-sm font-medium">
                            Instancia Receptora
                        </Label>
                        <ComboboxEditable
                            value={formData.instanciaReceptora}
                            onChange={(value) => handleInputChange("instanciaReceptora", value)}
                            options={filteredJefaturas}
                            placeholder="Selecciona o escribe instancia receptora"
                            emptyMessage="No se encontraron instancias."
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
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                        {isSubmitting ? "Guardando..." : "Crear Actividad"}
                    </Button>
                </div>
            </form>
        </DialogContent>
    )
}