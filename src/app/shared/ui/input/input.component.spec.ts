import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  describe('Renderizado', () => {
    it('debería renderizar el input', () => {
      expect(inputElement).toBeTruthy();
    });

    it('debería renderizar el label cuando se proporciona', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('.input__label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Email');
    });

    it('no debería renderizar el label cuando no se proporciona', () => {
      fixture.componentRef.setInput('label', '');
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('.input__label'));
      expect(label).toBeFalsy();
    });

    it('debería mostrar el indicador de requerido cuando required es true', () => {
      fixture.componentRef.setInput('label', 'Email');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const requiredIndicator = fixture.debugElement.query(By.css('.input__required'));
      expect(requiredIndicator).toBeTruthy();
    });
  });

  describe('ControlValueAccessor', () => {
    it('debería implementar ControlValueAccessor', () => {
      const valueAccessor = fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);
      expect(valueAccessor).toContain(component);
    });

    it('debería actualizar el valor cuando se llama writeValue', () => {
      component.writeValue('test value');
      expect(component.value()).toBe('test value');
    });

    it('debería usar valor vacío cuando writeValue recibe null o undefined', () => {
      component.writeValue(null as any);
      expect(component.value()).toBe('');

      component.writeValue(undefined as any);
      expect(component.value()).toBe('');
    });

    it('debería registrar la función onChange', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      component.onChange('test');
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('debería registrar la función onTouched', () => {
      const mockFn = jest.fn();
      component.registerOnTouched(mockFn);

      component.onTouched();
      expect(mockFn).toHaveBeenCalled();
    });

    it('debería emitir el valor cuando cambia el input', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      inputElement.value = 'new value';
      inputElement.dispatchEvent(new Event('input'));

      expect(mockFn).toHaveBeenCalledWith('new value');
    });

    it('debería llamar onTouched cuando el input pierde el foco', () => {
      const mockFn = jest.fn();
      component.registerOnTouched(mockFn);

      inputElement.dispatchEvent(new Event('blur'));

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('Binding de Value', () => {
    it('debería mostrar el valor inicial en el input', () => {
      component.writeValue('initial value');
      fixture.detectChanges();

      expect(inputElement.value).toBe('initial value');
    });

    it('debería actualizar el valor del componente cuando cambia el input', () => {
      inputElement.value = 'typed value';
      inputElement.dispatchEvent(new Event('input'));

      expect(component.value()).toBe('typed value');
    });

    it('debería emitir valueChange cuando cambia el valor', () => {
      const valueChangeSpy = jest.spyOn(component.valueChange, 'emit');

      inputElement.value = 'emitted value';
      inputElement.dispatchEvent(new Event('input'));

      expect(valueChangeSpy).toHaveBeenCalledWith('emitted value');
    });
  });

  describe('Estados', () => {
    describe('Disabled', () => {
      it('debería estar habilitado por defecto', () => {
        expect(inputElement.disabled).toBe(false);
      });

      it('debería estar deshabilitado cuando disabled es true', () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();

        expect(inputElement.disabled).toBe(true);
      });

      it('debería aplicar opacidad cuando está deshabilitado', () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();

        expect(inputElement.style.opacity).toBe('0.7');
      });
    });

    describe('Error', () => {
      it('no debería tener clase de error por defecto', () => {
        expect(inputElement.classList.contains('input__field--error')).toBe(false);
      });

      it('debería aplicar clase de error cuando error tiene valor', () => {
        fixture.componentRef.setInput('error', 'Este campo es requerido');
        fixture.detectChanges();

        expect(inputElement.classList.contains('input__field--error')).toBe(true);
      });

      it('debería mostrar el mensaje de error', () => {
        fixture.componentRef.setInput('error', 'Error message');
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('.input__error'));
        expect(errorElement).toBeTruthy();
        expect(errorElement.nativeElement.textContent).toContain('Error message');
      });

      it('no debería mostrar hint cuando hay error', () => {
        fixture.componentRef.setInput('hint', 'Hint text');
        fixture.componentRef.setInput('error', 'Error message');
        fixture.detectChanges();

        const hintElement = fixture.debugElement.query(By.css('.input__hint'));
        expect(hintElement).toBeFalsy();
      });
    });

    describe('Readonly', () => {
      it('no debería ser readonly por defecto', () => {
        expect(inputElement.readOnly).toBe(false);
      });

      it('debería ser readonly cuando readonly es true', () => {
        fixture.componentRef.setInput('readonly', true);
        fixture.detectChanges();

        expect(inputElement.readOnly).toBe(true);
      });
    });
  });

  describe('Atributos del input', () => {
    it('debería tener el type text por defecto', () => {
      expect(inputElement.type).toBe('text');
    });

    it('debería cambiar el type cuando se especifica', () => {
      fixture.componentRef.setInput('type', 'email');
      fixture.detectChanges();

      expect(inputElement.type).toBe('email');
    });

    it('debería aplicar el placeholder', () => {
      fixture.componentRef.setInput('placeholder', 'Enter text...');
      fixture.detectChanges();

      expect(inputElement.placeholder).toBe('Enter text...');
    });

    it('debería aplicar maxlength', () => {
      fixture.componentRef.setInput('maxlength', 50);
      fixture.detectChanges();

      expect(inputElement.getAttribute('maxlength')).toBe('50');
    });

    it('debería aplicar autocomplete', () => {
      fixture.componentRef.setInput('autocomplete', 'email');
      fixture.detectChanges();

      expect(inputElement.getAttribute('autocomplete')).toBe('email');
    });
  });

  describe('Tamaños', () => {
    it('debería aplicar la clase input__field--md por defecto', () => {
      expect(inputElement.classList.contains('input__field--md')).toBe(true);
    });

    it('debería aplicar la clase input__field--sm cuando size es sm', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();

      expect(inputElement.classList.contains('input__field--sm')).toBe(true);
    });

    it('debería aplicar la clase input__field--lg cuando size es lg', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();

      expect(inputElement.classList.contains('input__field--lg')).toBe(true);
    });
  });

  describe('Funcionalidad de clear', () => {
    it('debería mostrar el botón clear cuando clearable es true y hay valor', () => {
      component.writeValue('test value');
      fixture.componentRef.setInput('clearable', true);
      fixture.detectChanges();

      const clearButton = fixture.debugElement.query(By.css('.input__clear'));
      expect(clearButton).toBeTruthy();
    });

    it('no debería mostrar el botón clear cuando no hay valor', () => {
      component.writeValue('');
      fixture.componentRef.setInput('clearable', true);
      fixture.detectChanges();

      const clearButton = fixture.debugElement.query(By.css('.input__clear'));
      expect(clearButton).toBeFalsy();
    });

    it('debería limpiar el valor cuando se hace click en clear', () => {
      const mockFn = jest.fn();
      component.registerOnChange(mockFn);

      component.writeValue('test value');
      fixture.componentRef.setInput('clearable', true);
      fixture.detectChanges();

      const clearButton = fixture.debugElement.query(By.css('.input__clear'));
      clearButton.nativeElement.click();

      expect(component.value()).toBe('');
      expect(mockFn).toHaveBeenCalledWith('');
    });
  });

  describe('Toggle de contraseña', () => {
    it('debería mostrar el toggle cuando type es password y showPasswordToggle es true', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('showPasswordToggle', true);
      fixture.detectChanges();

      const toggleButton = fixture.debugElement.query(By.css('.input__toggle'));
      expect(toggleButton).toBeTruthy();
    });

    it('debería cambiar el type a text cuando se activa showPassword', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('showPasswordToggle', true);
      fixture.detectChanges();

      component.togglePasswordVisibility();
      fixture.detectChanges();

      expect(component.currentType()).toBe('text');
    });

    it('debería volver al type password cuando se desactiva showPassword', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('showPasswordToggle', true);
      fixture.detectChanges();

      component.togglePasswordVisibility();
      component.togglePasswordVisibility();
      fixture.detectChanges();

      expect(component.currentType()).toBe('password');
    });
  });

  describe('Prefijo y Sufijo', () => {
    it('debería mostrar el prefijo cuando se proporciona', () => {
      fixture.componentRef.setInput('prefix', '$');
      fixture.detectChanges();

      const prefixElement = fixture.debugElement.query(By.css('.input__prefix'));
      expect(prefixElement).toBeTruthy();
      expect(prefixElement.nativeElement.textContent).toContain('$');
    });

    it('debería mostrar el sufijo cuando se proporciona', () => {
      fixture.componentRef.setInput('suffix', 'USD');
      fixture.detectChanges();

      const suffixElement = fixture.debugElement.query(By.css('.input__suffix'));
      expect(suffixElement).toBeTruthy();
      expect(suffixElement.nativeElement.textContent).toContain('USD');
    });
  });

  describe('Hint', () => {
    it('debería mostrar el hint cuando se proporciona y no hay error', () => {
      fixture.componentRef.setInput('hint', 'This is a hint');
      fixture.detectChanges();

      const hintElement = fixture.debugElement.query(By.css('.input__hint'));
      expect(hintElement).toBeTruthy();
      expect(hintElement.nativeElement.textContent).toContain('This is a hint');
    });
  });

  describe('Eventos', () => {
    it('debería emitir onFocus cuando el input recibe foco', () => {
      const focusSpy = jest.spyOn(component.onFocus, 'emit');

      inputElement.dispatchEvent(new FocusEvent('focus'));

      expect(focusSpy).toHaveBeenCalled();
    });

    it('debería emitir onBlur cuando el input pierde foco', () => {
      const blurSpy = jest.spyOn(component.onBlur, 'emit');

      inputElement.dispatchEvent(new FocusEvent('blur'));

      expect(blurSpy).toHaveBeenCalled();
    });
  });
});
