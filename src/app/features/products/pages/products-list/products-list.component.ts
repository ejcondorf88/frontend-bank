import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductSortField, ProductSortOrder } from '../../models/product.model';
import { ProductSkeletonComponent } from '../../components/product-skeleton/product-skeleton.component';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Componente principal de listado de productos
 * Historia SS-001: Listado de Productos con búsqueda, filtrado y paginación
 * Diseño D1: Tabla de productos según especificación
 */
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductSkeletonComponent
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  // Inyección de servicios
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Signals para estado reactivo
  private readonly _products = signal<Product[]>([]);
  private readonly _isLoading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal<string>('');
  private readonly _pageSize = signal<number>(5);
  private readonly _currentPage = signal<number>(1);
  private readonly _sortField = signal<ProductSortField>('name');
  private readonly _sortOrder = signal<ProductSortOrder>('asc');

  // Signals para dropdown y modal
  readonly openMenuId = signal<string | null>(null);
  readonly deleteTargetId = signal<string | null>(null);
  readonly deleteTargetName = signal<string>('');
  readonly isDeleting = signal<boolean>(false);

  // Computed signals (públicos para el template)
  readonly products = computed(() => this._products());
  readonly isLoading = computed(() => this._isLoading());
  readonly error = computed(() => this._error());
  readonly searchQuery = computed(() => this._searchQuery());
  readonly pageSize = computed(() => this._pageSize());
  readonly currentPage = computed(() => this._currentPage());
  readonly sortOrder = computed(() => this._sortOrder());

  // Productos filtrados
  readonly filteredProducts = computed(() => {
    let result = [...this._products()];

    // Aplicar búsqueda
    const query = this._searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    // Aplicar ordenamiento
    const field = this._sortField();
    const order = this._sortOrder();
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'date_release') {
        comparison = new Date(a.date_release).getTime() - new Date(b.date_release).getTime();
      } else {
        comparison = new Date(a.date_revision).getTime() - new Date(b.date_revision).getTime();
      }
      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  // Productos paginados
  readonly paginatedProducts = computed(() => {
    const start = (this._currentPage() - 1) * this._pageSize();
    const end = start + this._pageSize();
    return this.filteredProducts().slice(start, end);
  });

  // Total de páginas
  readonly totalPages = computed(() => 
    Math.max(1, Math.ceil(this.filteredProducts().length / this._pageSize()))
  );

  // Total de resultados
  readonly totalResults = computed(() => this.filteredProducts().length);

  // Skeleton array
  readonly skeletonArray = computed(() => 
    new Array(this._pageSize()).fill(0).map((_, i) => i)
  );

  // Opciones de cantidad por página
  readonly pageSizeOptions = [5, 10, 20];

  ngOnInit(): void {
    this.loadProducts();
  }

  /** Carga los productos desde la API */
  loadProducts(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this._products.set(products);
        this._isLoading.set(false);
      },
      error: (err) => {
        this._error.set('Error al cargar los productos. Por favor, intenta nuevamente.');
        this._isLoading.set(false);
        this.notificationService.showError('No se pudieron cargar los productos');
      }
    });
  }

  /** Actualiza la búsqueda */
  onSearchChange(query: string): void {
    this._searchQuery.set(query);
    this._currentPage.set(1);
  }

  /** Limpia la búsqueda */
  clearSearch(): void {
    this._searchQuery.set('');
    this._currentPage.set(1);
  }

  /** Cambia la cantidad de registros por página */
  onPageSizeChange(size: number): void {
    this._pageSize.set(Number(size));
    this._currentPage.set(1);
  }

  /** Cambia de página */
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }

  /** Cambia el ordenamiento */
  onSort(field: ProductSortField): void {
    if (this._sortField() === field) {
      this._sortOrder.set(this._sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this._sortField.set(field);
      this._sortOrder.set('asc');
    }
  }

  /** Verifica si un campo está ordenado */
  isSortedBy(field: ProductSortField): boolean {
    return this._sortField() === field;
  }

  /** Obtiene el icono de ordenamiento */
  getSortIcon(field: ProductSortField): string {
    if (!this.isSortedBy(field)) return '';
    return this._sortOrder() === 'asc' ? '▲' : '▼';
  }

  /** Formatea fecha para mostrar */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /** Maneja error de imagen */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.png';
  }

  // ----------------------------------------------------------------
  // Dropdown menú contextual
  // ----------------------------------------------------------------

  /** Abre/cierra el menú de una fila específica */
  toggleMenu(event: Event, productId: string): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === productId ? null : productId);
  }

  /** Cierra todos los menús */
  closeAllMenus(): void {
    this.openMenuId.set(null);
  }

  /** Navega al formulario de edición (F5) */
  onEditProduct(product: Product): void {
    this.openMenuId.set(null);
    this.router.navigate(['/products', product.id]);
  }

  // ----------------------------------------------------------------
  // Eliminación con modal de confirmación (F6)
  // ----------------------------------------------------------------

  /** Abre el modal de confirmación de eliminación */
  onDeleteProduct(product: Product): void {
    this.openMenuId.set(null);
    this.deleteTargetId.set(product.id);
    this.deleteTargetName.set(product.name);
  }

  /** Cancela la eliminación y cierra el modal */
  cancelDelete(): void {
    this.deleteTargetId.set(null);
    this.deleteTargetName.set('');
  }

  /** Confirma y ejecuta la eliminación */
  confirmDelete(): void {
    const id = this.deleteTargetId();
    if (!id) return;

    this.isDeleting.set(true);

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this._products.update(products => products.filter(p => p.id !== id));
        this.notificationService.showSuccess('Producto eliminado exitosamente');
        this.cancelDelete();
        this.isDeleting.set(false);
      },
      error: () => {
        this.notificationService.showError('Error al eliminar el producto');
        this.isDeleting.set(false);
      }
    });
  }
}
