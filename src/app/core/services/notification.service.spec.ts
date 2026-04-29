import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { NotificationService, Notification, NotificationType } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    service.clearAll();
    // No llamar flush() aquí porque solo funciona dentro de fakeAsync.
    // Cada test que usa fakeAsync debe limpiar sus propios timers.
  });

  describe('Creación', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería tener una lista vacía de notificaciones inicialmente', () => {
      expect(service.notifications()).toEqual([]);
    });
  });

  describe('Agregar notificación', () => {
    it('debería agregar una notificación', () => {
      service.show('Test message');

      expect(service.notifications().length).toBe(1);
      expect(service.notifications()[0].message).toBe('Test message');
    });

    it('debería retornar el ID de la notificación creada', () => {
      const id = service.show('Test message');

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(service.notifications()[0].id).toBe(id);
    });

    it('debería agregar múltiples notificaciones', () => {
      service.show('Message 1');
      service.show('Message 2');
      service.show('Message 3');

      expect(service.notifications().length).toBe(3);
    });

    it('debería asignar tipo info por defecto', () => {
      service.show('Test message');

      expect(service.notifications()[0].type).toBe('info');
    });

    it('debería asignar duración por defecto de 5000ms', () => {
      service.show('Test message');
      expect(service.notifications()[0].duration).toBe(5000);
    });

    it('debería permitir personalizar el tipo', () => {
      service.show('Test message', 'success');

      expect(service.notifications()[0].type).toBe('success');
    });

    it('debería permitir personalizar la duración', () => {
      service.show('Test message', 'info', 10000);

      expect(service.notifications()[0].duration).toBe(10000);
    });
  });

  describe('Métodos de conveniencia', () => {
    it('showSuccess debería crear notificación de tipo success', () => {
      service.showSuccess('Success message');

      expect(service.notifications()[0].type).toBe('success');
      expect(service.notifications()[0].message).toBe('Success message');
    });

    it('showError debería crear notificación de tipo error', () => {
      service.showError('Error message');

      expect(service.notifications()[0].type).toBe('error');
      expect(service.notifications()[0].message).toBe('Error message');
    });

    it('showWarning debería crear notificación de tipo warning', () => {
      service.showWarning('Warning message');

      expect(service.notifications()[0].type).toBe('warning');
      expect(service.notifications()[0].message).toBe('Warning message');
    });

    it('showInfo debería crear notificación de tipo info', () => {
      service.showInfo('Info message');

      expect(service.notifications()[0].type).toBe('info');
      expect(service.notifications()[0].message).toBe('Info message');
    });

    it('showSuccess debería usar duración personalizada', () => {
      service.showSuccess('Success message', 3000);

      expect(service.notifications()[0].duration).toBe(3000);
    });
  });

  describe('Límite de notificaciones', () => {
    it('debería permitir máximo 5 notificaciones', () => {
      for (let i = 0; i < 7; i++) {
        service.show(`Message ${i}`);
      }

      expect(service.notifications().length).toBe(5);
    });

    it('debería eliminar la notificación más antigua al superar el límite', () => {
      service.show('Message 1');
      service.show('Message 2');
      service.show('Message 3');
      service.show('Message 4');
      service.show('Message 5');
      service.show('Message 6');

      const messages = service.notifications().map(n => n.message);
      expect(messages).not.toContain('Message 1');
      expect(messages).toContain('Message 6');
    });
  });

  describe('Auto-dismiss', () => {
    it('debería eliminar la notificación automáticamente después de la duración', fakeAsync(() => {
      service.show('Test message', 'info', 1000);
      expect(service.notifications().length).toBe(1);

      tick(1000);
      expect(service.notifications().length).toBe(0);
    }));

    it('no debería auto-eliminar si la duración es 0', fakeAsync(() => {
      service.show('Test message', 'info', 0);
      expect(service.notifications().length).toBe(1);

      tick(10000);
      expect(service.notifications().length).toBe(1);
    }));

    it('debería manejar múltiples notificaciones con diferentes duraciones', fakeAsync(() => {
      const id1 = service.show('Message 1', 'info', 500);
      const id2 = service.show('Message 2', 'info', 1000);
      const id3 = service.show('Message 3', 'info', 1500);

      expect(service.notifications().length).toBe(3);

      tick(500);
      expect(service.notifications().length).toBe(2);
      expect(service.notifications().find(n => n.id === id1)).toBeUndefined();

      tick(500);
      expect(service.notifications().length).toBe(1);
      expect(service.notifications().find(n => n.id === id2)).toBeUndefined();

      tick(500);
      expect(service.notifications().length).toBe(0);
      expect(service.notifications().find(n => n.id === id3)).toBeUndefined();
    }));
  });

  describe('Remove manual', () => {
    it('debería eliminar una notificación por su ID', () => {
      const id = service.show('Test message');
      expect(service.notifications().length).toBe(1);

      service.remove(id);
      expect(service.notifications().length).toBe(0);
    });

    it('no debería lanzar error al eliminar un ID inexistente', () => {
      expect(() => service.remove('non-existent-id')).not.toThrow();
    });

    it('debería limpiar el timer al eliminar manualmente', fakeAsync(() => {
      const id = service.show('Test message', 'info', 5000);

      service.remove(id);

      tick(5000);
      expect(service.notifications().length).toBe(0);
    }));
  });

  describe('ClearAll', () => {
    it('debería eliminar todas las notificaciones', () => {
      service.show('Message 1');
      service.show('Message 2');
      service.show('Message 3');

      service.clearAll();

      expect(service.notifications().length).toBe(0);
    });

    it('debería limpiar todos los timers', fakeAsync(() => {
      service.show('Message 1', 'info', 5000);
      service.show('Message 2', 'info', 5000);
      service.show('Message 3', 'info', 5000);

      service.clearAll();

      tick(5000);
      expect(service.notifications().length).toBe(0);
    }));
  });

  describe('Propiedades de notificación', () => {
    it('cada notificación debería tener un ID único', () => {
      const id1 = service.show('Message 1');
      const id2 = service.show('Message 2');
      const id3 = service.show('Message 3');

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('la señal notifications no debería incluir timerId', () => {
      service.show('Test message');

      const notification = service.notifications()[0];
      expect(notification).not.toHaveProperty('timerId');
    });
  });

  describe('Notificaciones reactivas', () => {
    it('las notificaciones deberían ser reactivas (signals)', () => {
      const notifications = service.notifications;
      expect(typeof notifications).toBe('function');
    });

    it('debería actualizarse cuando se agrega una notificación', () => {
      let currentLength = service.notifications().length;
      expect(currentLength).toBe(0);

      service.show('New message');
      currentLength = service.notifications().length;
      expect(currentLength).toBe(1);
    });
  });
});
