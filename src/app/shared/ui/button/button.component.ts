import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [class]="buttonClasses()"
      [disabled]="disabled() || loading()"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true"></span>
      }
      
      @if (prefixIcon() && !loading()) {
        <span class="btn__icon btn__icon--prefix">
          <ng-container *ngTemplateOutlet="iconTemplate; context: { $implicit: prefixIcon() }"></ng-container>
        </span>
      }
      
      <span class="btn__content" [class.sr-only]="loading()">
        <ng-content></ng-content>
      </span>
      
      @if (suffixIcon() && !loading()) {
        <span class="btn__icon btn__icon--suffix">
          <ng-container *ngTemplateOutlet="iconTemplate; context: { $implicit: suffixIcon() }"></ng-container>
        </span>
      }
    </button>
    
    <ng-template #iconTemplate let-icon>
      @switch (icon) {
        @case ('arrow-right') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        }
        @case ('arrow-left') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
        }
        @case ('plus') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
        }
        @case ('check') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        }
        @case ('x') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        }
        @case ('refresh') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
            <path d="M16 21h5v-5"></path>
          </svg>
        }
        @case ('loading') {
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        }
      }
    </ng-template>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: inherit;
      font-weight: var(--font-weight-medium);
      line-height: var(--line-height-tight);
      border: var(--border-width-thin) solid transparent;
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
      user-select: none;
      position: relative;
      
      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px var(--surface-1), 0 0 0 4px var(--primary);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      // Variants
      &--primary {
        background-color: var(--primary);
        color: var(--text-inverse);
        
        &:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
      }
      
      &--secondary {
        background-color: var(--secondary);
        color: var(--text-inverse);
        
        &:hover:not(:disabled) {
          background-color: var(--secondary-hover);
        }
      }
      
      &--outline {
        background-color: transparent;
        border-color: var(--color-gray-300);
        color: var(--text-primary);
        
        &:hover:not(:disabled) {
          background-color: var(--surface-3);
          border-color: var(--color-gray-400);
        }
      }
      
      &--ghost {
        background-color: transparent;
        color: var(--text-secondary);
        
        &:hover:not(:disabled) {
          background-color: var(--surface-3);
          color: var(--text-primary);
        }
      }
      
      &--danger {
        background-color: var(--error);
        color: var(--text-inverse);
        
        &:hover:not(:disabled) {
          background-color: var(--color-error-700);
        }
      }
      
      // Sizes
      &--sm {
        padding: var(--space-1) var(--space-3);
        font-size: var(--font-size-xs);
        min-height: 2rem;
      }
      
      &--md {
        padding: var(--space-2) var(--space-4);
        font-size: var(--font-size-sm);
        min-height: 2.5rem;
      }
      
      &--lg {
        padding: var(--space-3) var(--space-6);
        font-size: var(--font-size-base);
        min-height: 3rem;
      }
      
      // Full width
      &--full-width {
        width: 100%;
      }
      
      // Loading state
      &--loading {
        cursor: wait;
      }
      
      &__spinner {
        position: absolute;
        width: 1rem;
        height: 1rem;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      &__content {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      
      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        svg {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        &--prefix {
          order: -1;
        }
        
        &--suffix {
          order: 1;
        }
      }
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `]
})
export class ButtonComponent {
  // Inputs
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  prefixIcon = input<string>('');
  suffixIcon = input<string>('');
  
  // Output
  onClick = output<MouseEvent>();
  
  // Computed classes
  buttonClasses = computed(() => {
    const classes = ['btn', `btn--${this.variant()}`, `btn--${this.size()}`];
    
    if (this.fullWidth()) {
      classes.push('btn--full-width');
    }
    
    if (this.loading()) {
      classes.push('btn--loading');
    }
    
    return classes.join(' ');
  });
}
