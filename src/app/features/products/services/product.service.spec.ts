import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3002';

  // Datos de prueba
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
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // TESTS F1: Listado de productos
  // ============================================
  describe('F1 - getProducts', () => {
    it('debería obtener la lista de productos desde la API', () => {
      service.getProducts().subscribe(products => {
        expect(products.length).toBe(3);
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProducts });
    });

    it('debería manejar error 500 del servidor', () => {
      service.getProducts().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.message).toContain('Error interno del servidor');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('debería manejar error de conexión', () => {
      service.getProducts().subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error).toBeTruthy();
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  // ============================================
  // TESTS F2: Búsqueda de productos
  // ============================================
  describe('F2 - searchProducts', () => {
    beforeEach(() => {
      // Mock inicial de productos
      service.getProducts().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      req.flush({ data: mockProducts });
    });

    it('debería buscar productos por nombre', (done) => {
      service.searchProducts('Tarjeta').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Tarjetas de Crédito');
        done();
      });
    });

    it('debería buscar productos por descripción', (done) => {
      service.searchProducts('ahorro').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].name).toBe('Cuenta de Ahorro');
        done();
      });
    });

    it('debería ser case-insensitive', (done) => {
      service.searchProducts('TARJETA').subscribe(products => {
        expect(products.length).toBe(1);
        done();
      });
    });

    it('debería retornar todos los productos si la búsqueda está vacía', (done) => {
      service.searchProducts('').subscribe(products => {
        expect(products.length).toBe(3);
        done();
      });
    });

    it('debería retornar array vacío si no hay coincidencias', (done) => {
      service.searchProducts('xyz').subscribe(products => {
        expect(products.length).toBe(0);
        done();
      });
    });

    it('debería buscar en ID también', (done) => {
      service.searchProducts('trj').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].id).toBe('trj-crd');
        done();
      });
    });
  });

  // ============================================
  // TESTS F3: Filtrado y Ordenamiento
  // ============================================
  describe('F3 - getProductsWithFilters', () => {
    beforeEach(() => {
      service.getProducts().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      req.flush({ data: mockProducts });
    });

    it('debería filtrar por campo de búsqueda', (done) => {
      service.getProductsWithFilters({ search: 'Cuenta' }).subscribe(products => {
        expect(products.length).toBe(2); // Cuenta de Ahorro y Cuenta Corriente
        done();
      });
    });

    it('debería ordenar por nombre ascendente', (done) => {
      service.getProductsWithFilters({ 
        sortBy: 'name', 
        sortOrder: 'asc' 
      }).subscribe(products => {
        expect(products[0].name).toBe('Cuenta Corriente');
        expect(products[1].name).toBe('Cuenta de Ahorro');
        expect(products[2].name).toBe('Tarjetas de Crédito');
        done();
      });
    });

    it('debería ordenar por nombre descendente', (done) => {
      service.getProductsWithFilters({ 
        sortBy: 'name', 
        sortOrder: 'desc' 
      }).subscribe(products => {
        expect(products[0].name).toBe('Tarjetas de Crédito');
        expect(products[2].name).toBe('Cuenta Corriente');
        done();
      });
    });

    it('debería ordenar por fecha de liberación', (done) => {
      service.getProductsWithFilters({ 
        sortBy: 'date_release', 
        sortOrder: 'asc' 
      }).subscribe(products => {
        expect(products[0].date_release).toBe('2024-01-15');
        expect(products[1].date_release).toBe('2024-02-01');
        expect(products[2].date_release).toBe('2024-03-01');
        done();
      });
    });

    it('debería filtrar y ordenar combinado', (done) => {
      service.getProductsWithFilters({ 
        search: 'Cuenta',
        sortBy: 'name', 
        sortOrder: 'asc' 
      }).subscribe(products => {
        expect(products.length).toBe(2);
        expect(products[0].name).toBe('Cuenta Corriente');
        expect(products[1].name).toBe('Cuenta de Ahorro');
        done();
      });
    });
  });

  // ============================================
  // TESTS: Validaciones de Fechas
  // ============================================
  describe('Validaciones de Fechas', () => {
    it('debería calcular fecha de revisión correctamente', () => {
      const releaseDate = '2024-01-15';
      const revisionDate = service.calculateRevisionDate(releaseDate);
      expect(revisionDate).toBe('2025-01-15');
    });

    it('debería validar fechas correctas', () => {
      const today = new Date().toISOString().split('T')[0];
      const revision = service.calculateRevisionDate(today);
      
      const result = service.validateDates(today, revision);
      expect(result.valid).toBeTrue();
    });

    it('debería rechazar fecha liberación anterior a hoy', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const releaseDate = yesterday.toISOString().split('T')[0];
      
      const result = service.validateDates(releaseDate, '2025-01-01');
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('fecha de liberación debe ser hoy o posterior');
    });

    it('debería rechazar fecha revisión diferente a 1 año', () => {
      const today = new Date().toISOString().split('T')[0];
      const wrongRevision = new Date();
      wrongRevision.setFullYear(wrongRevision.getFullYear() + 2);
      
      const result = service.validateDates(today, wrongRevision.toISOString().split('T')[0]);
      expect(result.valid).toBeFalse();
      expect(result.error).toContain('exactamente 1 año después');
    });
  });

  // ============================================
  // TESTS: CRUD Operations
  // ============================================
  describe('CRUD Operations', () => {
    const newProduct: Product = {
      id: 'new-prd',
      name: 'Nuevo Producto',
      description: 'Descripción del nuevo producto',
      logo: 'https://example.com/new.png',
      date_release: '2024-06-01',
      date_revision: '2025-06-01'
    };

    it('debería crear un producto', () => {
      service.createProduct(newProduct).subscribe(product => {
        expect(product).toEqual(newProduct);
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush({ message: 'Product added successfully', data: newProduct });
    });

    it('debería actualizar un producto', () => {
      const updateData = { name: 'Nombre Actualizado' };
      
      service.updateProduct('trj-crd', updateData).subscribe(product => {
        expect(product.name).toBe('Nombre Actualizado');
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/trj-crd`);
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Product updated successfully', data: { ...mockProducts[0], ...updateData } });
    });

    it('debería eliminar un producto', () => {
      service.deleteProduct('trj-crd').subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/trj-crd`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Product removed successfully' });
    });

    it('debería verificar si ID existe', () => {
      service.checkIdExists('existing-id').subscribe(exists => {
        expect(exists).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/verification/existing-id`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('debería verificar si ID no existe', () => {
      service.checkIdExists('new-id').subscribe(exists => {
        expect(exists).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/verification/new-id`);
      req.flush(false);
    });
  });

  // ============================================
  // TESTS: Obtener producto por ID
  // ============================================
  describe('getProductById', () => {
    beforeEach(() => {
      service.getProducts().subscribe();
      const req = httpMock.expectOne(`${apiUrl}/bp/products`);
      req.flush({ data: mockProducts });
    });

    it('debería encontrar producto por ID', (done) => {
      service.getProductById('trj-crd').subscribe(product => {
        expect(product).toBeTruthy();
        expect(product?.name).toBe('Tarjetas de Crédito');
        done();
      });
    });

    it('debería retornar undefined si no existe', (done) => {
      service.getProductById('no-existe').subscribe(product => {
        expect(product).toBeUndefined();
        done();
      });
    });
  });
});
