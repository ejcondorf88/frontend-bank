import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard, publicGuard, roleGuard } from './auth.guard';
import { StorageService } from '../services/storage.service';
import { User, UserRole } from '../models/user.model';

describe('Auth Guards', () => {
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let mockRouterStateSnapshot: RouterStateSnapshot;

  const createMockToken = (exp: number): string => {
    // Create a mock JWT token with the specified expiration
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp: exp }));
    const signature = btoa('signature');
    return `${header}.${payload}.${signature}`;
  };

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'removeItem'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree', 'navigate']);

    mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    mockRouterStateSnapshot = {
      url: '/dashboard'
    } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  describe('authGuard', () => {
    beforeEach(() => {
      // Create a mock UrlTree that matches the expected structure
      const mockUrlTree = new UrlTree();
      mockUrlTree.queryParams = { returnUrl: '/dashboard' };
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);
    });

    it('debería permitir acceso cuando hay token y usuario valido', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = createMockToken(futureExp);

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return validToken;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería permitir acceso cuando token no ha expirado', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createMockToken(futureExp);

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return validToken;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería redirigir a login cuando no hay token', () => {
      storageServiceSpy.getItem.and.returnValue(null);

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
      expect(result).toBe(routerSpy.createUrlTree.returnValue);
    });

    it('debería redirigir a login cuando no hay usuario', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = createMockToken(futureExp);

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return validToken;
        if (key === 'user') return null;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
    });

    it('debería redirigir a login cuando el token ha expirado', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = createMockToken(pastExp);

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return expiredToken;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      // Should clear storage
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('access_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('user');

      // Should redirect to login
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
    });

    it('debería redirigir a login cuando el token es invalido', () => {
      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return 'invalid_token';
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: '/dashboard' } }
      );
    });

    it('debería incluir returnUrl en la redireccion', () => {
      storageServiceSpy.getItem.and.returnValue(null);

      const customUrl = '/profile/settings';
      const customState = { url: customUrl } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, customState)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        { queryParams: { returnUrl: customUrl } }
      );
    });

    it('debería manejar token expirado exactamente ahora', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiredToken = createMockToken(currentTime);

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return expiredToken;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      // Token expirado (exp * 1000 <= Date.now())
      expect(routerSpy.createUrlTree).toHaveBeenCalled();
    });
  });

  describe('publicGuard', () => {
    it('debería permitir acceso cuando no hay token', () => {
      storageServiceSpy.getItem.and.returnValue(null);

      const result = TestBed.runInInjectionContext(() =>
        publicGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería redirigir a dashboard cuando hay token', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

      const mockUrlTree = new UrlTree();
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const result = TestBed.runInInjectionContext(() =>
        publicGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      expect(result).toBe(mockUrlTree);
    });

    it('debería redirigir a dashboard incluso con token vacio', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('');

      const mockUrlTree = new UrlTree();
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const result = TestBed.runInInjectionContext(() =>
        publicGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      // Empty string is truthy in JavaScript
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('roleGuard', () => {
    it('debería permitir acceso cuando el usuario tiene el rol permitido', () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(adminUser);

      const guard = roleGuard(['ADMIN', 'MANAGER']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería permitir acceso cuando el usuario tiene uno de los roles permitidos', () => {
      const managerUser = { ...mockUser, role: UserRole.MANAGER };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(managerUser);

      const guard = roleGuard(['ADMIN', 'MANAGER']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería redirigir a dashboard cuando el usuario no tiene el rol permitido', () => {
      const userRole = { ...mockUser, role: UserRole.USER };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(userRole);

      const mockUrlTree = new UrlTree();
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const guard = roleGuard(['ADMIN']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
      expect(result).toBe(mockUrlTree);
    });

    it('debería redirigir a dashboard cuando no hay usuario', () => {
      storageServiceSpy.getItem.withArgs('user').and.returnValue(null);

      const mockUrlTree = new UrlTree();
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const guard = roleGuard(['ADMIN']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });

    it('debería funcionar con rol MANAGER', () => {
      const managerUser = { ...mockUser, role: UserRole.MANAGER };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(managerUser);

      const guard = roleGuard(['MANAGER']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería funcionar con rol USER', () => {
      const userRole = { ...mockUser, role: UserRole.USER };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(userRole);

      const guard = roleGuard(['USER', 'GUEST']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería funcionar con rol GUEST', () => {
      const guestUser = { ...mockUser, role: UserRole.GUEST };

      storageServiceSpy.getItem.withArgs('user').and.returnValue(guestUser);

      const guard = roleGuard(['GUEST']);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería redirigir cuando los roles permitidos estan vacios', () => {
      storageServiceSpy.getItem.withArgs('user').and.returnValue(mockUser);

      const mockUrlTree = new UrlTree();
      routerSpy.createUrlTree.and.returnValue(mockUrlTree);

      const guard = roleGuard([]);
      const result = TestBed.runInInjectionContext(() =>
        guard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  describe('parseJwt helper (via authGuard behavior)', () => {
    it('debería manejar token con caracteres especiales en base64', () => {
      // Create a token with special characters that need URL-safe conversion
      const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const base64Url = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const token = `header.${base64Url}.signature`;

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return token;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });

    it('debería manejar token con caracteres que necesitan padding', () => {
      const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
      // Create payload that doesn't need padding
      const base64 = btoa(JSON.stringify(payload));
      const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_');

      const token = `header.${base64Url}.signature`;

      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return token;
        if (key === 'user') return mockUser;
        return null;
      });

      const result = TestBed.runInInjectionContext(() =>
        authGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot)
      );

      expect(result).toBeTrue();
    });
  });
});
