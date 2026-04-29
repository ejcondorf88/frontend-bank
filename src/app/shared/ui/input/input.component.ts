import {
  Component,
  input,
  output,
  model,
  computed,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule
} from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper">
      @if (label()) {
        <label class="input__label" [for]="inputId()">
          {{ label() }}
          @if (required()) {
            <span class="input__required">*</span>
          }
        </label>
      }
      
      <div class="input__container">
        @if (prefix()) {
          <span class="input__prefix" aria-hidden="true">
            {{ prefix() }}
          </span>
        }
        
        <input
          [id]="inputId()"
          [type]="currentType()"
          [class]="inputClasses()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [attr.maxlength]="maxlength()"
          [attr.min]="min()"
          [attr.max]="max()"
          [attr.step]="step()"
          [attr.autocomplete]="autocomplete()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus.emit($event)"
        />
        
        @if (showPasswordToggle() && type() === 'password') {
          <button
            type="button"
            class="input__toggle"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            @if (showPassword()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 13 8a13.93 13.93 0 0 1-2.66 3"/>
                <path d="M6.61 6.61A13.89 13.89 0 0 0 2 12s3 7 10 7a9.67 9.67 0 0 0 4.61-1.11"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            }
          </button>
        }
        
        @if (suffix()) {
          <span class="input__suffix" aria-hidden="true">
            {{ suffix() }}
          </span>
        }
        
        @if (clearable() && value()) {
          <button
            type="button"
            class="input__clear"
            (click)="clear()"
            aria-label="Limpiar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }
      </div>
      
      @if (hint() && !error()) {
        <p class="input__hint">{{ hint() }}</p>
      }
      
      @if (error()) {
        <p class="input__error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          {{ error() }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .input {
      &__label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
      }
      
      &__required {
        color: var(--error);
        margin-left: var(--space-1);
      }
      
      &__container {
        position: relative;
        display: flex;
        align-items: center;
      }
      
      &__field {
        display: block;
        width: 100%;
        font-family: inherit;
        color: var(--text-primary);
        background-color: var(--surface-1);
        border: var(--border-width-thin) solid var(--color-gray-300);
        border-radius: var(--border-radius-lg);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        
        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }
        
        &::placeholder {
          color: var(--text-muted);
        }
        
        &:disabled {
          background-color: var(--surface-3);
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        &--error {
          border-color: var(--error);
          
          &:focus {
            box-shadow: 0 0 0 3px var(--color-error-100);
          }
        }
        
        &--sm {
          padding: var(--space-1) var(--space-3);
          font-size: var(--font-size-xs);
          min-height: 2rem;
        }
        
        &--md {
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          min-height: 2.5rem;
        }
        
        &--lg {
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          min-height: 3rem;
        }
        
        &--with-prefix {
          padding-left: var(--space-10);
        }
        
        &--with-suffix,
        &--clearable {
          padding-right: var(--space-10);
        }
      }
      
      &__prefix,
      &__suffix {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        pointer-events: none;
      }
      
      &__prefix {
        left: var(--space-3);
      }
      
      &__suffix {
        right: var(--space-3);
      }
      
      &__toggle,
      &__clear {
        position: absolute;
        right: var(--space-3);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1);
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--border-radius-md);
        transition: all var(--transition-fast);
        
        &:hover {
          color: var(--text-primary);
          background-color: var(--surface-3);
        }
      }
      
      &__clear {
        right: var(--space-3);
      }
      
      &__toggle {
        right: var(--space-3);
      }
      
      &__hint {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        margin: 0;
      }
      
      &__error {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-sm);
        color: var(--error);
        margin: 0;
      }
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  // Inputs
  type = input<InputType>('text');
  size = input<InputSize>('md');
  label = input<string>('');
  placeholder = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');
  prefix = input<string>('');
  suffix = input<string>('');
  clearable = input<boolean>(false);
  showPasswordToggle = input<boolean>(true);
  maxlength = input<number | null>(null);
  min = input<string | number | null>(null);
  max = input<string | number | null>(null);
  step = input<string | number | null>(null);
  autocomplete = input<string>('');
  id = input<string>('');

  // Outputs
  onFocus = output<FocusEvent>();
  onBlur = output<void>();
  valueChange = output<string>();

  // Internal state
  value = model<string>('');
  showPassword = model<boolean>(false);
  isTouched = false;

  // Generate unique ID if not provided
  inputId = computed(() => this.id() || `input-${Math.random().toString(36).substr(2, 9)}`);

  // Computed type for password visibility
  currentType = computed<InputType>(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  // Computed classes
  inputClasses = computed(() => {
    const classes = ['input__field', `input__field--${this.size()}`];
    
    if (this.error()) {
      classes.push('input__field--error');
    }
    
    if (this.prefix()) {
      classes.push('input__field--with-prefix');
    }
    
    if (this.suffix() || (this.clearable() && this.value())) {
      classes.push('input__field--with-suffix');
    }
    
    return classes.join(' ');
  });

  // ControlValueAccessor callbacks
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled by input signal
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    
    this.value.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  clear(): void {
    this.value.set('');
    this.onChange('');
    this.valueChange.emit('');
  }
}
