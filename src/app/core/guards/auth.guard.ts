import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { StorageService } from '../services/storage.service';
import { User } from '../models/user.model';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const token = storageService.getItem<string>('access_token');
  const user = storageService.getItem<User>('user');

  if (token && typeof token === 'string' && user) {
    // Verificar si el token no ha expirado
    const tokenData = parseJwt(token);
    if (tokenData && tokenData.exp * 1000 > Date.now()) {
      return true;
    }
    
    // Token expirado, limpiar storage
    storageService.removeItem('access_token');
    storageService.removeItem('refresh_token');
    storageService.removeItem('user');
  }

  // Redirigir al login con la URL de retorno
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Helper para decodificar JWT
function parseJwt(token: string): { exp: number } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Guard para redirigir usuarios autenticados (ej: de login a dashboard)
export const publicGuard: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const token = storageService.getItem<string>('access_token');

  if (token) {
    return router.createUrlTree(['/dashboard']);
  }
  
  return true;
};

// Guard basado en roles
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const storageService = inject(StorageService);
    const router = inject(Router);

    const user = storageService.getItem<User>('user');

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
};
