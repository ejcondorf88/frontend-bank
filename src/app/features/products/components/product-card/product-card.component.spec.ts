import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../models/product.model';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let compiled: HTMLElement;

  const mockProduct: Product = {
    id: 'trj-crd',
    name: 'Tarjetas de Crédito',
    description: 'Tarjeta de consumo bajo la modalidad de crédito',
    logo: 'https://example.com/logo.png',
    date_release: '2024-01-15',
    date_revision: '2025-01-15'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    // Con input signals se usa setInput() en vez de asignar directo
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería recibir producto como input requerido', () => {
    expect(component.product()).toEqual(mockProduct);
  });

  it('debería mostrar el nombre del producto', () => {
    const nameElement = compiled.querySelector('.product-name');
    expect(nameElement?.textContent).toContain('Tarjetas de Crédito');
  });

  it('debería mostrar la descripción del producto', () => {
    const descElement = compiled.querySelector('.product-description');
    expect(descElement?.textContent).toContain('Tarjeta de consumo');
  });

  it('debería mostrar el ID del producto', () => {
    const idElement = compiled.querySelector('.product-id');
    expect(idElement?.textContent).toContain('trj-crd');
  });

  it('debería tener imagen con alt correcto', () => {
    const imgElement = compiled.querySelector('.product-logo img');
    expect(imgElement?.getAttribute('alt')).toContain('Tarjetas de Crédito');
  });

  it('debería emitir evento edit al hacer click en editar', () => {
    const emitSpy = jest.spyOn(component.edit, 'emit');
    
    component.toggleMenu(new MouseEvent('click'));
    fixture.detectChanges();
    
    component.onEdit();
    
    expect(emitSpy).toHaveBeenCalledWith('trj-crd');
  });

  it('debería emitir evento delete al hacer click en eliminar', () => {
    const emitSpy = jest.spyOn(component.delete, 'emit');
    
    component.toggleMenu(new MouseEvent('click'));
    fixture.detectChanges();
    
    component.onDelete();
    
    expect(emitSpy).toHaveBeenCalledWith('trj-crd');
  });

  it('debería formatear fechas correctamente', () => {
    const formatted = component.formatDate('2024-01-15');
    // Aceptamos cualquiera de los formatos según zona horaria del entorno
    expect(formatted).toMatch(/15 de enero|15\/01|ene/);
  });

  it('debería cerrar menú al llamar closeMenu', () => {
    component.menuOpen = true;
    component.closeMenu();
    expect(component.menuOpen).toBe(false);
  });
});
