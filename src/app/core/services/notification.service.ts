import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration: number;
}

interface NotificationInternal extends Notification {
  timerId?: ReturnType<typeof setTimeout>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly MAX_NOTIFICATIONS = 5;
  private readonly DEFAULT_DURATION = 5000;

  private _notifications = signal<NotificationInternal[]>([]);

  readonly notifications = computed<Notification[]>(() =>
    this._notifications().map(({ timerId, ...notification }) => notification)
  );

  /**
   * Muestra una notificación con configuración personalizada
   */
  show(message: string, type: NotificationType = 'info', duration: number = this.DEFAULT_DURATION): string {
    const id = this.generateId();

    const notification: NotificationInternal = {
      id,
      message,
      type,
      duration
    };

    this.addNotification(notification);

    return id;
  }

  /**
   * Muestra una notificación de éxito
   */
  showSuccess(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  /**
   * Muestra una notificación de error
   */
  showError(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  /**
   * Muestra una notificación de advertencia
   */
  showWarning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  /**
   * Muestra una notificación informativa
   */
  showInfo(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  /**
   * Elimina una notificación por su ID
   */
  remove(id: string): void {
    this._notifications.update(notifications => {
      const notification = notifications.find(n => n.id === id);
      if (notification?.timerId) {
        clearTimeout(notification.timerId);
      }
      return notifications.filter(n => n.id !== id);
    });
  }

  /**
   * Elimina todas las notificaciones
   */
  clearAll(): void {
    this._notifications.update(notifications => {
      notifications.forEach(n => {
        if (n.timerId) {
          clearTimeout(n.timerId);
        }
      });
      return [];
    });
  }

  private addNotification(notification: NotificationInternal): void {
    this._notifications.update(notifications => {
      // Si hay demasiadas notificaciones, eliminar la más antigua
      const currentNotifications = [...notifications];
      if (currentNotifications.length >= this.MAX_NOTIFICATIONS) {
        const oldest = currentNotifications.shift();
        if (oldest?.timerId) {
          clearTimeout(oldest.timerId);
        }
      }

      // Configurar auto-dismiss si la duración > 0
      if (notification.duration > 0) {
        notification.timerId = setTimeout(() => {
          this.remove(notification.id);
        }, notification.duration);
      }

      return [...currentNotifications, notification];
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
