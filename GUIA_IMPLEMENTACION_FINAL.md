# 🚀 Guía de Implementación Final - Paginación por Área

## ✅ Estado Actual

### Backend: ✅ COMPLETADO
- Endpoint `/api/actividades/area/:areaId` con paginación implementado
- Límite por defecto: 10 actividades por área
- Retorna estructura `{ data, meta }`

### Frontend: ✅ LISTO PARA INTEGRAR
- ✅ Servicio `actividadService.getActividadesByArea()` creado
- ✅ Hook `useActividadesByArea` creado y funcional
- ⏳ Falta: Integrar en el dashboard

---

## 📝 Pasos para Completar la Implementación

### Opción 1: Modificar `ActivityViewCard` (RECOMENDADO)

Esta es la forma más limpia y eficiente.

#### Paso 1: Localizar el archivo
```
components/cards/activityViewCard.tsx
```

#### Paso 2: Importar el hook
```typescript
import { useActividadesByArea } from '@/hooks/useActividadesByArea';
```

#### Paso 3: Modificar la firma del componente

**ANTES**:
```typescript
export function ActivityViewCard({ 
  area, 
  formatDate, 
  usuarios,
  actividades  // <-- Recibe todas las actividades
}) {
  // Filtra actividades del área
  const areaActivities = actividades.filter(act => act.area.id === area.id);
  
  return (
    // ... renderiza actividades
  );
}
```

**DESPUÉS**:
```typescript
export function ActivityViewCard({ 
  area, 
  formatDate, 
  usuarios
  // Ya NO recibe actividades como prop
}) {
  // Usar el hook para cargar actividades de esta área
  const {
    actividades: areaActivities,
    loading,
    loadingMore,
    hasMore,
    totalItems,
    loadMore
  } = useActividadesByArea(area.id, 10);

  // Mostrar loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{area.name}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {areaActivities.length} / {totalItems}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {areaActivities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay actividades en esta área
          </p>
        ) : (
          <>
            {/* Renderizar actividades */}
            {areaActivities.map(activity => (
              <ActivityItem 
                key={activity.id} 
                activity={activity}
                formatDate={formatDate}
                usuarios={usuarios}
              />
            ))}

            {/* Botón "Ver más" */}
            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loadingMore ? 'Cargando...' : 'Ver más actividades'}
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Paso 4: Actualizar el dashboard

En `activity-dashboard.tsx`, cambiar:

**ANTES**:
```typescript
<ActivityViewCard
  key={area.id}
  area={area}
  formatDate={formatDate}
  usuarios={usuarios}
  actividades={actividades}  // <-- Ya no pasar esto
/>
```

**DESPUÉS**:
```typescript
<ActivityViewCard
  key={area.id}
  area={area}
  formatDate={formatDate}
  usuarios={usuarios}
  // actividades ya no se pasa como prop
/>
```

---

### Opción 2: Crear Componente Wrapper (ALTERNATIVA)

Si no quieres modificar `ActivityViewCard`, crea un wrapper:

#### Crear archivo: `components/cards/PaginatedActivityViewCard.tsx`

```typescript
import { useActividadesByArea } from '@/hooks/useActividadesByArea';
import { ActivityViewCard } from './activityViewCard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function PaginatedActivityViewCard({ area, formatDate, usuarios }) {
  const {
    actividades,
    loading,
    loadingMore,
    hasMore,
    totalItems,
    loadMore
  } = useActividadesByArea(area.id, 10);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ActivityViewCard
        area={{ ...area, activities: actividades }}
        formatDate={formatDate}
        usuarios={usuarios}
        actividades={actividades}
      />
      
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md"
          >
            {loadingMore ? 'Cargando...' : `Ver más (${actividades.length}/${totalItems})`}
          </button>
        </div>
      )}
    </div>
  );
}
```

Luego en el dashboard:
```typescript
import { PaginatedActivityViewCard } from '@/components/cards/PaginatedActivityViewCard';

// Cambiar de:
<ActivityViewCard area={area} ... />

// A:
<PaginatedActivityViewCard area={area} ... />
```

---

## 🎨 Ejemplo Completo de UI

Aquí hay un ejemplo completo con mejor UI:

```typescript
import { useActividadesByArea } from '@/hooks/useActividadesByArea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronDown, Inbox } from 'lucide-react';

export function ActivityViewCard({ area, formatDate, usuarios }) {
  const {
    actividades,
    loading,
    loadingMore,
    hasMore,
    totalItems,
    currentPage,
    totalPages,
    loadMore
  } = useActividadesByArea(area.id, 10);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando actividades...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{area.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {actividades.length} / {totalItems}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {actividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No hay actividades en esta área
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Lista de actividades */}
            {actividades.map(activity => (
              <div 
                key={activity.id}
                className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <h4 className="font-medium text-sm">{activity.asunto}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(activity.fechaLimite)}
                </p>
              </div>
            ))}

            {/* Sección de paginación */}
            {hasMore && (
              <div className="pt-4 border-t">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Ver más actividades
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 🔄 Sincronización con Actualizaciones

Para que las actividades se actualicen cuando se crea/modifica una:

### En el hook `useActividadesByArea.ts`, agregar:

```typescript
// Dentro del hook, después del useEffect
useEffect(() => {
  const handleActivityUpdate = (event: CustomEvent) => {
    const { areaId: updatedAreaId } = event.detail;
    if (updatedAreaId === areaId) {
      refresh(); // Recargar actividades de esta área
    }
  };

  window.addEventListener('activity-updated', handleActivityUpdate as EventListener);
  window.addEventListener('activity-created', handleActivityUpdate as EventListener);

  return () => {
    window.removeEventListener('activity-updated', handleActivityUpdate as EventListener);
    window.removeEventListener('activity-created', handleActivityUpdate as EventListener);
  };
}, [areaId, refresh]);
```

### Al crear/actualizar actividad, disparar evento:

```typescript
// Después de crear una actividad
const newActivity = await createActividad(data);

// Disparar evento
window.dispatchEvent(new CustomEvent('activity-created', {
  detail: { areaId: newActivity.area.id }
}));
```

---

## 📊 Resultados Esperados

### Antes:
```
Dashboard carga:
- Área 1: TODAS sus actividades (ej: 50)
- Área 2: TODAS sus actividades (ej: 30)
- Área 3: TODAS sus actividades (ej: 45)
- Área 4: TODAS sus actividades (ej: 60)
Total: 185 actividades = ~96 MB
Tiempo: ~22 segundos
```

### Después:
```
Dashboard carga:
- Área 1: Primeras 10 actividades
- Área 2: Primeras 10 actividades
- Área 3: Primeras 10 actividades
- Área 4: Primeras 10 actividades
Total: 40 actividades = ~2-3 MB
Tiempo: ~1-2 segundos

Usuario puede "Ver más" en cada área para cargar 10 más
```

---

## ✅ Checklist Final

- [x] Backend con paginación implementado
- [x] Servicio `getActividadesByArea()` creado
- [x] Hook `useActividadesByArea` creado
- [ ] Modificar `ActivityViewCard` para usar el hook
- [ ] Agregar botón "Ver más" en cada área
- [ ] Probar carga inicial
- [ ] Probar botón "Ver más"
- [ ] Probar con áreas sin actividades
- [ ] Probar con áreas con pocas actividades
- [ ] Probar con áreas con muchas actividades
- [ ] Verificar rendimiento mejorado

---

## 🎯 Próximo Paso Inmediato

**Modificar el archivo**: `components/cards/activityViewCard.tsx`

1. Importar `useActividadesByArea`
2. Reemplazar el filtrado manual con el hook
3. Agregar botón "Ver más"
4. Probar en el navegador

---

**¿Necesitas ayuda para modificar `ActivityViewCard`?** 
Puedo hacerlo por ti si me compartes el contenido del archivo.

