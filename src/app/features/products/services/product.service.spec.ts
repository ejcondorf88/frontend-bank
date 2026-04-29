import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3002';

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

describe('F2 - searchProducts', () => {
  it('debería buscar productos por nombre', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('Tarjeta').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Tarjetas de Crédito');
    flush();
  }));

  it('debería buscar productos por descripción', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('ahorro').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Cuenta de Ahorro');
    flush();
  }));

  it('debería ser case-insensitive', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('TARJETA').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(1);
    flush();
  }));

  it('debería retornar todos los productos si la búsqueda está vacía', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(3);
    flush();
  }));

  it('debería retornar array vacío si no hay coincidencias', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('xyz').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(0);
    flush();
  }));

  it('debería buscar en ID también', fakeAsync(() => {
    let result: Product[] = [];
    service.searchProducts('trj').subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('trj-crd');
    flush();
  }));
});

describe('F3 - getProductsWithFilters', () => {
  it('debería filtrar por campo de búsqueda', fakeAsync(() => {
    let result: Product[] = [];
    service.getProductsWithFilters({ search: 'Cuenta' }).subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(2);
    flush();
  }));

  it('debería ordenar por nombre ascendente', fakeAsync(() => {
    let result: Product[] = [];
    service.getProductsWithFilters({
      sortBy: 'name',
      sortOrder: 'asc'
    }).subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result[0].name).toBe('Cuenta Corriente');
    expect(result[1].name).toBe('Cuenta de Ahorro');
    expect(result[2].name).toBe('Tarjetas de Crédito');
    flush();
  }));

  it('debería ordenar por nombre descendente', fakeAsync(() => {
    let result: Product[] = [];
    service.getProductsWithFilters({
      sortBy: 'name',
      sortOrder: 'desc'
    }).subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result[0].name).toBe('Tarjetas de Crédito');
    expect(result[2].name).toBe('Cuenta Corriente');
    flush();
  }));

  it('debería ordenar por fecha de liberación', fakeAsync(() => {
    let result: Product[] = [];
    service.getProductsWithFilters({
      sortBy: 'date_release',
      sortOrder: 'asc'
    }).subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result[0].date_release).toBe('2024-01-15');
    expect(result[1].date_release).toBe('2024-02-01');
    expect(result[2].date_release).toBe('2024-03-01');
    flush();
  }));

  it('debería filtrar y ordenar combinado', fakeAsync(() => {
    let result: Product[] = [];
    service.getProductsWithFilters({
      search: 'Cuenta',
      sortBy: 'name',
      sortOrder: 'asc'
    }).subscribe(products => {
      result = products;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Cuenta Corriente');
    expect(result[1].name).toBe('Cuenta de Ahorro');
    flush();
  }));
});

  describe('Validaciones de Fechas', () => {
    it('debería calcular fecha de revisión correctamente', () => {
      const releaseDate = '2024-01-15';
      const revisionDate = service.calculateRevisionDate(releaseDate);
      expect(revisionDate).toBe('2025-01-15');
    });

  it('debería validar fechas correctas', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const revision = service.calculateRevisionDate(todayStr);

    const result = service.validateDates(todayStr, revision);
    expect(result.valid).toBe(true);
  });

    it('debería rechazar fecha liberación anterior a hoy', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const releaseDate = yesterday.toISOString().split('T')[0];
      
      const result = service.validateDates(releaseDate, '2025-01-01');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('fecha de liberación debe ser hoy o posterior');
    });

  it('debería rechazar fecha revisión diferente a 1 año', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const releaseStr = tomorrow.toISOString().split('T')[0];
    
    // Fecha de revisión 2 años después (incorrecta)
    const wrongRevision = new Date(tomorrow);
    wrongRevision.setFullYear(wrongRevision.getFullYear() + 2);

    const result = service.validateDates(releaseStr, wrongRevision.toISOString().split('T')[0]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exactamente 1 año después');
  });
  });

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
        expect(true).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/trj-crd`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Product removed successfully' });
    });

    it('debería verificar si ID existe', () => {
      service.checkIdExists('existing-id').subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/verification/existing-id`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('debería verificar si ID no existe', () => {
      service.checkIdExists('new-id').subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/bp/products/verification/new-id`);
      req.flush(false);
    });
  });

describe('getProductById', () => {
  it('debería encontrar producto por ID', fakeAsync(() => {
    let result: Product | undefined;
    service.getProductById('trj-crd').subscribe(product => {
      result = product;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result).toBeTruthy();
    expect(result?.name).toBe('Tarjetas de Crédito');
    flush();
  }));

  it('debería retornar undefined si no existe', fakeAsync(() => {
    let result: Product | undefined = undefined;
    service.getProductById('no-existe').subscribe(product => {
      result = product;
    });
    
    const req = httpMock.expectOne(`${apiUrl}/bp/products`);
    req.flush({ data: mockProducts });
    tick();
    
    expect(result).toBeUndefined();
    flush();
  }));
});
});
