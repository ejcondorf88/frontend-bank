# 📋 Historias de Usuario - Prueba Técnica Frontend

**Proyecto:** Sistema de Gestión de Productos Financieros  
**Tecnología:** Angular 17+ con Signals  
**API:** http://localhost:3002

---

## 🎯 Nivel Junior (F1, F2, F3)

### 📖 Historia J-001: Listado de Productos Financieros
**Funcionalidad:** F1

**Como** usuario del sistema bancario  
**Quiero** visualizar un listado de productos financieros disponibles  
**Para que** pueda conocer las opciones que ofrece el banco

#### Criterios de Aceptación:
- [x] Consumir endpoint `GET /bp/products` al cargar la aplicación
- [x] Mostrar datos: id, nombre, descripción, logo, fecha de liberación, fecha de revisión
- [x] Implementar maquetación según diseño D1
- [x] Usar CSS manual (sin Bootstrap/Tailwind)
- [x] Mostrar skeletons/pantalla de carga mientras carga la API
- [x] Manejar errores visualmente si la API falla

#### Notas Técnicas:
- Usar Angular Signals para el estado
- Crear interfaz `Product` en TypeScript
- Implementar servicio `ProductService`

---

### 📖 Historia J-002: Búsqueda de Productos
**Funcionalidad:** F2

**Como** usuario del sistema  
**Quiero** buscar productos mediante un campo de texto  
**Para que** pueda encontrar rápidamente el producto que necesito

#### Criterios de Aceptación:
- [x] Implementar campo de búsqueda en la parte superior del listado
- [x] Filtrar productos en tiempo real por nombre o descripción
- [x] Mostrar resultados filtrados sin recargar la página
- [x] Permitir búsqueda case-insensitive
- [x] Mostrar mensaje "No se encontraron resultados" si no hay coincidencias
- [x] Implementar debounce (esperar 300ms después de escribir)

#### Notas Técnicas:
- Usar `computed()` para filtrar la lista
- Implementar búsqueda local (no llamar a API)

---

### 📖 Historia J-003: Paginación y Cantidad de Registros
**Funcionalidad:** F3

**Como** usuario del sistema  
**Quiero** poder seleccionar cuántos registros mostrar por página  
**Para que** pueda controlar la cantidad de información visualizada

#### Criterios de Aceptación:
- [x] Mostrar contador: "Mostrando X de Y productos"
- [x] Implementar select con opciones: 5, 10, 20 registros
- [x] Valor por defecto: 5 registros
- [x] Actualizar listado inmediatamente al cambiar el select
- [x] Mostrar paginación si hay más registros que el límite seleccionado

#### Notas Técnicas:
- Usar Signal para `pageSize` y `currentPage`
- Implementar paginación con `slice()` en el array

---

## 🎯🎯 Nivel Semi-Senior (F1, F2, F3, F4 + F5 deseable)

### 📖 Historia SS-001: Listado de Productos Financieros
**Funcionalidad:** F1 (Mejorada)

**Como** usuario del sistema bancario  
**Quiero** visualizar productos financieros con navegación por rutas  
**Para que** tenga una experiencia de navegación fluida

#### Criterios de Aceptación:
- [ ] Implementar lazy loading para el módulo de productos
- [ ] Crear ruta `/products` para el listado
- [ ] Usar standalone components
- [ ] Implementar skeleton screens mientras carga
- [ ] Cachear respuesta de API durante 5 minutos
- [ ] Scroll infinito (opcional) en lugar de paginación tradicional

#### Notas Técnicas:
- Usar Angular Router con lazy loading
- Implementar Signals en Store global
- Usar `httpResource()` (Angular 21+)

---

### 📖 Historia SS-002: Búsqueda Avanzada de Productos
**Funcionalidad:** F2 (Mejorada)

**Como** usuario del sistema  
**Quiero** buscar productos con filtros múltiples  
**Para que** pueda refinar mi búsqueda

#### Criterios de Aceptación:
- [ ] Búsqueda por texto (nombre/descripción)
- [ ] Filtro por tipo de producto (dropdown)
- [ ] Filtro por rango de fechas
- [ ] Limpiar filtros con botón "Limpiar"
- [ ] Persistir filtros en URL (query params)
- [ ] Mostrar badges de filtros activos

#### Notas Técnicas:
- Usar URL query parameters con `ActivatedRoute`
- Implementar `computed()` para filtros combinados

---

### 📖 Historia SS-003: Paginación Responsiva
**Funcionalidad:** F3 (Mejorada)

**Como** usuario del sistema  
**Quiero** una paginación adaptable a dispositivos móviles  
**Para que** pueda usar la aplicación en cualquier pantalla

#### Criterios de Aceptación:
- [ ] Paginación completa en desktop
-- [ ] Botones "Anterior/Siguiente" en móvil
- [ ] Select de registros funcionando en todos los dispositivos
- [ ] Mostrar rango de resultados (ej: "1-5 de 25")
- [ ] Responsive design: adaptarse a mobile, tablet, desktop

#### Notas Técnicas:
- Media queries en CSS
- Breakpoints: mobile < 768px, tablet 768-1024px, desktop > 1024px

---

### 📖 Historia SS-004: Agregar Nuevo Producto
**Funcionalidad:** F4 (OBLIGATORIO para Semi-Senior)

**Como** administrador del sistema  
**Quiero** agregar nuevos productos financieros  
**Para que** pueda expandir la oferta del banco

#### Criterios de Aceptación:
- [x] Botón "Agregar" visible en listado (Diseño D3)
- [x] Navegar a formulario en ruta `/products/new`
- [x] Campos del formulario (Diseño D2):
  - **ID**: Requerido, min 3, max 10 caracteres
  - **Nombre**: Requerido, min 5, max 100 caracteres
  - **Descripción**: Requerido, min 10, max 200 caracteres
  - **Logo**: Requerido, URL válida
  - **Fecha Liberación**: Requerido, >= fecha actual
  - **Fecha Revisión**: Requerido, exactamente 1 año después de liberación
- [x] Validar que ID no existe vía `GET /bp/products/verification/:id`
- [x] Botón "Agregar" para enviar formulario
- [x] Botón "Reiniciar" para limpiar formulario
- [x] Mostrar errores visuales por campo
- [x] Redirigir a listado tras éxito

#### Validaciones Técnicas:
```typescript
// ID
Validators.required,
Validators.minLength(3),
Validators.maxLength(10),
asyncValidators: [idExistsValidator] // llamar a API

// Nombre
Validators.required,
Validators.minLength(5),
Validators.maxLength(100)

// Descripción
Validators.required,
Validators.minLength(10),
Validators.maxLength(200)

// Logo
Validators.required,
Validators.pattern(/^https?:\/\/.+/)

// Fecha Liberación
Validators.required,
Validators.min(new Date())

// Fecha Revisión
Validators.required,
Validators.custom((fechaRevision) => 
  fechaRevision === fechaLiberacion + 1 año
)
```

---

### 📖 Historia SS-005: Editar Producto (DESEABLE)
**Funcionalidad:** F5 (Opcional para Semi-Senior)

**Como** administrador del sistema  
**Quiero** editar productos existentes  
**Para que** pueda actualizar la información

#### Criterios de Aceptación:
- [x] Menú dropdown en cada producto (Diseño D3)
- [x] Opción "Editar" en el menú
- [x] Navegar a `/products/:id/edit`
- [x] Cargar datos del producto seleccionado
- [x] Campo ID deshabilitado (no editable)
- [x] Mantener mismas validaciones que en creación
- [x] Prevenir navegación si hay cambios sin guardar

---

## 🎯🎯🎯 Nivel Senior (F1, F2, F3, F4, F5, F6 + Optimizaciones)

### 📖 Historia SR-001: Listado con Rendimiento Óptimo
**Funcionalidad:** F1 (Avanzado)

**Como** usuario del sistema  
**Quiero** ver el listado de productos con carga instantánea  
**Para que** tenga la mejor experiencia posible

#### Criterios de Aceptación:
- [ ] Implementar virtual scrolling para listados grandes (>100 items)
- [ ] OnPush Change Detection por defecto
- [ ] Precarga de datos con resolvers
- [ ] Skeletons personalizados por tipo de contenido
- [ ] Caché de imágenes con service worker
- [ ] Time-to-First-Byte < 200ms
- [ ] Lighthouse Performance Score > 90

#### Notas Técnicas:
- Usar `@defer` para carga diferida de componentes pesados
- Implementar OnPush en todos los componentes
- Optimizar imágenes (WebP, lazy loading)

---

### 📖 Historia SR-002: Búsqueda Server-Side
**Funcionalidad:** F2 (Avanzado)

**Como** usuario del sistema  
**Quiero** búsqueda en tiempo real con resultados inmediatos  
**Para que** encuentre productos sin importar la cantidad de datos

#### Criterios de Aceptación:
- [ ] Debounce optimizado (200ms)
- [ ] Cancelar peticiones anteriores (switchMap/race condition handling)
- [ ] Indicador visual de búsqueda en progreso
- [ ] Resultados con highlight del término buscado
- [ ] Búsqueda preservada en URL (shareable)
- [ ] Soporte para búsqueda por voz (Web Speech API)

---

### 📖 Historia SR-003: Paginación Inteligente
**Funcionalidad:** F3 (Avanzado)

**Como** usuario en dispositivo móvil  
**Quiero** una paginación que se adapte a mi contexto  **Para que** navegue eficientemente

#### Criterios de Aceptación:
- [ ] Scroll infinito con botón "Cargar más" alternativo
- [ ] Detección de conexión lenta (mostrar menos registros)
- [ ] Paginación URL-based (`?page=2&limit=10`)
- [ ] Preservar scroll al navegar back
- [ ] Botón "Volver arriba" tras scroll extenso

---

### 📖 Historia SR-004: CRUD Completo con Optimistic UI
**Funcionalidad:** F4 (Avanzado)

**Como** administrador  
**Quiero** gestionar productos con feedback inmediato  **Para que** mi flujo de trabajo sea eficiente

#### Criterios de Aceptación:
- [ ] Optimistic updates (actualizar UI antes de confirmación API)
- [ ] Rollback automático si falla la petición
- [ ] Undo action (deshacer última operación)
- [ ] Validaciones asíncronas en tiempo real
- [ ] Autosave de formularios en localStorage
- [ ] Detección de cambios sin guardar (guard)
- [ ] Modo offline con sincronización

---

### 📖 Historia SR-005: Edición Avanzada
**Funcionalidad:** F5 (OBLIGATORIO para Senior)

**Como** administrador  
**Quiero** editar productos con controles de calidad  **Para que** mantenga la integridad de los datos

#### Criterios de Aceptación:
- [ ] Comparación visual de cambios (diff)
- [ ] Preview antes de guardar
- [ ] Edición en modal inline (opcional)
- [ ] Conflict resolution si otro usuario editó el mismo registro
- [ ] Historial de cambios (audit log local)
- [ ] Hotkeys (Ctrl+S para guardar)

---

### 📖 Historia SR-006: Eliminación con Confirmación
**Funcionalidad:** F6 (OBLIGATORIO para Senior)

**Como** administrador  
**Quiero** eliminar productos de forma segura  **Para que** evite eliminaciones accidentales

#### Criterios de Aceptación:
- [x] Opción "Eliminar" en menú dropdown (Diseño D3)
- [x] Modal de confirmación (Diseño D4) con:
  - Nombre del producto destacado
  - Advertencia de irreversibilidad
  - Checkbox "Entiendo que esta acción no se puede deshacer"
  - Botón "Cancelar" (primario)
  - Botón "Eliminar" (destructivo, rojo)
- [x] Eliminar producto vía `DELETE /bp/products/:id`
- [x] Feedback visual de éxito (toast notification)
- [x] Actualización optimista del listado
- [x] Undo disponible por 5 segundos
- [x] Soft delete (ocultar pero no eliminar de estado local)

---

### 📖 Historia SR-007: Responsive Design Enterprise
**Característica transversal**

**Como** usuario en cualquier dispositivo  
**Quiero** una interfaz perfecta en mobile, tablet y desktop  **Para que** trabaje desde cualquier lugar

#### Criterios de Aceptación:
- [ ] Mobile-first design
- [ ] Breakpoints: 320px, 768px, 1024px, 1440px
- [ ] Touch targets mínimo 44x44px
- [ ] Soporte modo oscuro/claro automático
- [ ] Accesibilidad WCAG 2.1 AA:
  - Contraste 4.5:1 mínimo
  - Navegación por teclado
  - ARIA labels
  - Screen reader compatible
- [ ] PWA: instalable, offline, push notifications

---

### 📖 Historia SR-008: Manejo Global de Errores
**Característica transversal**

**Como** usuario  
**Quiero** ver mensajes de error claros y útiles  **Para que** entienda qué salió mal

#### Criterios de Aceptación:
- [ ] Interceptor HTTP para errores 4xx/5xx
- [ ] Toast notifications con diferentes niveles:
  - Error: operaciones fallidas
  - Warning: validaciones
  - Success: operaciones exitosas
  - Info: mensajes informativos
- [ ] Página 404 personalizada
- [ ] Retry automático con exponential backoff
- [ ] Fallback UI cuando todo falla

---

## 📊 Matriz de Responsabilidades

| Funcionalidad | Junior | Semi-Senior | Senior |
|--------------|--------|-------------|--------|
| **F1** - Listado | ✅ Básico | ✅ + Lazy loading | ✅ + Virtual scroll |
| **F2** - Búsqueda | ✅ Local | ✅ + Query params | ✅ + Server-side |
| **F3** - Paginación | ✅ Básica | ✅ + Responsive | ✅ + URL-based |
| **F4** - Agregar | ❌ | ✅ Completo | ✅ + Optimistic UI |
| **F5** - Editar | ❌ | 🔄 Opcional | ✅ Obligatorio |
| **F6** - Eliminar | ❌ | ❌ | ✅ Obligatorio |
| Tests 70%+ | ⚠️ Intentar | ✅ Obligatorio | ✅ > 80% |
| Responsive | ⚠️ Intentar | ✅ Básico | ✅ Avanzado |
| Performance | ❌ | ⚠️ Intentar | ✅ Obligatorio |
| Accesibilidad | ❌ | ⚠️ Intentar | ✅ Obligatorio |

**Leyenda:**
- ✅ Obligatorio
- 🔄 Opcional/Deseable
- ⚠️ Intentar/Sugerido
- ❌ No requerido

---

## 🎨 Relación con Diseños

| Diseño | Historias | Nivel |
|--------|-----------|-------|
| **D1** - Listado | J-001, J-002, J-003, SS-001, SS-002, SS-003, SR-001, SR-002, SR-003 | Todos |
| **D2** - Formularios | SS-004, SS-005, SR-004, SR-005 | Semi-Senior+ |
| **D3** - Botón y Menú | SS-004, SS-005, SR-006 | Semi-Senior+ |
| **D4** - Modal | SR-006 | Solo Senior |

---

## 🧪 Criterios de Calidad

### Para Todos los Niveles:
- [ ] Clean Code (nombres descriptivos, funciones pequeñas)
- [ ] SOLID principles
- [ ] Sin frameworks CSS (Bootstrap/Tailwind)
- [ ] Manejo de errores visual
- [ ] TypeScript estricto habilitado

### Semi-Senior adicional:
- [ ] Tests unitarios 70%+ coverage
- [ ] Lazy loading implementado
- [ ] Rutas configuradas

### Senior adicional:
- [ ] Tests 80%+ coverage con Jest
- [ ] Rendimiento optimizado
- [ ] Responsive completo
- [ ] Accesibilidad implementada
- [ ] Skeletons en todos los estados de carga

---

## 🚀 Checklist de Entrega

### Junior:
- [ ] F1, F2, F3 funcionando
- [ ] Código limpio y ordenado
- [ ] Sin errores de compilación
- [ ] UI responsive básico

### Semi-Senior:
- [ ] Todo lo de Junior +
- [ ] F4 completo con validaciones
- [ ] Tests 70%+ coverage
- [ ] Rutas implementadas
- [ ] F5 deseable (si hay tiempo)

### Senior:
- [ ] Todo lo de Semi-Senior +
- [ ] F5 y F6 completos
- [ ] Tests 80%+ con Jest
- [ ] Rendimiento optimizado
- [ ] Responsive avanzado
- [ ] Accesibilidad implementada
- [ ] Skeletons en todas las pantallas de carga

---

**Nota:** Estas historias están diseñadas para ser implementadas con Angular 17+, Signals, Standalone Components y las mejores prácticas modernas de Angular.
