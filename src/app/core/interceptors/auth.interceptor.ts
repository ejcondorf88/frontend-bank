import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const errorHandler = inject(ErrorHandlerService);

  const token = storageService.getItem('access_token');

  // Clonar la request si hay token
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar errores de autenticación
      if (error.status === 401) {
        // Token expirado o inválido
        storageService.removeItem('access_token');
        storageService.removeItem('refresh_token');
        storageService.removeItem('user');

        router.navigate(['/auth/login']);
      }

      // Manejar errores HTTP usando ErrorHandlerService
      // Esto mostrará notificaciones visuales automáticamente
      errorHandler.handleError(error);

      // Propagar el error
      return throwError(() => error);
    })
  );
};

// Interceptor para logging de requests (desarrollo)
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  console.log(`[HTTP] ${req.method} ${req.url}`);
  
  return next(req).pipe(
    catchError(error => {
      console.error(`[HTTP Error] ${req.method} ${req.url}`, error);
      return throwError(() => error);
    })
  );
};

// Interceptor para agregar headers comunes
export const commonHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  return next(modifiedReq);
};
