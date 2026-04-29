import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Product, ProductResponse, ProductRequest, IdVerificationResponse, ProductFilters } from '../models/product.model';

/**
 * Servicio para gestionar productos financieros
 * Consume la API REST en http://localhost:3002
 * 
 * Endpoints disponibles:
 * - GET    /bp/products              : Obtener todos los productos
 * - POST   /bp/products              : Crear un producto
 * - PUT    /bp/products/:id          : Actualizar un producto
 * - DELETE /bp/products/:id          : Eliminar un producto
 * - GET    /bp/products/verification/:id : Verificar si un ID existe
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3002';

  /**
   * Obtiene todos los productos financieros
   * @returns Observable con array de productos
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/bp/products`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene productos con filtros y ordenamiento
   * @param filters Filtros de búsqueda y ordenamiento
   * @returns Observable con productos filtrados
   */
  getProductsWithFilters(filters: ProductFilters): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => this.applyFilters(products, filters)),
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo producto
   * @param product Datos del producto a crear
   * @returns Observable con el producto creado
   */
  createProduct(product: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/bp/products`, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un producto existente
   * @param id ID del producto
   * @param product Datos actualizados
   * @returns Observable con el producto actualizado
   */
  updateProduct(id: string, product: Partial<ProductRequest>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/bp/products/${id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   * @returns Observable vacío
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bp/products/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Verifica si un ID de producto ya existe
   * @param id ID a verificar
   * @returns Observable con booleano (true = existe)
   */
  checkIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/bp/products/verification/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un producto por ID
   * @param id ID del producto
   * @returns Observable con el producto o undefined
   */
  getProductById(id: string): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id)),
      catchError(this.handleError)
    );
  }

  /**
   * Busca productos por texto
   * @param query Texto de búsqueda
   * @returns Observable con productos que coinciden
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => {
        if (!query.trim()) return products;
        const lowerQuery = query.toLowerCase();
        return products.filter(product =>
          product.id.toLowerCase().includes(lowerQuery) ||
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery)
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Genera la fecha de revisión (1 año después de la liberación)
   * @param releaseDate Fecha de liberación (YYYY-MM-DD)
   * @returns Fecha de revisión (YYYY-MM-DD)
   */
  calculateRevisionDate(releaseDate: string): string {
    const date = new Date(releaseDate + 'T00:00:00Z');
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Valida que las fechas sean correctas
   * @param releaseDate Fecha de liberación
   * @param revisionDate Fecha de revisión
   * @returns Objeto con validación y mensaje de error si aplica
   */
  validateDates(releaseDate: string, revisionDate: string): { valid: boolean; error?: string } {
    // Normalizar fechas a medianoche UTC para comparaciones consistentes
    const release = new Date(releaseDate + 'T00:00:00Z');
    const revision = new Date(revisionDate + 'T00:00:00Z');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Fecha de liberación debe ser >= hoy
    if (release.getTime() < today.getTime()) {
      return { valid: false, error: 'La fecha de liberación debe ser hoy o posterior' };
    }

    // Fecha de revisión debe ser exactamente 1 año después
    const expectedRevision = new Date(release);
    expectedRevision.setUTCFullYear(expectedRevision.getUTCFullYear() + 1);

    if (revision.getTime() !== expectedRevision.getTime()) {
      return { valid: false, error: 'La fecha de revisión debe ser exactamente 1 año después de la liberación' };
    }

    return { valid: true };
  }

  /**
   * Aplica filtros a la lista de productos
   * @private
   */
  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    let result = [...products];

    // Filtro de búsqueda
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      const today = new Date();
      result = result.filter(p => {
        const release = new Date(p.date_release);
        switch (filters.status) {
          case 'active':
            return release <= today;
          case 'upcoming':
            return release > today;
          default:
            return true;
        }
      });
    }

    // Ordenamiento
    if (filters.sortBy) {
      result.sort((a, b) => {
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        switch (filters.sortBy) {
          case 'name':
            return order * a.name.localeCompare(b.name);
          case 'date_release':
            return order * (new Date(a.date_release).getTime() - new Date(b.date_release).getTime());
          case 'date_revision':
            return order * (new Date(a.date_revision).getTime() - new Date(b.date_revision).getTime());
          default:
            return 0;
        }
      });
    }

    return result;
  }

  /**
   * Maneja errores HTTP
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 404:
          errorMessage = 'Producto no encontrado';
          break;
        case 409:
          errorMessage = 'El producto ya existe';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('ProductService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
