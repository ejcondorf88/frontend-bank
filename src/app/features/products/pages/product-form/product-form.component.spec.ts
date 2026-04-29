import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product } from '../../models/product.model';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jest.Mocked<ProductService>;
  let notificationService: jest.Mocked<NotificationService>;
  let router: jest.Mocked<Router>;
  let activatedRoute: any;

  const mockProduct: Product = {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2099-01-15',
    date_revision: '2100-01-15'
  };

  beforeEach(async () => {
    const productServiceSpy = {
      getProductById: jest.fn(),
      createProduct: jest.fn(),
      updateProduct: jest.fn(),
      checkIdExists: jest.fn()
    } as unknown as jest.Mocked<ProductService>;

    const notificationServiceSpy = {
      showSuccess: jest.fn(),
      showError: jest.fn()
    } as unknown as jest.Mocked<NotificationService>;

    const routerSpy = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    // ActivatedRoute mock
    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ProductFormComponent,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jest.Mocked<ProductService>;
    notificationService = TestBed.inject(NotificationService) as jest.Mocked<NotificationService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ============================================
  // TESTS: Inicialización
  // ============================================
  describe('Inicialización', () => {
    it('debería crear el componente', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('debería inicializar en modo creación (no edición)', () => {
      fixture.detectChanges();
      expect(component.isEditMode()).toBe(false);
      expect(component.productId()).toBeNull();
    });

    it('debería inicializar el formulario vacío', () => {
      fixture.detectChanges();
      expect(component.productForm).toBeTruthy();
      expect(component.productForm.get('id')?.value).toBe('');
      expect(component.productForm.get('name')?.value).toBe('');
    });

    it('debería tener today como fecha de hoy', () => {
      fixture.detectChanges();
      const today = new Date().toISOString().split('T')[0];
      expect(component.today()).toBe(today);
    });
  });

  // ============================================
  // TESTS: Validaciones Síncronas
  // ============================================
  describe('Validaciones Síncronas', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe('Campo ID', () => {
      it('debería requerir ID', () => {
        const control = component.productForm.get('id');
        control?.setValue('');
        control?.markAsTouched();
        expect(control?.hasError('required')).toBe(true);
        expect(component.getErrorMessage('id')).toBe('Este campo es requerido');
      });

      it('debería requerir mínimo 3 caracteres', () => {
        const control = component.productForm.get('id');
        control?.setValue('ab');
        control?.markAsTouched();
        expect(control?.hasError('minlength')).toBe(true);
      });

      it('debería limitar a máximo 10 caracteres', () => {
        const control = component.productForm.get('id');
        control?.setValue('id-muy-largo-123');
        control?.markAsTouched();
        expect(control?.hasError('maxlength')).toBe(true);
      });

      it('debería aceptar ID válido (3-10 caracteres)', () => {
        const control = component.productForm.get('id');
        control?.setValue('trj-crd');
        expect(control?.hasError('minlength')).toBe(false);
        expect(control?.hasError('maxlength')).toBe(false);
      });
    });

    describe('Campo Nombre', () => {
      it('debería requerir nombre', () => {
        const control = component.productForm.get('name');
        control?.setValue('');
        control?.markAsTouched();
        expect(control?.hasError('required')).toBe(true);
      });

      it('debería requerir mínimo 6 caracteres', () => {
        const control = component.productForm.get('name');
        control?.setValue('Test');
        control?.markAsTouched();
        expect(control?.hasError('minlength')).toBe(true);
        expect(component.getErrorMessage('name')).toContain('Mínimo 6');
      });

      it('debería limitar a máximo 100 caracteres', () => {
        const control = component.productForm.get('name');
        control?.setValue('a'.repeat(101));
        control?.markAsTouched();
        expect(control?.hasError('maxlength')).toBe(true);
      });

      it('debería aceptar nombre válido', () => {
        const control = component.productForm.get('name');
        control?.setValue('Tarjeta de Crédito');
        expect(control?.valid).toBe(true);
      });
    });

    describe('Campo Descripción', () => {
      it('debería requerir descripción', () => {
        const control = component.productForm.get('description');
        control?.setValue('');
        control?.markAsTouched();
        expect(control?.hasError('required')).toBe(true);
      });

      it('debería requerir mínimo 10 caracteres', () => {
        const control = component.productForm.get('description');
        control?.setValue('Corta');
        control?.markAsTouched();
        expect(control?.hasError('minlength')).toBe(true);
      });

      it('debería limitar a máximo 200 caracteres', () => {
        const control = component.productForm.get('description');
        control?.setValue('a'.repeat(201));
        control?.markAsTouched();
        expect(control?.hasError('maxlength')).toBe(true);
      });

      it('debería aceptar descripción válida', () => {
        const control = component.productForm.get('description');
        control?.setValue('Descripción válida del producto');
        expect(control?.valid).toBe(true);
      });
    });

    describe('Campo Logo', () => {
      it('debería requerir logo', () => {
        const control = component.productForm.get('logo');
        control?.setValue('');
        control?.markAsTouched();
        expect(control?.hasError('required')).toBe(true);
      });

      it('debería validar formato URL', () => {
        const control = component.productForm.get('logo');
        control?.setValue('no-es-url');
        control?.markAsTouched();
        expect(control?.hasError('pattern')).toBe(true);
      });

      it('debería aceptar URL válida', () => {
        const control = component.productForm.get('logo');
        control?.setValue('https://example.com/logo.png');
        expect(control?.valid).toBe(true);
      });
    });

    describe('Campo Fecha Liberación', () => {
      it('debería requerir fecha de liberación', () => {
        const control = component.productForm.get('date_release');
        control?.setValue('');
        control?.markAsTouched();
        expect(control?.hasError('required')).toBe(true);
      });

      it('debería rechazar fechas pasadas', () => {
        const control = component.productForm.get('date_release');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        control?.setValue(yesterday.toISOString().split('T')[0]);
        control?.markAsTouched();
        expect(control?.hasError('pastDate')).toBe(true);
      });

      it('debería aceptar fecha de hoy o futura', () => {
        const control = component.productForm.get('date_release');
        // Usar fecha futura para evitar problemas de zona horaria en CI
        const futureDate = '2099-01-01';
        control?.setValue(futureDate);
        control?.markAsTouched();
        fixture.detectChanges();
        expect(control?.hasError('pastDate')).toBe(false);
      });
    });
  });

  // ============================================
  // TESTS: Validación Asíncrona de ID
  // ============================================
  describe('Validación Asíncrona de ID', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería validar que ID no existe', fakeAsync(() => {
      productService.checkIdExists.mockReturnValue(of(false));
      
      const control = component.productForm.get('id');
      control?.setValue('nuevo-id');
      tick(400); // Debounce de 300ms
      
      expect(productService.checkIdExists).toHaveBeenCalledWith('nuevo-id');
      expect(control?.hasError('idExists')).toBe(false);
      flush();
    }));

    it('debería mostrar error si ID ya existe', fakeAsync(() => {
      productService.checkIdExists.mockReturnValue(of(true));
      
      const control = component.productForm.get('id');
      control?.setValue('existente');
      tick(400);
      
      expect(control?.hasError('idExists')).toBe(true);
      // Marcar como touched para que getErrorMessage retorne mensaje
      control?.markAsTouched();
      expect(component.getErrorMessage('id')).toContain('El ID ya existe');
      flush();
    }));

    it('no debería validar en modo edición', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue('trj-crd');
      productService.getProductById.mockReturnValue(of(mockProduct));
      
      // Recrear componente con ID
      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      expect(component.isEditMode()).toBe(true);
      expect(productService.checkIdExists).not.toHaveBeenCalled();
    }));
  });

  // ============================================
  // TESTS: Auto-cálculo de Fechas
  // ============================================
  describe('Auto-cálculo de Fechas', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería calcular fecha de revisión (+1 año)', () => {
      const releaseDate = '2024-06-15';
      const expectedRevision = '2025-06-15';
      
      const result = component.calculateRevisionDate(releaseDate);
      expect(result).toBe(expectedRevision);
    });

    it('debería manejar febrero y años bisiestos', () => {
      const releaseDate = '2024-02-29'; // Año bisiesto
      const result = component.calculateRevisionDate(releaseDate);
      expect(result).toBe('2025-03-01'); // Ajusta al 1 de marzo
    });

    it('debería actualizar fecha revisión cuando cambia liberación', fakeAsync(() => {
      const releaseControl = component.productForm.get('date_release');
      const revisionControl = component.productForm.get('date_revision');
      
      releaseControl?.setValue('2024-06-15');
      tick();
      
      expect(revisionControl?.value).toBe('2025-06-15');
    }));

    it('debería validar que revisión sea exactamente 1 año después', () => {
      component.productForm.get('date_release')?.setValue('2024-06-15');
      component.productForm.get('date_revision')?.setValue('2025-06-16'); // 1 día más
      
      expect(component.productForm.hasError('revisionDateInvalid')).toBe(true);
    });
  });

  // ============================================
  // TESTS: Envío del Formulario
  // ============================================
  describe('Envío del Formulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('no debería enviar si el formulario es inválido', () => {
      const markAllAsTouchedSpy = jest.spyOn(component as any, 'markAllAsTouched');
      
      component.onSubmit();
      
      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(notificationService.showError).toHaveBeenCalled();
      expect(productService.createProduct).not.toHaveBeenCalled();
    });

    it('debería crear producto en modo creación', fakeAsync(() => {
      const newProduct: Product = {
        id: 'new-id',
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        logo: 'https://example.com/logo.png',
        date_release: '2099-12-01',
        date_revision: '2100-12-01'
      };

      productService.createProduct.mockReturnValue(of({ message: 'Created' } as any));
      // Mock checkIdExists para que no deje timers colgados
      productService.checkIdExists.mockReturnValue(of(false));
      
      component.productForm.patchValue(newProduct);
      tick(400); // Esperar asyncValidator (300ms debounce)
      component.onSubmit();
      tick(); // Procesar la suscripción del submit
      flush();
      
      expect(productService.createProduct).toHaveBeenCalledWith(newProduct);
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Producto creado exitosamente');
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));

    it('debería mostrar error si falla la creación', fakeAsync(() => {
      productService.createProduct.mockReturnValue(throwError(() => new Error('Error')));
      productService.checkIdExists.mockReturnValue(of(false));
      
      // Usar mockProduct pero con fechas futuras para evitar validación pastDate
      const validProduct = { ...mockProduct, date_release: '2099-01-01', date_revision: '2100-01-01' };
      component.productForm.patchValue(validProduct);
      tick(400); // Esperar asyncValidator (300ms debounce)
      component.onSubmit();
      tick(); // Procesar la suscripción del submit
      flush();
      
      expect(notificationService.showError).toHaveBeenCalled();
      expect(component.isSubmitting()).toBe(false);
    }));
  });

  // ============================================
  // TESTS: Modo Edición
  // ============================================
  describe('Modo Edición', () => {
    beforeEach(fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue('trj-crd');
      productService.getProductById.mockReturnValue(of(mockProduct));
      
      fixture.detectChanges();
      tick();
    }));

    it('debería cargar en modo edición', () => {
      expect(component.isEditMode()).toBe(true);
      expect(component.productId()).toBe('trj-crd');
    });

    it('debería cargar datos del producto', () => {
      expect(productService.getProductById).toHaveBeenCalledWith('trj-crd');
      expect(component.productForm.get('name')?.value).toBe('Tarjetas de Crédito');
    });

    it('debería deshabilitar campo ID en modo edición', () => {
      expect(component.productForm.get('id')?.disabled).toBe(true);
    });

    it('debería actualizar producto existente', fakeAsync(() => {
      productService.updateProduct.mockReturnValue(of({ message: 'Updated' } as any));
      productService.checkIdExists.mockReturnValue(of(false));
      
      component.productForm.get('name')?.setValue('Nombre Actualizado');
      tick(400); // Esperar asyncValidator (300ms debounce)
      component.onSubmit();
      tick(); // Procesar suscripción
      flush();
      
      expect(productService.updateProduct).toHaveBeenCalledWith('trj-crd', expect.any(Object));
      expect(notificationService.showSuccess).toHaveBeenCalledWith('Producto actualizado exitosamente');
    }));

    it('debería redirigir si producto no existe', fakeAsync(() => {
      productService.getProductById.mockReturnValue(of(undefined));
      
      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      expect(notificationService.showError).toHaveBeenCalledWith('Producto no encontrado');
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }));
  });

  // ============================================
  // TESTS: Reset del Formulario
  // ============================================
  describe('Reset del Formulario', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería limpiar el formulario en modo creación', () => {
      component.productForm.patchValue(mockProduct);
      component.onReset();
      
      expect(component.productForm.get('name')?.value).toBeNull();
      expect(component.productForm.get('description')?.value).toBeNull();
    });

    it('debería recargar datos en modo edición', fakeAsync(() => {
      activatedRoute.snapshot.paramMap.get.mockReturnValue('trj-crd');
      productService.getProductById.mockReturnValue(of(mockProduct));
      
      fixture = TestBed.createComponent(ProductFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      
      component.productForm.get('name')?.setValue('Cambiado');
      component.onReset();
      tick();
      
      expect(productService.getProductById).toHaveBeenCalledTimes(2); // Carga inicial + reset
    }));
  });

  // ============================================
  // TESTS: Estados y Helpers
  // ============================================
  describe('Estados y Helpers', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería detectar campo inválido', () => {
      const control = component.productForm.get('name');
      control?.setValue('');
      control?.markAsTouched();
      
      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('debería verificar error específico', () => {
      const control = component.productForm.get('id');
      control?.setValue('ab');
      control?.markAsTouched();
      
      expect(component.hasError('id', 'minlength')).toBe(true);
      expect(component.hasError('id', 'required')).toBe(false);
    });

    it('debería deshabilitar submit cuando está enviando', () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();
      
      expect(component.isSubmitting()).toBe(true);
    });

    it('debería marcar todos los campos como touched', () => {
      component.markAllAsTouched();
      
      Object.values(component.productForm.controls).forEach(control => {
        expect(control.touched).toBe(true);
      });
    });
  });

  // ============================================
  // TESTS: Mensajes de Error
  // ============================================
  describe('Mensajes de Error', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería retornar mensaje de required', () => {
      const control = component.productForm.get('name');
      control?.setValue('');
      control?.markAsTouched();
      
      expect(component.getErrorMessage('name')).toBe('Este campo es requerido');
    });

    it('debería retornar mensaje de minlength', () => {
      const control = component.productForm.get('id');
      control?.setValue('ab');
      control?.markAsTouched();
      
      expect(component.getErrorMessage('id')).toContain('Mínimo 3');
    });

    it('debería retornar mensaje de maxlength', () => {
      const control = component.productForm.get('name');
      control?.setValue('a'.repeat(101));
      control?.markAsTouched();
      
      expect(component.getErrorMessage('name')).toContain('Máximo 100');
    });

    it('debería retornar mensaje de pattern (URL)', () => {
      const control = component.productForm.get('logo');
      control?.setValue('no-url');
      control?.markAsTouched();
      
      expect(component.getErrorMessage('logo')).toBe('Ingresa una URL válida');
    });

    it('debería retornar mensaje de fecha pasada', () => {
      const control = component.productForm.get('date_release');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      control?.setValue(yesterday.toISOString().split('T')[0]);
      control?.markAsTouched();
      
      expect(component.getErrorMessage('date_release')).toContain('La fecha debe ser hoy o posterior');
    });

    it('debería retornar mensaje de ID existente', () => {
      const control = component.productForm.get('id');
      control?.setErrors({ idExists: true });
      control?.markAsTouched();
      
      expect(component.getErrorMessage('id')).toBe('El ID ya existe');
    });

    it('debería retornar mensaje genérico para error desconocido', () => {
      const control = component.productForm.get('name');
      control?.setErrors({ unknownError: true });
      control?.markAsTouched();
      
      expect(component.getErrorMessage('name')).toBe('Campo inválido');
    });
  });
});
