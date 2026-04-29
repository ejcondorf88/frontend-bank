import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService, ErrorMapping } from './error-handler.service';
import { NotificationService } from './notification.service';

// Mock del NotificationService
class MockNotificationService {
  showError = jest.fn();
  showSuccess = jest.fn();
  showWarning = jest.fn();
}

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let notificationService: MockNotificationService;

  beforeEach(() => {
    notificationService = new MockNotificationService();

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: NotificationService, useValue: notificationService }
      ]
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Creación', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Mapeo de códigos HTTP a mensajes', () => {
    it('debería mapear código 0 (sin conexión)', () => {
      const error = new HttpErrorResponse({ status: 0 });
      const message = service.handleError(error, false);

      expect(message).toBe('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    });

    it('debería mapear código 400 (Bad Request)', () => {
      const error = new HttpErrorResponse({ status: 400 });
      const message = service.handleError(error, false);

      expect(message).toBe('La solicitud no es válida. Verifica los datos ingresados.');
    });

    it('debería mapear código 401 (Unauthorized)', () => {
      const error = new HttpErrorResponse({ status: 401 });
      const message = service.handleError(error, false);

      expect(message).toBe('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    });

    it('debería mapear código 403 (Forbidden)', () => {
      const error = new HttpErrorResponse({ status: 403 });
      const message = service.handleError(error, false);

      expect(message).toBe('No tienes permisos para realizar esta acción.');
    });

    it('debería mapear código 404 (Not Found)', () => {
      const error = new HttpErrorResponse({ status: 404 });
      const message = service.handleError(error, false);

      expect(message).toBe('El recurso solicitado no fue encontrado.');
    });

    it('debería mapear código 422 (Unprocessable Entity)', () => {
      const error = new HttpErrorResponse({ status: 422 });
      const message = service.handleError(error, false);

      expect(message).toBe('Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.');
    });

    it('debería mapear código 500 (Internal Server Error)', () => {
      const error = new HttpErrorResponse({ status: 500 });
      const message = service.handleError(error, false);

      expect(message).toBe('Ocurrió un error interno en el servidor. Por favor, intenta más tarde.');
    });

    it('debería mapear código 503 (Service Unavailable)', () => {
      const error = new HttpErrorResponse({ status: 503 });
      const message = service.handleError(error, false);

      expect(message).toBe('El servicio no está disponible temporalmente. Por favor, intenta más tarde.');
    });
  });

  describe('Mensajes por defecto', () => {
    it('debería usar mensaje por defecto para errores 5xx no mapeados', () => {
      const error = new HttpErrorResponse({ status: 502 });
      const message = service.handleError(error, false);

      expect(message).toBe('Error del servidor. Por favor, intenta más tarde.');
    });

    it('debería usar mensaje por defecto para errores 4xx no mapeados', () => {
      const error = new HttpErrorResponse({ status: 418 });
      const message = service.handleError(error, false);

      expect(message).toBe('Error en la solicitud. Por favor, verifica los datos.');
    });

    it('debería usar mensaje por defecto para errores desconocidos', () => {
      const error = new HttpErrorResponse({ status: 999 });
      const message = service.handleError(error, false);

      expect(message).toBe('Ocurrió un error inesperado. Por favor, intenta nuevamente.');
    });
  });

  describe('Mensajes custom del servidor', () => {
    it('debería usar el mensaje del servidor si existe', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: 'Custom server message' }
      });
      const message = service.handleError(error, false);

      expect(message).toBe('Custom server message');
    });

    it('debería ignorar mensaje del servidor si no es string', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { message: 123 }
      });
      const message = service.handleError(error, false);

      expect(message).toBe('La solicitud no es válida. Verifica los datos ingresados.');
    });

    it('debería ignorar mensaje del servidor si no existe', () => {
      const error = new HttpErrorResponse({
        status: 400,
        error: { otherField: 'value' }
      });
      const message = service.handleError(error, false);

      expect(message).toBe('La solicitud no es válida. Verifica los datos ingresados.');
    });
  });

  describe('Notificaciones al usuario', () => {
    it('debería mostrar notificación por defecto', () => {
      const error = new HttpErrorResponse({ status: 400 });
      service.handleError(error);

      expect(notificationService.showError).toHaveBeenCalledWith('La solicitud no es válida. Verifica los datos ingresados.');
    });

    it('no debería mostrar notificación cuando showNotification es false', () => {
      const error = new HttpErrorResponse({ status: 400 });
      service.handleError(error, false);

      expect(notificationService.showError).not.toHaveBeenCalled();
    });

    it('debería mostrar notificación para errores sin mapeo específico', () => {
      const error = new HttpErrorResponse({ status: 418 });
      service.handleError(error);

      expect(notificationService.showError).toHaveBeenCalledWith('Error en la solicitud. Por favor, verifica los datos.');
    });
  });

  describe('getErrorMessage', () => {
    it('debería retornar el mensaje sin mostrar notificación', () => {
      const error = new HttpErrorResponse({ status: 404 });
      const message = service.getErrorMessage(error);

      expect(message).toBe('El recurso solicitado no fue encontrado.');
      expect(notificationService.showError).not.toHaveBeenCalled();
    });
  });

  describe('handleSilent', () => {
    it('debería hacer log del error sin mostrar notificación', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new HttpErrorResponse({
        status: 500,
        url: '/api/test',
        error: { detail: 'Server error' }
      });

      service.handleSilent(error);

      expect(consoleSpy).toHaveBeenCalledWith('[ErrorHandler - Silent]', {
        status: 500,
        url: '/api/test',
        error: { detail: 'Server error' }
      });
      expect(notificationService.showError).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Métodos custom', () => {
    describe('showCustomError', () => {
      it('debería mostrar error personalizado', () => {
        service.showCustomError('Custom error message');

        expect(notificationService.showError).toHaveBeenCalledWith('Custom error message');
      });
    });

    describe('showCustomSuccess', () => {
      it('debería mostrar mensaje de éxito personalizado', () => {
        service.showCustomSuccess('Custom success message');

        expect(notificationService.showSuccess).toHaveBeenCalledWith('Custom success message');
      });
    });

    describe('showCustomWarning', () => {
      it('debería mostrar advertencia personalizada', () => {
        service.showCustomWarning('Custom warning message');

        expect(notificationService.showWarning).toHaveBeenCalledWith('Custom warning message');
      });
    });
  });

  describe('Logging', () => {
    it('debería hacer log del error en la consola', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new HttpErrorResponse({
        status: 400,
        url: '/api/test',
        error: { detail: 'Validation failed' }
      });

      service.handleError(error, false);

      expect(consoleSpy).toHaveBeenCalledWith('[ErrorHandler]', {
        status: 400,
        message: 'La solicitud no es válida. Verifica los datos ingresados.',
        url: '/api/test',
        error: { detail: 'Validation failed' }
      });

      consoleSpy.mockRestore();
    });
  });
});
