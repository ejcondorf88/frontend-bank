/**
 * Modelo de Producto Financiero
 * Define la estructura de datos según la documentación de la API
 */

export interface Product {
  /** Identificador único del producto (3-10 caracteres) */
  id: string;
  
  /** Nombre del producto (5-100 caracteres) */
  name: string;
  
  /** Descripción del producto (10-200 caracteres) */
  description: string;
  
  /** URL del logo representativo del producto */
  logo: string;
  
  /** Fecha de liberación del producto (formato: YYYY-MM-DD) */
  date_release: string;
  
  /** Fecha de revisión del producto (1 año después de la liberación) */
  date_revision: string;
}

/**
 * Modelo extendido para la UI
 * Incluye campos calculados o transformados para la interfaz
 */
export interface ProductUI extends Product {
  /** Fecha de liberación como objeto Date */
  releaseDate: Date;
  
  /** Fecha de revisión como objeto Date */
  revisionDate: Date;
  
  /** Días desde la liberación */
  daysSinceRelease: number;
  
  /** Estado del producto basado en fechas */
  status: 'active' | 'upcoming' | 'under_review';
}

/**
 * Request para crear/actualizar producto
 * Todos los campos son requeridos excepto id en actualización
 */
export interface ProductRequest {
  id?: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

/**
 * Respuesta de la API
 */
export interface ProductResponse {
  data: Product[];
}

/**
 * Respuesta de verificación de ID
 */
export interface IdVerificationResponse {
  exists: boolean;
}

/**
 * Estados posibles de un producto
 */
export type ProductStatus = 'active' | 'upcoming' | 'under_review' | 'all';

/**
 * Opciones de ordenamiento
 */
export type ProductSortField = 'name' | 'date_release' | 'date_revision';
export type ProductSortOrder = 'asc' | 'desc';

/**
 * Filtros de búsqueda
 */
export interface ProductFilters {
  search?: string;
  status?: ProductStatus;
  sortBy?: ProductSortField;
  sortOrder?: ProductSortOrder;
}
