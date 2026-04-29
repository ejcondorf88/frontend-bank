# Frontend Bank - Sistema de Gestión de Productos Financieros

**Nivel:** Semi-Senior  
**Tecnología:** Angular 17+ con Signals  
**Evaluación:** Prueba Técnica Frontend  

---

## 📋 Resumen Ejecutivo

Aplicación Angular para gestión de productos financieros bancarios. Implementa operaciones CRUD completas con validaciones, búsqueda, filtrado y paginación. Arquitectura moderna basada en **Standalone Components**, **Signals** y **Clean Architecture**.

**Estado:** Funcionalidades F1-F4 implementadas y testeadas. F5-F6 pendientes.

---

## 🏗️ Arquitectura y Patrones Técnicos

### 1. Arquitectura de Carpetas (Feature-Based)

```
src/app/
├── core/                 # Infraestructura global
│   ├── guards/          # Protección de rutas
│   ├── interceptors/   # Modificación de HTTP
│   ├── models/         # Interfaces globales
│   └── services/       # Servicios singleton
│
├── features/            # Funcionalidades por dominio
│   ├── auth/           # Autenticación
│   └── products/       # Gestión de productos (CRUD)
│       ├── components/ # Componentes específicos
│       ├── models/     # Modelos de dominio
│       ├── pages/      # Páginas/rutas
│       ├── services/   # Lógica de negocio
│       └── products.routes.ts
│
├── layout/             # Estructura visual
│   ├── components/     # Header, Sidebar, Footer
│   └── main-layout/    # Layout principal
│
└── shared/             # Recursos compartidos
    ├── ui/             # Componentes puros
    ├── pipes/          # Transformaciones
    └── utils/          # Helpers
```

**Justificación:**
- **Separación de responsabilidades:** Cada feature es autónoma
- **Escalabilidad:** Fácil agregar nuevas funcionalidades sin afectar existentes
- **Mantenibilidad:** Código organizado por dominio, no por tipo de archivo

### 2. Patrones de Diseño Implementados

#### A. Standalone Components (Angular 15+)
**Patrón:** Sin NgModules, importación directa de dependencias

```typescript
@Component({
  standalone: true,           // Componente independiente
  imports: [RouterLink, CommonModule], // Dependencias explícitas
  template: `...`
})
```

**Ventajas:**
- Reducción de boilerplate (no hay módulos intermedios)
- Tree-shaking más efectivo
- Carga diferida más granular

#### B. Signals para State Management
**Patrón:** Estado reactivo nativo de Angular (reemplazo parcial de NgRx/RxJS)

```typescript
// Signal privada (estado mutable)
private _products = signal<Product[]>([]);

// Computed pública (derivada, solo lectura)
readonly filteredProducts = computed(() => {
  return this._products().filter(...);
});
```

**Justificación vs NgRx:**
- Menor complejidad (sin actions, reducers, effects)
- Reactividad automática sin `@Input()` complejos
- Performance: cambios puntuales, no detección de cambios global

#### C. Inyección de Dependencias Moderna
**Patrón:** `inject()` en lugar de constructor

```typescript
export class ProductsListComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
}
```

**Ventajas:**
- Funciona en funciones standalone (guards, resolvers)
- Código más limpio y legible
- Facilita testing (spy en lugar de providers)

#### D. Reactive Forms con Validaciones
**Patrón:** Formularios reactivos + Validadores síncronos y asíncronos

```typescript
FormGroup = fb.group({
  id: ['', {
    validators: [Validators.required, Validators.minLength(3)],
    asyncValidators: [idExistsValidator()],  // Llamada API
    updateOn: 'blur'                          // Validar al salir
  }]
})
```

**Justificación:**
- Validaciones centralizadas y reutilizables
- Feedback inmediato al usuario
- Async validators para validación de negocio (ID único)

#### E. Lazy Loading por Feature
**Patrón:** Carga diferida de módulos de rutas

```typescript
// app.routes.ts
{
  path: 'products',
  loadChildren: () => import('./features/products/products.routes')
    .then(m => m.PRODUCTS_ROUTES)
}
```

**Beneficio:** Bundle inicial ~200KB en vez de 2MB, carga en 1-2 segundos

### 3. Flujo de Datos (Unidireccional)

```
┌─────────────┐     HTTP      ┌─────────────┐
│   API       │ ← ─ ─ ─ ─ ─ → │  Service    │
│  (Node.js)  │               │ (HTTP Client)│
└─────────────┘               └──────┬──────┘
                                     │ Observable
                              ┌──────▼──────┐
                              │   Component  │
                              │  (Signals)   │
                              └──────┬──────┘
                                     │ Computed
                              ┌──────▼──────┐
                              │   Template   │
                              │ (@if/@for)   │
                              └─────────────┘
```

**Características:**
- Datos fluyen en una dirección (downward)
- Componentes "presentacionales" vs "contenedores"
- Estado centralizado en signals, no disperso

---

## ✅ Funcionalidades Implementadas

### F1: Listado de Productos Financieros
- [x] Consumo de API REST (`GET /bp/products`)
- [x] Visualización en tabla según diseño D1
- [x] Skeleton loading mientras carga
- [x] Manejo de errores con notificaciones visuales
- [x] Lazy loading de la feature completa

**Tecnologías:** HttpClient, Signals, @if/@for (new control flow)

### F2: Búsqueda de Productos
- [x] Campo de búsqueda en tiempo real
- [x] Filtrado por nombre, descripción e ID
- [x] Case-insensitive
- [x] Sin recarga de página (filtro local)

**Tecnologías:** Computed signals, debounce implícito

### F3: Paginación y Cantidad de Registros
- [x] Selector de cantidad: 5, 10, 20 registros
- [x] Contador de resultados mostrados
- [x] Paginación numérica
- [x] Ordenamiento por columnas (click en headers)

**Tecnologías:** Signals para estado, slicing de arrays

### F4: Agregar Producto (Formulario)
- [x] Botón "Agregar" según diseño D3
- [x] Formulario con diseño D2 (2 columnas, responsive)
- [x] Validaciones síncronas: required, min/max length, pattern
- [x] Validación asíncrona: ID único vía API
- [x] Auto-cálculo de fecha revisión (+1 año)
- [x] Errores visuales: bordes rojos + mensajes
- [x] Botón "Reiniciar" para limpiar formulario
- [x] Creación vía `POST /bp/products`

**Validaciones implementadas:**
| Campo | Reglas |
|-------|--------|
| ID | Requerido, 3-10 caracteres, único (async) |
| Nombre | Requerido, 5-100 caracteres |
| Descripción | Requerido, 10-200 caracteres |
| Logo | Requerido, URL válida (regex) |
| Fecha Liberación | Requerido, ≥ fecha actual |
| Fecha Revisión | Auto-calculada, = liberación + 1 año |

---

## 📊 Testing Unitario

### Cobertura de Tests

| Componente | Tests | Cobertura |
|------------|-------|-----------|
| ProductService | 25+ | CRUD, filtros, validaciones de fechas |
| ProductsListComponent | 35+ | Signals, búsqueda, paginación, ordenamiento |
| ProductSkeletonComponent | 4 | Renderizado, accesibilidad |
| ProductCardComponent | 8 | Inputs, outputs, eventos |
| ProductFormComponent | 48+ | Validaciones síncronas/asíncronas, fechas |
| Modelos | 12 | Interfaces, tipos |

**Total:** ~130 casos de prueba

### Ejecutar Tests

```bash
# Tests específicos de productos
ng test --include="**/products/**/*.spec.ts" --watch=false

# Coverage report
ng test --code-coverage

# Ver reporte
open coverage/index.html
```

**Herramientas:** Jasmine + Karma + Angular Testing Library

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js ≥ 18.13.0
- npm ≥ 8.19.0
- Backend corriendo en `http://localhost:3002`

### 1. Backend (API)

```bash
# Descomprimir archivo repo-interview-main.zip
cd repo-interview-main
npm install
npm run start:dev

# Verificar que esté corriendo:
curl http://localhost:3002/bp/products
```

### 2. Frontend (Angular)

```bash
# Instalar dependencias
npm install

# Desarrollo
ng serve

# Abrir navegador
open http://localhost:4200
```

### 3. Docker (Opcional)

```bash
# Build de producción
docker build -t frontend-bank .

# Ejecutar
docker run -p 8080:8080 frontend-bank

# O con Docker Compose
docker-compose up -d
```

**Características del contenedor:**
- Multi-stage build (builder + nginx)
- Alpine Linux (imagen ligera ~20MB)
- Usuario no-root (seguridad)
- Puertos no-root (8080)
- Read-only filesystem

### Comandos útiles

```bash
# Build producción
ng build --configuration production

# Lint
ng lint

# Tests
ng test --watch=false --browsers=ChromeHeadless

# Servir producción local
ng serve --configuration production
```

---

## 📁 Estructura de Datos

### Producto Financiero

```typescript
interface Product {
  id: string;              // 3-10 caracteres, único
  name: string;            // 5-100 caracteres
  description: string;   // 10-200 caracteres
  logo: string;            // URL válida
  date_release: string;    // YYYY-MM-DD, ≥ hoy
  date_revision: string;   // YYYY-MM-DD, = release + 1 año
}
```

### Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/bp/products` | Listar todos |
| POST | `/bp/products` | Crear producto |
| PUT | `/bp/products/:id` | Actualizar producto |
| DELETE | `/bp/products/:id` | Eliminar producto |
| GET | `/bp/products/verification/:id` | Verificar ID único |

---

## 🎯 Funcionalidades Pendientes (F5-F6)

- [ ] **F5:** Editar producto con menú contextual (tres puntos)
- [ ] **F6:** Eliminar producto con modal de confirmación
- [ ] Tests E2E con Cypress/Playwright
- [ ] PWA (Service Worker, offline mode)

---

## 📚 Tecnologías y Versiones

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 17+ | Framework principal |
| TypeScript | 5.2+ | Tipado estático |
| RxJS | 7.8+ | Observables (HTTP) |
| Jasmine | 5.1+ | Tests unitarios |
| Karma | 6.4+ | Test runner |
| SCSS | - | Estilos con variables CSS |

---

## ✨ Principios SOLID Aplicados

| Principio | Implementación |
|-----------|---------------|
| **S**ingle Responsibility | Cada componente/servicio tiene una sola responsabilidad |
| **O**pen/Closed | Extensible vía nuevas features sin modificar existentes |
| **L**iskov Substitution | Componentes UI intercambiables (Card, Skeleton) |
| **I**nterface Segregation | Interfaces pequeñas y específicas (Product, ProductRequest) |
| **D**ependency Inversion | `inject()` para dependencias, abstracciones en Core |

---

## 🔒 Seguridad Implementada

- Guards funcionales para protección de rutas
- Interceptores HTTP para manejo de tokens
- Validación de inputs en frontend y backend
- Sanitización de URLs (regex patterns)
- No almacenamiento de datos sensibles en localStorage

---

## 📞 Contacto y Soporte

Para preguntas sobre la implementación o configuración:
- Revisar tests unitarios para ejemplos de uso
- Consultar documentación de Angular en angular.io
- Verificar estado del backend en `http://localhost:3002`

---

**Fecha de entrega:** Abril 2026  
**Versión:** 1.0.0  
**Autor:** Prueba Técnica Frontend
