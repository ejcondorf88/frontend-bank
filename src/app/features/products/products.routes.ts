import { Routes } from '@angular/router';

/**
 * Rutas de la feature Products
 * Implementa lazy loading para carga diferida
 * 
 * Rutas disponibles:
 * - /products        → Listado de productos
 * - /products/new    → Crear producto (para F4)
 * - /products/:id    → Editar producto (para F5)
 */
export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    // Lazy loading del componente de listado
    loadComponent: () => 
      import('./pages/products-list/products-list.component')
        .then(m => m.ProductsListComponent)
  },
  {
    path: 'new',
    // Para la funcionalidad F4 (Agregar producto)
    loadComponent: () => 
      import('./pages/product-form/product-form.component')
        .then(m => m.ProductFormComponent),
    // Guard para verificar autenticación
    // canActivate: [authGuard]
  },
  {
    path: ':id',
    // Para la funcionalidad F5 (Editar producto)
    loadComponent: () => 
      import('./pages/product-form/product-form.component')
        .then(m => m.ProductFormComponent),
    // Guard para verificar autenticación
    // canActivate: [authGuard]
  }
];
