import {
  Component,
  input,
  output,
  model,
  ViewChild,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div
        class="modal-overlay"
        (click)="closeOnOverlayClick ? onOverlayClick($event) : null"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="title() ? 'modal-title' : null"
      >
        <div
          class="modal"
          [class.modal--sm]="size() === 'sm'"
          [class.modal--md]="size() === 'md'"
          [class.modal--lg]="size() === 'lg'"
          [class.modal--xl]="size() === 'xl'"
          [class.modal--fullscreen]="size() === 'fullscreen'"
          (click)="$event.stopPropagation()"
        >
          @if (showHeader()) {
            <div class="modal__header">
              <div class="modal__header-content">
                @if (title()) {
                  <h2 id="modal-title" class="modal__title">{{ title() }}</h2>
                }
                @if (description()) {
                  <p class="modal__description">{{ description() }}</p>
                }
              </div>
              
              @if (showCloseButton()) {
                <button
                  type="button"
                  class="modal__close"
                  (click)="close()"
                  aria-label="Cerrar modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              }
            </div>
          }
          
          <div class="modal__body">
            <ng-content></ng-content>
          </div>
          
          @if (showFooter()) {
            <div class="modal__footer">
              <ng-content select="[modalFooter]"></ng-content>
              
              @if (showCancelButton() || showConfirmButton()) {
                <div class="modal__actions">
                  @if (showCancelButton()) {
                    <app-button
                      variant="ghost"
                      (onClick)="onCancel.emit(); close()"
                    >
                      {{ cancelText() }}
                    </app-button>
                  }
                  
                  @if (showConfirmButton()) {
                    <app-button
                      [variant]="confirmVariant()"
                      [loading]="confirmLoading()"
                      (onClick)="onConfirm.emit(); confirmLoading() ? null : close()"
                    >
                      {{ confirmText() }}
                    </app-button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
    
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgb(0 0 0 / 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      z-index: var(--z-modal);
      animation: fadeIn 200ms ease-out;
    }
    
    .modal {
      background-color: var(--surface-1);
      border-radius: var(--border-radius-2xl);
      box-shadow: var(--shadow-2xl);
      max-width: 32rem;
      width: 100%;
      max-height: calc(100vh - var(--space-8));
      overflow-y: auto;
      animation: slideIn 200ms ease-out;
      
      &--sm {
        max-width: 24rem;
      }
      
      &--md {
        max-width: 32rem;
      }
      
      &--lg {
        max-width: 40rem;
      }
      
      &--xl {
        max-width: 48rem;
      }
      
      &--fullscreen {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
        margin: 0;
      }
      
      &__header {
        padding: var(--space-6);
        border-bottom: var(--border-width-thin) solid var(--color-gray-200);
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--space-4);
      }
      
      &__header-content {
        flex: 1;
      }
      
      &__title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        margin: 0;
      }
      
      &__description {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin: var(--space-1) 0 0 0;
      }
      
      &__close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--space-1);
        margin: calc(var(--space-1) * -1);
        border-radius: var(--border-radius-md);
        transition: all var(--transition-fast);
        flex-shrink: 0;
        
        &:hover {
          background-color: var(--surface-3);
          color: var(--text-primary);
        }
      }
      
      &__body {
        padding: var(--space-6);
      }
      
      &__footer {
        padding: var(--space-4) var(--space-6);
        border-top: var(--border-width-thin) solid var(--color-gray-200);
      }
      
      &__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-1rem) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class ModalComponent {
  // Model signals (two-way binding)
  isOpen = model<boolean>(false);

  // Regular inputs
  title = input<string>('');
  description = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'>('md');
  showHeader = input<boolean>(true);
  showFooter = input<boolean>(true);
  showCloseButton = input<boolean>(true);
  closeOnOverlayClick = input<boolean>(true);
  closeOnEscape = input<boolean>(true);
  showCancelButton = input<boolean>(false);
  showConfirmButton = input<boolean>(false);
  cancelText = input<string>('Cancelar');
  confirmText = input<string>('Confirmar');
  confirmVariant = input<'primary' | 'secondary' | 'danger'>('primary');
  confirmLoading = input<boolean>(false);

  // Outputs
  onOpen = output<void>();
  onClose = output<void>();
  onCancel = output<void>();
  onConfirm = output<void>();

  // Open modal
  open(): void {
    this.isOpen.set(true);
    this.onOpen.emit();
    this.preventBodyScroll(true);
  }

  // Close modal
  close(): void {
    this.isOpen.set(false);
    this.onClose.emit();
    this.preventBodyScroll(false);
  }

  // Toggle modal
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  // Close on overlay click
  onOverlayClick(event: MouseEvent): void {
    this.close();
  }

  // Close on Escape key
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.isOpen() && this.closeOnEscape()) {
      this.close();
    }
  }

  // Prevent body scroll when modal is open
  private preventBodyScroll(prevent: boolean): void {
    if (typeof document !== 'undefined') {
      if (prevent) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }
}
