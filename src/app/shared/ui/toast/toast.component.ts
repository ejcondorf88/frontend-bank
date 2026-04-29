import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notifications().length > 0) {
      <div class="toast-container">
        @for (notification of notifications(); track notification.id) {
          <div
            class="toast"
            [class.toast--success]="notification.type === 'success'"
            [class.toast--error]="notification.type === 'error'"
            [class.toast--warning]="notification.type === 'warning'"
            [class.toast--info]="notification.type === 'info'"
            role="alert"
            aria-live="polite"
          >
            <div class="toast__icon">
              @switch (notification.type) {
                @case ('success') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                }
                @case ('error') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/>
                    <path d="m9 9 6 6"/>
                  </svg>
                }
                @case ('warning') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
                    <path d="M12 9v4"/>
                    <path d="M12 17h.01"/>
                  </svg>
                }
                @case ('info') {
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                }
              }
            </div>

            <div class="toast__content">
              <div class="toast__message">{{ notification.message }}</div>
            </div>

            <button
              type="button"
              class="toast__close"
              (click)="removeNotification(notification.id)"
              aria-label="Cerrar notificación"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .toast-container {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      z-index: var(--z-toast);
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      background-color: var(--surface-1);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      animation: slideInRight 300ms ease-out;
      max-width: 24rem;
      border-left: var(--border-width-thick) solid transparent;

      &--success {
        border-left-color: var(--success);
      }

      &--error {
        border-left-color: var(--error);
      }

      &--warning {
        border-left-color: var(--warning);
      }

      &--info {
        border-left-color: var(--info);
      }
    }

    .toast__icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;

      svg {
        width: 100%;
        height: 100%;
      }

      .toast--success & {
        color: var(--success);
      }

      .toast--error & {
        color: var(--error);
      }

      .toast--warning & {
        color: var(--warning);
      }

      .toast--info & {
        color: var(--info);
      }
    }

    .toast__content {
      flex: 1;
      min-width: 0;
    }

    .toast__message {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      line-height: var(--line-height-normal);
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-1);
      margin: calc(var(--space-1) * -1);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--text-primary);
        background-color: var(--surface-3);
      }

      svg {
        width: 1rem;
        height: 1rem;
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    // Responsive
    @media (max-width: 640px) {
      .toast-container {
        left: var(--space-4);
        right: var(--space-4);
        bottom: var(--space-4);
      }

      .toast {
        max-width: none;
      }
    }
  `]
})
export class ToastComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }
}
