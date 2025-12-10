# 📋 Modificaciones Backend - Paginación por Área

## 🎯 Objetivo

Modificar el endpoint de actividades por área para soportar paginación, permitiendo cargar solo 10 actividades por área inicialmente.

---

## 🔧 Cambios Requeridos en el Backend

### 1. Modificar Endpoint: `GET /api/actividades/area/:areaId`

#### Ubicación del Archivo:
```
/api/actividades/area/[areaId]/route.ts
```

#### Cambios a Implementar:

**ANTES** (Sin paginación):
```typescript
export async function GET(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  const areaId = parseInt(params.areaId);
  
  // Retorna TODAS las actividades del área
  const actividades = await prisma.actividad.findMany({
    where: { idArea: areaId },
    include: {
      area: true,
      userCreate: true,
      status: true,
      documentos: true,
      comentarios: true,
      coleccionComentarios: true
    },
    orderBy: { id: 'desc' }
  });
  
  return NextResponse.json(actividades);
}
```

**DESPUÉS** (Con paginación):
```typescript
export async function GET(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  const areaId = parseInt(params.areaId);
  const { searchParams } = new URL(request.url);
  
  // Obtener parámetros de paginación
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Validaciones
  if (page < 1) {
    return NextResponse.json(
      { error: 'El número de página debe ser mayor a 0' },
      { status: 400 }
    );
  }
  
  if (limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'El límite debe estar entre 1 y 100' },
      { status: 400 }
    );
  }
  
  // Calcular offset
  const skip = (page - 1) * limit;
  
  // Obtener total de actividades del área
  const total = await prisma.actividad.count({
    where: { idArea: areaId }
  });
  
  // Obtener actividades paginadas
  const actividades = await prisma.actividad.findMany({
    where: { idArea: areaId },
    include: {
      area: true,
      userCreate: true,
      status: true,
      documentos: true,
      comentarios: true,
      coleccionComentarios: true
    },
    orderBy: { id: 'desc' },
    skip: skip,
    take: limit
  });
  
  // Calcular metadata
  const totalPages = Math.ceil(total / limit);
  
  // Retornar respuesta paginada
  return NextResponse.json({
    data: actividades,
    meta: {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages
    }
  });
}
```

---

## 📝 Ejemplos de Uso del Nuevo Endpoint

### Obtener primeras 10 actividades del área 5:
```bash
GET /api/actividades/area/5?page=1&limit=10
```

**Respuesta**:
```json
{
  "data": [
    {
      "id": 100,
      "asunto": "Actividad ejemplo",
      "descripcion": "...",
      "area": { "id": 5, "name": "Academica" },
      // ... más campos
    },
    // ... 9 actividades más
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Obtener siguientes 10 actividades:
```bash
GET /api/actividades/area/5?page=2&limit=10
```

### Obtener 20 actividades por página:
```bash
GET /api/actividades/area/5?page=1&limit=20
```

---

## 🎨 Comportamiento Esperado

### Escenario 1: Área con 8 actividades
```
GET /api/actividades/area/3?page=1&limit=10

Respuesta:
{
  "data": [ /* 8 actividades */ ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Escenario 2: Área con 25 actividades
```
GET /api/actividades/area/4?page=1&limit=10

Respuesta:
{
  "data": [ /* 10 actividades */ ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}

// Segunda página
GET /api/actividades/area/4?page=2&limit=10
{
  "data": [ /* 10 actividades */ ],
  "meta": {
    "total": 25,
    "page": 2,
    "limit": 10,
    "totalPages": 3
  }
}

// Tercera página
GET /api/actividades/area/4?page=3&limit=10
{
  "data": [ /* 5 actividades */ ],
  "meta": {
    "total": 25,
    "page": 3,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

## ✅ Validaciones a Implementar

1. **Validar `page`**:
   - Debe ser un número entero
   - Debe ser mayor a 0
   - Si no se proporciona, usar 1 por defecto

2. **Validar `limit`**:
   - Debe ser un número entero
   - Debe estar entre 1 y 100
   - Si no se proporciona, usar 10 por defecto

3. **Validar `areaId`**:
   - Debe ser un número entero válido
   - El área debe existir en la base de datos

---

## 🔄 Compatibilidad

### Retrocompatibilidad:
Si no se proporcionan parámetros de paginación, el endpoint usará valores por defecto:
- `page = 1`
- `limit = 10`

Esto significa que las llamadas existentes seguirán funcionando, pero retornarán solo las primeras 10 actividades.

---

## 📊 Beneficios

### Performance:
- ✅ Reduce el tamaño de la respuesta
- ✅ Mejora el tiempo de respuesta del servidor
- ✅ Reduce el uso de memoria en el cliente

### Escalabilidad:
- ✅ Funciona bien con áreas que tienen muchas actividades
- ✅ El rendimiento no se degrada con el crecimiento de datos

### UX:
- ✅ Carga inicial más rápida
- ✅ Usuario puede cargar más si lo necesita
- ✅ Mejor experiencia en dispositivos móviles

---

## 🧪 Testing Recomendado

### Casos de Prueba:

1. **Sin parámetros** (valores por defecto):
   ```bash
   GET /api/actividades/area/5
   # Debe retornar primeras 10 actividades
   ```

2. **Con parámetros válidos**:
   ```bash
   GET /api/actividades/area/5?page=2&limit=10
   # Debe retornar actividades 11-20
   ```

3. **Página inválida**:
   ```bash
   GET /api/actividades/area/5?page=0
   # Debe retornar error 400
   ```

4. **Límite inválido**:
   ```bash
   GET /api/actividades/area/5?limit=150
   # Debe retornar error 400
   ```

5. **Área sin actividades**:
   ```bash
   GET /api/actividades/area/999?page=1&limit=10
   # Debe retornar data: [], meta: { total: 0, ... }
   ```

6. **Última página parcial**:
   ```bash
   # Si hay 25 actividades total
   GET /api/actividades/area/5?page=3&limit=10
   # Debe retornar solo 5 actividades
   ```

---

## 📋 Checklist de Implementación

- [ ] Modificar endpoint `/api/actividades/area/[areaId]/route.ts`
- [ ] Agregar parámetros de query `page` y `limit`
- [ ] Implementar validaciones
- [ ] Calcular `skip` y `take` para Prisma
- [ ] Obtener `total` con `count()`
- [ ] Calcular `totalPages`
- [ ] Retornar estructura `{ data, meta }`
- [ ] Probar con diferentes escenarios
- [ ] Verificar que funciona sin parámetros (retrocompatibilidad)
- [ ] Actualizar documentación de API

---

## 🚀 Próximo Paso

Una vez implementado este cambio en el backend, el frontend podrá:
1. Cargar solo 10 actividades por área inicialmente
2. Mostrar un botón "Ver más" en cada área
3. Cargar más actividades bajo demanda
4. Mostrar progreso ("Mostrando X de Y")

---

**Fecha**: 2025-12-10
**Prioridad**: Alta
**Impacto**: Mejora significativa de rendimiento
