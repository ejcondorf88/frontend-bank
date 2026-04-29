import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

export interface ErrorMapping {
  code: number;
  message: string;
  showToUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  // Mapeo de códigos HTTP a mensajes amigables en español
  private readonly errorMappings: Map<number, ErrorMapping> = new Map([
    [0, {
      code: 0,
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      showToUser: true
    }],
    [400, {
      code: 400,
      message: 'La solicitud no es válida. Verifica los datos ingresados.',
      showToUser: true
    }],
    [401, {
      code: 401,
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      showToUser: true
    }],
    [403, {
      code: 403,
      message: 'No tienes permisos para realizar esta acción.',
      showToUser: true
    }],
    [404, {
      code: 404,
      message: 'El recurso solicitado no fue encontrado.',
      showToUser: true
    }],
    [422, {
      code: 422,
      message: 'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.',
      showToUser: true
    }],
    [500, {
      code: 500,
      message: 'Ocurrió un error interno en el servidor. Por favor, intenta más tarde.',
      showToUser: true
    }],
    [503, {
      code: 503,
      message: 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.',
      showToUser: true
    }]
  ]);

  constructor(private notificationService: NotificationService) {}

  /**
   * Maneja un error HTTP y muestra notificación al usuario si corresponde
   */
  handleError(error: HttpErrorResponse, showNotification: boolean = true): string {
    const status = error.status;
    const errorMapping = this.errorMappings.get(status);

    let message: string;

    if (errorMapping) {
      message = errorMapping.message;
    } else if (status >= 500) {
      message = 'Error del servidor. Por favor, intenta más tarde.';
    } else if (status >= 400) {
      message = 'Error en la solicitud. Por favor, verifica los datos.';
    } else {
      message = 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
    }

    // Si hay un mensaje específico del servidor, usarlo
    if (error.error?.message && typeof error.error.message === 'string') {
      message = error.error.message;
    }

    // Mostrar notificación si está habilitado y el error debe mostrarse al usuario
    if (showNotification && (!errorMapping || errorMapping.showToUser)) {
      this.notificationService.showError(message);
    }

    // Log para debugging
    console.error('[ErrorHandler]', {
      status,
      message,
      url: error.url,
      error: error.error
    });

    return message;
  }

  /**
   * Obtiene el mensaje de error sin mostrar notificación
   */
  getErrorMessage(error: HttpErrorResponse): string {
    return this.handleError(error, false);
  }

  /**
   * Maneja un error de forma silenciosa (solo logging)
   */
  handleSilent(error: HttpErrorResponse): void {
    console.error('[ErrorHandler - Silent]', {
      status: error.status,
      url: error.url,
      error: error.error
    });
  }

  /**
   * Registra un mensaje de error personalizado
   */
  showCustomError(message: string): void {
    this.notificationService.showError(message);
  }

  /**
   * Registra un mensaje de éxito personalizado
   */
  showCustomSuccess(message: string): void {
    this.notificationService.showSuccess(message);
  }

  /**
   * Registra un mensaje de advertencia personalizado
   */
  showCustomWarning(message: string): void {
    this.notificationService.showWarning(message);
  }
}
