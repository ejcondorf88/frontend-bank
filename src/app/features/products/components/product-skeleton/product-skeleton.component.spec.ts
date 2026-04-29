import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductSkeletonComponent } from './product-skeleton.component';

describe('ProductSkeletonComponent', () => {
  let component: ProductSkeletonComponent;
  let fixture: ComponentFixture<ProductSkeletonComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSkeletonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar el skeleton', () => {
    const skeletonCard = compiled.querySelector('.skeleton-card');
    expect(skeletonCard).toBeTruthy();
  });

  it('debería tener estructura correcta', () => {
    expect(compiled.querySelector('.skeleton-header')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-logo')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-title-wrapper')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-title')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-subtitle')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-body')).toBeTruthy();
    expect(compiled.querySelector('.skeleton-footer')).toBeTruthy();
  });

  it('debería tener atributos de accesibilidad', () => {
    const skeleton = compiled.querySelector('.skeleton-card');
    expect(skeleton?.getAttribute('role')).toBe('status');
    expect(skeleton?.getAttribute('aria-label')).toContain('Cargando');
  });
});
