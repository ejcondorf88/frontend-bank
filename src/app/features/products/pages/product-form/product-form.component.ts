import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule, 
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Componente de formulario para agregar/editar producto
 * Historia F4: Formulario con validaciones según diseño D2
 * 
 * Validaciones:
 * - ID: requerido, min 3, max 10, único (async)
 * - Nombre: requerido, min 5, max 100
 * - Descripción: requerido, min 10, max 200
 * - Logo: requerido, URL válida
 * - Fecha Liberación: requerido, >= hoy
 * - Fecha Revisión: requerido, exactamente 1 año después
 *
 * Estrategia: ChangeDetectionStrategy.OnPush
 * El estado del formulario se maneja con ReactiveForms (no Signals directas),
 * pero las signals de UI (isSubmitting, isEditMode, etc.) se benefician de OnPush
 * al no disparar detección de cambios innecesaria en el árbol de componentes.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  // Servicios
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals
  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly productId = signal<string | null>(null);
  readonly isEditMode = signal(false);
  readonly today = signal(new Date().toISOString().split('T')[0]);

  // Formulario
  productForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initForm(): void {
    this.productForm = this.fb.group({
      id: ['', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10)
        ],
        asyncValidators: [this.idExistsValidator()],
        updateOn: 'blur'
      }],
      name: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      logo: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/)
      ]],
      date_release: ['', [
        Validators.required,
        this.dateNotInPastValidator()
      ]],
      date_revision: ['', [
        Validators.required
      ]]
    }, {
      validators: this.revisionDateValidator()
    });

    // Auto-calcular fecha de revisión cuando cambia liberación
    this.productForm.get('date_release')?.valueChanges.subscribe((date) => {
      if (date) {
        const revisionDate = this.calculateRevisionDate(date);
        this.productForm.get('date_revision')?.setValue(revisionDate, { emitEvent: false });
      }
    });
  }

  /**
   * Verifica si estamos en modo edición
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  /**
   * Carga producto para edición
   */
  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue(product);
          // Deshabilitar ID en modo edición
          this.productForm.get('id')?.disable();
        } else {
          this.notificationService.showError('Producto no encontrado');
          this.router.navigate(['/products']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Error al cargar el producto');
        this.router.navigate(['/products']);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Async Validator: Verifica si el ID ya existe
   */
  private idExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || this.isEditMode()) {
        return of(null);
      }

      // Debounce de 300ms
      return timer(300).pipe(
        switchMap(() => this.productService.checkIdExists(control.value)),
        map(exists => exists ? { idExists: true } : null),
        take(1)
      );
    };
  }

  /**
   * Validator: Fecha no puede ser anterior a hoy
   */
  private dateNotInPastValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate < today ? { pastDate: true } : null;
    };
  }

  /**
   * Validator: Fecha de revisión debe ser exactamente 1 año después
   */
  private revisionDateValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const release = group.get('date_release')?.value;
      const revision = group.get('date_revision')?.value;

      if (!release || !revision) return null;

      const releaseDate = new Date(release);
      const revisionDate = new Date(revision);
      const expectedRevision = new Date(releaseDate);
      expectedRevision.setFullYear(expectedRevision.getFullYear() + 1);

      const isValid = 
        revisionDate.getFullYear() === expectedRevision.getFullYear() &&
        revisionDate.getMonth() === expectedRevision.getMonth() &&
        revisionDate.getDate() === expectedRevision.getDate();

      return isValid ? null : { revisionDateInvalid: true };
    };
  }

  /**
   * Calcula fecha de revisión (1 año después)
   */
  calculateRevisionDate(releaseDate: string): string {
    const date = new Date(releaseDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  /**
   * Envía el formulario
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markAllAsTouched();
      this.notificationService.showError('Por favor, corrige los errores del formulario');
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.productForm.getRawValue();

    if (this.isEditMode()) {
      this.updateProduct(formData);
    } else {
      this.createProduct(formData);
    }
  }

  /**
   * Crea nuevo producto
   */
  private createProduct(product: Product): void {
    this.productService.createProduct(product).subscribe({
      next: () => {
        this.notificationService.showSuccess('Producto creado exitosamente');
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.notificationService.showError(error.message || 'Error al crear el producto');
      }
    });
  }

  /**
   * Actualiza producto existente
   */
  private updateProduct(product: Product): void {
    const id = this.productId();
    if (!id) return;

    this.productService.updateProduct(id, product).subscribe({
      next: () => {
        this.notificationService.showSuccess('Producto actualizado exitosamente');
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.notificationService.showError(error.message || 'Error al actualizar el producto');
      }
    });
  }

  /**
   * Reinicia el formulario
   */
  onReset(): void {
    if (this.isEditMode()) {
      const id = this.productId();
      if (id) this.loadProduct(id);
    } else {
      this.productForm.reset();
    }
  }

  /**
   * Marca todos los campos como touched
   */
  private markAllAsTouched(): void {
    Object.values(this.productForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /**
   * Obtiene mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Ingresa una URL válida';
    if (errors['pastDate']) return 'La fecha debe ser hoy o posterior';
    if (errors['idExists']) return 'El ID ya existe';

    return 'Campo inválido';
  }

  /**
   * Verifica si el formulario tiene error de fechas
   */
  get revisionDateError(): boolean {
    return this.productForm.hasError('revisionDateInvalid') && 
           this.productForm.touched;
  }

  /**
   * Verifica si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Verifica si un campo tiene error específico
   */
  hasError(fieldName: string, errorType: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control?.hasError(errorType) && control.touched);
  }
}
