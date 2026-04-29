import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { ToastComponent } from './toast.component';
import { NotificationService, Notification } from '../../../core/services/notification.service';

// Mock del NotificationService
class MockNotificationService {
  notifications = signal<Notification[]>([]);
  remove = jest.fn();
  clearAll = jest.fn();

  addNotification(notification: Notification) {
    this.notifications.update(notifications => [...notifications, notification]);
  }

  clearNotifications() {
    this.notifications.set([]);
  }
}

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let mockNotificationService: MockNotificationService;

  beforeEach(async () => {
    mockNotificationService = new MockNotificationService();

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Renderizado de notificaciones', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('no debería renderizar el contenedor cuando no hay notificaciones', () => {
      const container = fixture.debugElement.query(By.css('.toast-container'));
      expect(container).toBeFalsy();
    });

    it('debería renderizar el contenedor cuando hay notificaciones', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.toast-container'));
      expect(container).toBeTruthy();
    });

    it('debería renderizar múltiples notificaciones', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Message 1',
        type: 'info',
        duration: 5000
      });
      mockNotificationService.addNotification({
        id: '2',
        message: 'Message 2',
        type: 'success',
        duration: 5000
      });
      fixture.detectChanges();

      const toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(2);
    });

    it('debería mostrar el mensaje de la notificación', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test notification message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(By.css('.toast__message'));
      expect(messageElement.nativeElement.textContent).toContain('Test notification message');
    });
  });

  describe('Iconos según tipo', () => {
    it('debería mostrar icono de éxito para tipo success', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Success message',
        type: 'success',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.classes['toast--success']).toBe(true);

      const icon = fixture.debugElement.query(By.css('.toast__icon svg'));
      expect(icon).toBeTruthy();
    });

    it('debería mostrar icono de error para tipo error', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Error message',
        type: 'error',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.classes['toast--error']).toBe(true);
    });

    it('debería mostrar icono de advertencia para tipo warning', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Warning message',
        type: 'warning',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.classes['toast--warning']).toBe(true);
    });

    it('debería mostrar icono de info para tipo info', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Info message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.classes['toast--info']).toBe(true);
    });
  });

  describe('Atributos de accesibilidad', () => {
    it('debería tener role="alert" en cada toast', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.attributes['role']).toBe('alert');
    });

    it('debería tener aria-live="polite" en cada toast', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast.attributes['aria-live']).toBe('polite');
    });
  });

  describe('Evento cerrar', () => {
    it('debería tener un botón de cerrar', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.toast__close'));
      expect(closeButton).toBeTruthy();
    });

    it('debería llamar a removeNotification al hacer click en cerrar', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.toast__close'));
      closeButton.nativeElement.click();

      expect(mockNotificationService.remove).toHaveBeenCalledWith('1');
    });

    it('debería tener aria-label en el botón de cerrar', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.toast__close'));
      expect(closeButton.attributes['aria-label']).toBe('Cerrar notificación');
    });
  });

  describe('Binding con NotificationService', () => {
    it('debería reaccionar a cambios en las notificaciones del servicio', () => {
      // Inicialmente no hay notificaciones
      let toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(0);

      // Agregar notificación
      mockNotificationService.addNotification({
        id: '1',
        message: 'New notification',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(1);

      // Agregar otra notificación
      mockNotificationService.addNotification({
        id: '2',
        message: 'Another notification',
        type: 'success',
        duration: 5000
      });
      fixture.detectChanges();

      toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(2);
    });

    it('debería limpiar las notificaciones cuando el servicio se limpia', () => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'info',
        duration: 5000
      });
      fixture.detectChanges();

      let toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(1);

      mockNotificationService.clearNotifications();
      fixture.detectChanges();

      toasts = fixture.debugElement.queryAll(By.css('.toast'));
      expect(toasts.length).toBe(0);
    });
  });

  describe('Estructura del componente', () => {
    beforeEach(() => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'Test message',
        type: 'success',
        duration: 5000
      });
      fixture.detectChanges();
    });

    it('debería tener la estructura correcta: icono, contenido y botón cerrar', () => {
      const toast = fixture.debugElement.query(By.css('.toast'));

      const icon = toast.query(By.css('.toast__icon'));
      const content = toast.query(By.css('.toast__content'));
      const closeBtn = toast.query(By.css('.toast__close'));

      expect(icon).toBeTruthy();
      expect(content).toBeTruthy();
      expect(closeBtn).toBeTruthy();
    });

    it('debería tener el mensaje dentro del contenido', () => {
      const content = fixture.debugElement.query(By.css('.toast__content'));
      const message = content.query(By.css('.toast__message'));

      expect(message).toBeTruthy();
      expect(message.nativeElement.textContent).toContain('Test message');
    });
  });

  describe('Múltiples notificaciones', () => {
    beforeEach(() => {
      mockNotificationService.addNotification({
        id: '1',
        message: 'First message',
        type: 'info',
        duration: 5000
      });
      mockNotificationService.addNotification({
        id: '2',
        message: 'Second message',
        type: 'success',
        duration: 5000
      });
      mockNotificationService.addNotification({
        id: '3',
        message: 'Third message',
        type: 'error',
        duration: 5000
      });
      fixture.detectChanges();
    });

    it('debería renderizar todas las notificaciones con sus tipos', () => {
      const toasts = fixture.debugElement.queryAll(By.css('.toast'));

      expect(toasts.length).toBe(3);
      expect(toasts[0].classes['toast--info']).toBe(true);
      expect(toasts[1].classes['toast--success']).toBe(true);
      expect(toasts[2].classes['toast--error']).toBe(true);
    });

    it('debería eliminar solo la notificación clickeada', () => {
      const closeButtons = fixture.debugElement.queryAll(By.css('.toast__close'));

      closeButtons[1].nativeElement.click();

      expect(mockNotificationService.remove).toHaveBeenCalledWith('2');
      expect(mockNotificationService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
