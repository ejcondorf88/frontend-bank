import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CardComponent } from './card.component';

// Componente de test para proyección de contenido
@Component({
  template: `
    <app-card [title]="title" [subtitle]="subtitle" [variant]="variant" [clickable]="clickable">
      <div cardHeader class="custom-header">Custom Header Content</div>
      <div class="body-content">Main Body Content</div>
      <div cardFooter class="custom-footer">Custom Footer Content</div>
    </app-card>
  `
})
class TestHostComponent {
  title = '';
  subtitle = '';
  variant: 'default' | 'flat' | 'bordered' = 'default';
  clickable = false;
}

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent, TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  describe('Renderizado básico', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería renderizar el contenedor de la tarjeta', () => {
      const cardElement = fixture.debugElement.query(By.css('.card'));
      expect(cardElement).toBeTruthy();
    });

    it('debería renderizar el body por defecto', () => {
      const bodyElement = fixture.debugElement.query(By.css('.card__body'));
      expect(bodyElement).toBeTruthy();
    });
  });

  describe('Renderizado de Header', () => {
    it('no debería renderizar el header cuando no hay título ni subtítulo', () => {
      fixture.componentRef.setInput('title', '');
      fixture.componentRef.setInput('subtitle', '');
      fixture.detectChanges();

      const headerElement = fixture.debugElement.query(By.css('.card__header'));
      expect(headerElement).toBeFalsy();
    });

    it('debería renderizar el header cuando hay título', () => {
      fixture.componentRef.setInput('title', 'Card Title');
      fixture.detectChanges();

      const headerElement = fixture.debugElement.query(By.css('.card__header'));
      expect(headerElement).toBeTruthy();
    });

    it('debería renderizar el header cuando hay subtítulo', () => {
      fixture.componentRef.setInput('subtitle', 'Card Subtitle');
      fixture.detectChanges();

      const headerElement = fixture.debugElement.query(By.css('.card__header'));
      expect(headerElement).toBeTruthy();
    });

    it('debería mostrar el título correctamente', () => {
      fixture.componentRef.setInput('title', 'My Card Title');
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.card__title'));
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent).toContain('My Card Title');
    });

    it('debería mostrar el subtítulo correctamente', () => {
      fixture.componentRef.setInput('subtitle', 'My Card Subtitle');
      fixture.detectChanges();

      const subtitleElement = fixture.debugElement.query(By.css('.card__subtitle'));
      expect(subtitleElement).toBeTruthy();
      expect(subtitleElement.nativeElement.textContent).toContain('My Card Subtitle');
    });

    it('debería mostrar tanto título como subtítulo', () => {
      fixture.componentRef.setInput('title', 'Title');
      fixture.componentRef.setInput('subtitle', 'Subtitle');
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.card__title'));
      const subtitleElement = fixture.debugElement.query(By.css('.card__subtitle'));

      expect(titleElement).toBeTruthy();
      expect(subtitleElement).toBeTruthy();
    });
  });

  describe('Renderizado de Body', () => {
    it('debería tener el body con la clase correcta', () => {
      const bodyElement = fixture.debugElement.query(By.css('.card__body'));
      expect(bodyElement).toBeTruthy();
    });

    it('debería proyectar el contenido en el body', () => {
      hostFixture.detectChanges();

      const bodyElement = hostFixture.debugElement.query(By.css('.card__body'));
      expect(bodyElement.nativeElement.textContent).toContain('Main Body Content');
    });
  });

  describe('Renderizado de Footer', () => {
    it('debería renderizar el footer cuando hay contenido proyectado', () => {
      hostFixture.detectChanges();

      const footerElement = hostFixture.debugElement.query(By.css('.card__footer'));
      expect(footerElement).toBeTruthy();
    });

    it('debería proyectar el contenido del footer', () => {
      hostFixture.detectChanges();

      const footerElement = hostFixture.debugElement.query(By.css('.card__footer'));
      expect(footerElement.nativeElement.textContent).toContain('Custom Footer Content');
    });
  });

  describe('Proyección de Contenido', () => {
    it('debería proyectar el header personalizado', () => {
      hostFixture.detectChanges();

      const customHeader = hostFixture.debugElement.query(By.css('.custom-header'));
      expect(customHeader).toBeTruthy();
    });

    it('debería proyectar el footer personalizado', () => {
      hostFixture.detectChanges();

      const customFooter = hostFixture.debugElement.query(By.css('.custom-footer'));
      expect(customFooter).toBeTruthy();
    });

    it('debería proyectar el contenido del body', () => {
      hostFixture.detectChanges();

      const bodyContent = hostFixture.debugElement.query(By.css('.body-content'));
      expect(bodyContent).toBeTruthy();
    });
  });

  describe('Variantes de Estilo', () => {
    it('debería aplicar la clase card por defecto', () => {
      const cardElement = fixture.debugElement.query(By.css('.card'));
      expect(cardElement).toBeTruthy();
    });

    it('debería aplicar la clase card--flat cuando variant es flat', () => {
      fixture.componentRef.setInput('variant', 'flat');
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.card'));
      expect(cardElement.classes['card--flat']).toBe(true);
    });

    it('debería aplicar la clase card--bordered cuando variant es bordered', () => {
      fixture.componentRef.setInput('variant', 'bordered');
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.card'));
      expect(cardElement.classes['card--bordered']).toBe(true);
    });

    it('debería aplicar la clase card--clickable cuando clickable es true', () => {
      fixture.componentRef.setInput('clickable', true);
      fixture.detectChanges();

      const cardElement = fixture.debugElement.query(By.css('.card'));
      expect(cardElement.classes['card--clickable']).toBe(true);
    });

    it('debería tener variant default por defecto', () => {
      expect(component.variant()).toBe('default');
    });

    it('debería tener clickable false por defecto', () => {
      expect(component.clickable()).toBe(false);
    });
  });

  describe('Ciclo de vida', () => {
    it('debería actualizar hasHeader después de ngAfterContentInit cuando hay título', () => {
      fixture.componentRef.setInput('title', 'Test Title');
      fixture.detectChanges();

      component.ngAfterContentInit();

      expect(component.hasHeader).toBe(true);
    });

    it('debería actualizar hasHeader después de ngAfterContentInit cuando hay subtítulo', () => {
      fixture.componentRef.setInput('subtitle', 'Test Subtitle');
      fixture.detectChanges();

      component.ngAfterContentInit();

      expect(component.hasHeader).toBe(true);
    });

    it('debería mantener hasHeader false cuando no hay título ni subtítulo', () => {
      fixture.componentRef.setInput('title', '');
      fixture.componentRef.setInput('subtitle', '');
      fixture.detectChanges();

      component.ngAfterContentInit();

      expect(component.hasHeader).toBe(false);
    });
  });
});
