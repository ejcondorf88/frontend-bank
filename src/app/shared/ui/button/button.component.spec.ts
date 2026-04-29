import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  });

  describe('Renderizado', () => {
    it('debería renderizar el botón', () => {
      expect(buttonElement).toBeTruthy();
    });

    it('debería renderizar el contenido proyectado', () => {
      fixture.componentRef.setInput('variant', 'primary');
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();

      const content = fixture.debugElement.query(By.css('.btn__content'));
      expect(content).toBeTruthy();
    });

    it('debería renderizar el spinner cuando loading es true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.btn__spinner'));
      expect(spinner).toBeTruthy();
    });

    it('no debería renderizar el spinner cuando loading es false', () => {
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.btn__spinner'));
      expect(spinner).toBeFalsy();
    });

    it('debería renderizar el icono prefix cuando se proporciona', () => {
      fixture.componentRef.setInput('prefixIcon', 'arrow-right');
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const prefixIcon = fixture.debugElement.query(By.css('.btn__icon--prefix'));
      expect(prefixIcon).toBeTruthy();
    });

    it('debería renderizar el icono suffix cuando se proporciona', () => {
      fixture.componentRef.setInput('suffixIcon', 'arrow-left');
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const suffixIcon = fixture.debugElement.query(By.css('.btn__icon--suffix'));
      expect(suffixIcon).toBeTruthy();
    });

    it('no debería renderizar iconos cuando loading es true', () => {
      fixture.componentRef.setInput('prefixIcon', 'arrow-right');
      fixture.componentRef.setInput('suffixIcon', 'arrow-left');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const prefixIcon = fixture.debugElement.query(By.css('.btn__icon--prefix'));
      const suffixIcon = fixture.debugElement.query(By.css('.btn__icon--suffix'));

      expect(prefixIcon).toBeFalsy();
      expect(suffixIcon).toBeFalsy();
    });
  });

  describe('Evento Click', () => {
    it('debería emitir el evento onClick cuando se hace click', () => {
      const clickSpy = jest.spyOn(component.onClick, 'emit');

      buttonElement.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('debería emitir el evento de click con el evento del mouse', () => {
      const clickSpy = jest.spyOn(component.onClick, 'emit');

      const mockEvent = new MouseEvent('click');
      buttonElement.dispatchEvent(mockEvent);

      expect(clickSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
    });
  });

  describe('Variantes', () => {
    it('debería aplicar la clase btn--primary por defecto', () => {
      expect(buttonElement.classList.contains('btn--primary')).toBe(true);
    });

    it('debería aplicar la clase btn--secondary cuando variant es secondary', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--secondary')).toBe(true);
    });

    it('debería aplicar la clase btn--outline cuando variant es outline', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--outline')).toBe(true);
    });

    it('debería aplicar la clase btn--ghost cuando variant es ghost', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--ghost')).toBe(true);
    });

    it('debería aplicar la clase btn--danger cuando variant es danger', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--danger')).toBe(true);
    });
  });

  describe('Estados Disabled', () => {
    it('no debería estar deshabilitado por defecto', () => {
      expect(buttonElement.disabled).toBe(false);
    });

    it('debería estar deshabilitado cuando disabled es true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(buttonElement.disabled).toBe(true);
    });

    it('debería estar deshabilitado cuando loading es true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(buttonElement.disabled).toBe(true);
    });

    it('debería aplicar opacidad cuando está deshabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(buttonElement.style.opacity).toBe('0.5');
    });

    it('no debería emitir click cuando está deshabilitado', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const clickSpy = jest.spyOn(component.onClick, 'emit');
      buttonElement.click();

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Tamaños', () => {
    it('debería aplicar la clase btn--md por defecto', () => {
      expect(buttonElement.classList.contains('btn--md')).toBe(true);
    });

    it('debería aplicar la clase btn--sm cuando size es sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--sm')).toBe(true);
      expect(buttonElement.classList.contains('btn--md')).toBe(false);
    });

    it('debería aplicar la clase btn--lg cuando size es lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--lg')).toBe(true);
      expect(buttonElement.classList.contains('btn--md')).toBe(false);
    });
  });

  describe('Propiedades adicionales', () => {
    it('debería aplicar la clase btn--full-width cuando fullWidth es true', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--full-width')).toBe(true);
    });

    it('debería aplicar la clase btn--loading cuando loading es true', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      expect(buttonElement.classList.contains('btn--loading')).toBe(true);
    });

    it('debería tener el type button por defecto', () => {
      expect(buttonElement.type).toBe('button');
    });

    it('debería tener el type submit cuando se especifica', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();

      expect(buttonElement.type).toBe('submit');
    });

    it('debería tener el type reset cuando se especifica', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();

      expect(buttonElement.type).toBe('reset');
    });
  });
});
