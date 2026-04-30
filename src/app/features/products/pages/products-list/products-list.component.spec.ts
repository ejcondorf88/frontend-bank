import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { ProductsListComponent } from './products-list.component';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product } from '../../models/product.model';
import { of, throwError } from 'rxjs';

/**
 * Tests para ProductsListComponent
 * Cubre F1 (Listado), F2 (Búsqueda) y F3 (Paginación)
 */
describe('ProductsListComponent', () => {
  let component: ProductsListComponent;
  let fixture: ComponentFixture<ProductsListComponent>;
  let productService: jest.Mocked<ProductService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockProducts: Product[] = [
    {
      id: 'trj-crd',
      name: 'Tarjetas de Crédito',
      description: 'Tarjeta de consumo bajo la modalidad de crédito',
      logo: 'https://example.com/logo1.png',
      date_release: '2024-01-15',
      date_revision: '2025-01-15'
    },
    {
      id: 'cta-ahorro',
      name: 'Cuenta de Ahorro',
      description: 'Cuenta para ahorro personal',
      logo: 'https://example.com/logo2.png',
      date_release: '2024-02-01',
      date_revision: '2025-02-01'
    },
    {
      id: 'cta-corriente',
      name: 'Cuenta Corriente',
      description: 'Cuenta corriente para operaciones diarias',
      logo: 'https://example.com/logo3.png',
      date_release: '2024-03-01',
      date_revision: '2025-03-01'
    },
    {
      id: 'prestamo',
      name: 'Préstamo Personal',
      description: 'Préstamo para uso personal',
      logo: 'https://example.com/logo4.png',
      date_release: '2024-04-01',
      date_revision: '2025-04-01'
    },
    {
      id: 'hipoteca',
      name: 'Hipoteca',
      description: 'Préstamo hipotecario para vivienda',
      logo: 'https://example.com/logo5.png',
      date_release: '2024-05-01',
      date_revision: '2025-05-01'
    },
    {
      id: 'inversion',
      name: 'Fondo de Inversión',
      description: 'Fondo para inversión a largo plazo',
      logo: 'https://example.com/logo6.png',
      date_release: '2024-06-01',
      date_revision: '2025-06-01'
    }
  ];

  beforeEach(async () => {
    const productServiceSpy = {
      getProducts: jest.fn(),
      getProductsWithFilters: jest.fn(),
      deleteProduct: jest.fn()
    } as unknown as jest.Mocked<ProductService>;

    const notificationServiceSpy = {
      showError: jest.fn(),
      showSuccess: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;

    const routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [
        ProductsListComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: jest.fn() } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  // ============================================
  // TESTS F1: Listado de Productos
  // ============================================
  describe('F1 - Listado de Productos', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar con estado de carga activo', () => {
      expect(component.isLoading()).toBe(true);
      expect(component.products()).toEqual([]);
    });

    it('debería cargar productos al inicializar', fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      
      fixture.detectChanges(); // ngOnInit se ejecuta
      tick();
      
      expect(productService.getProducts).toHaveBeenCalled();
      expect(component.products()).toEqual(mockProducts);
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
    }));

    it('debería mostrar error si falla la carga', fakeAsync(() => {
      productService.getProducts.mockReturnValue(throwError(() => new Error('Error')));
      
      fixture.detectChanges();
      tick();
      
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeTruthy();
      expect(notificationService.showError).toHaveBeenCalled();
    }));

    it('debería calcular total de resultados correctamente', fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      
      fixture.detectChanges();
      tick();
      
      expect(component.totalResults()).toBe(6);
    }));
  });

  // ============================================
  // TESTS F2: Búsqueda
  // ============================================
  describe('F2 - Búsqueda', () => {
    beforeEach(fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      fixture.detectChanges();
      tick();
    }));

    it('debería filtrar productos por búsqueda', () => {
      component.onSearchChange('Tarjeta');
      fixture.detectChanges();
      
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].name).toBe('Tarjetas de Crédito');
    });

    it('debería buscar en descripción también', () => {
      component.onSearchChange('ahorro personal');
      fixture.detectChanges();
      
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].name).toBe('Cuenta de Ahorro');
    });

    it('debería ser case-insensitive', () => {
      component.onSearchChange('TARJETA');
      fixture.detectChanges();
      
      expect(component.filteredProducts().length).toBe(1);
    });

    it('debería limpiar búsqueda y mostrar todos', () => {
      component.onSearchChange('Tarjeta');
      fixture.detectChanges();
      
      component.clearSearch();
      fixture.detectChanges();
      
      expect(component.searchQuery()).toBe('');
      expect(component.filteredProducts().length).toBe(6);
    });

    it('debería buscar en ID también', () => {
      component.onSearchChange('trj-crd');
      fixture.detectChanges();
      
      expect(component.filteredProducts().length).toBe(1);
      expect(component.filteredProducts()[0].id).toBe('trj-crd');
    });

    it('debería mostrar mensaje cuando no hay resultados', () => {
      component.onSearchChange('xyz-no-existe');
      fixture.detectChanges();
      
      expect(component.filteredProducts().length).toBe(0);
    });

    it('debería resetear a página 1 al buscar', () => {
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
      
      component.onSearchChange('Cuenta');
      expect(component.currentPage()).toBe(1);
    });
  });

  // ============================================
  // TESTS F3: Paginación
  // ============================================
  describe('F3 - Paginación', () => {
    beforeEach(fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      fixture.detectChanges();
      tick();
    }));

    it('debería mostrar 5 productos por defecto', () => {
      expect(component.pageSize()).toBe(5);
      expect(component.paginatedProducts().length).toBe(5);
    });

    it('debería cambiar cantidad de registros', () => {
      component.onPageSizeChange(10);
      fixture.detectChanges();
      
      expect(component.pageSize()).toBe(10);
      expect(component.paginatedProducts().length).toBe(6); // Solo tenemos 6
    });

    it('debería calcular total de páginas correctamente', () => {
      // 6 productos / 5 por página = 2 páginas
      expect(component.totalPages()).toBe(2);
      
      component.onPageSizeChange(10);
      fixture.detectChanges();
      
      // 6 productos / 10 por página = 1 página
      expect(component.totalPages()).toBe(1);
    });

    it('debería navegar entre páginas', () => {
      component.onPageChange(2);
      fixture.detectChanges();
      
      expect(component.currentPage()).toBe(2);
      // En página 2 solo queda 1 producto (6 total - 5 en página 1)
      expect(component.paginatedProducts().length).toBe(1);
    });

    it('no debería permitir página menor a 1', () => {
      component.onPageChange(-1);
      expect(component.currentPage()).toBe(1);
      
      component.onPageChange(0);
      expect(component.currentPage()).toBe(1);
    });

    it('no debería permitir página mayor al total', () => {
      component.onPageChange(999);
      expect(component.currentPage()).toBe(1); // No cambió
    });

    it('debería resetear a página 1 al cambiar tamaño', () => {
      component.onPageChange(2);
      expect(component.currentPage()).toBe(2);
      
      component.onPageSizeChange(20);
      expect(component.currentPage()).toBe(1);
    });

    it('debería calcular rango mostrado correctamente', () => {
      // Página 1, 5 por página: muestra 1-5
      let range = component.displayedRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(5);

      component.onPageChange(2);
      fixture.detectChanges();
      
      // Página 2, 5 por página: muestra 6-6
      range = component.displayedRange();
      expect(range.start).toBe(6);
      expect(range.end).toBe(6);
    });

    it('debería generar números de página para paginación', () => {
      const pages = component.getPageNumbers();
      expect(pages.length).toBe(2);
      expect(pages).toEqual([1, 2]);
    });

    it('debería manejar opciones de tamaño de página', () => {
      expect(component.pageSizeOptions).toEqual([5, 10, 20]);
    });
  });

  // ============================================
  // TESTS: Ordenamiento
  // ============================================
  describe('Ordenamiento', () => {
    beforeEach(fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      fixture.detectChanges();
      tick();
    }));

  it('debería ordenar por nombre ascendente', () => {
    // Inicialmente ordena por 'name' ascendente, así que cambiamos a otro campo primero
    component.onSort('date_release');
    component.onSort('name');
    fixture.detectChanges();

    expect(component.sortField()).toBe('name');
    expect(component.sortOrder()).toBe('asc');
    expect(component.filteredProducts()[0].name).toBe('Cuenta Corriente');
  });

  it('debería cambiar a descendente si ya ordenaba por ese campo', () => {
    // El componente inicia ordenando por 'name', así que al hacer onSort cambia a desc
    component.onSort('name');
    fixture.detectChanges();

    expect(component.sortOrder()).toBe('desc');
    expect(component.filteredProducts()[0].name).toBe('Tarjetas de Crédito');
  });

    it('debería ordenar por fecha de liberación', () => {
      component.onSort('date_release');
      fixture.detectChanges();
      
      const products = component.filteredProducts();
      expect(products[0].date_release).toBe('2024-01-15');
      expect(products[5].date_release).toBe('2024-06-01');
    });

    it('debería identificar campo ordenado correctamente', () => {
      component.onSort('name');
      expect(component.isSortedBy('name')).toBe(true);
      expect(component.isSortedBy('date_release')).toBe(false);
    });

  it('debería retornar icono de ordenamiento correcto', () => {
    // El componente inicia con sortField='name' y sortOrder='asc'
    expect(component.getSortIcon('name')).toBe('▲');

    component.onSort('name');
    expect(component.getSortIcon('name')).toBe('▼');

    expect(component.getSortIcon('date_release')).toBe('');
  });
  });

  // ============================================
  // TESTS: Formateo de Fechas
  // ============================================
  describe('Formateo de Fechas', () => {
    it('debería formatear fecha correctamente', () => {
      const formatted = component.formatDate('2024-01-15');
      expect(formatted).toBe('15/01/2024');
    });

    it('debería manejar error de imagen', () => {
      const img = { src: 'original.png' } as HTMLImageElement;
      const event = { target: img } as unknown as Event;
      
      component.onImageError(event);
      
      expect(img.src).toContain('placeholder.png');
    });
  });

  // ============================================
  // TESTS: Skeleton Array
  // ============================================
  describe('Skeleton Loading', () => {
    it('debería generar array de skeletons basado en pageSize', fakeAsync(() => {
      productService.getProducts.mockReturnValue(of(mockProducts));
      fixture.detectChanges();
      tick();
      
      expect(component.skeletonArray().length).toBe(5);

      component.onPageSizeChange(10);
      expect(component.skeletonArray().length).toBe(10);
      flush();
    }));
  });
});
