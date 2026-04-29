import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { User, LoginCredentials, AuthResponse, UserRole } from '../../../core/models/user.model';

describe('AuthStore', () => {
  let store: AuthStore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

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

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    tokens: {
      accessToken: 'access_token_123',
      refreshToken: 'refresh_token_456',
      expiresIn: 3600
    }
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'logout'
    ]);

    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
      'removeItem'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Estado inicial', () => {
    it('debería tener el estado inicial correcto', () => {
      expect(store.isAuthenticated()).toBeFalse();
      expect(store.user()).toBeNull();
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.initialized()).toBeFalse();
    });

    it('debería inicializar desde storage si hay token y usuario', () => {
      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return 'stored_token';
        if (key === 'user') return mockUser;
        return null;
      });

      // Crear nueva instancia para que llame a initializeFromStorage
      const newStore = TestBed.inject(AuthStore);

      expect(newStore.isAuthenticated()).toBeTrue();
      expect(newStore.user()).toEqual(mockUser);
      expect(newStore.initialized()).toBeTrue();
    });

    it('debería inicializar sin autenticación si no hay token', () => {
      storageServiceSpy.getItem.and.returnValue(null);

      const newStore = TestBed.inject(AuthStore);

      expect(newStore.isAuthenticated()).toBeFalse();
      expect(newStore.user()).toBeNull();
      expect(newStore.initialized()).toBeTrue();
    });
  });

  describe('Login exitoso', () => {
    it('debería realizar login exitosamente', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      authServiceSpy.login.and.resolveTo(mockAuthResponse);

      await store.login(credentials);

      expect(store.isAuthenticated()).toBeTrue();
      expect(store.user()).toEqual(mockUser);
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBeNull();

      // Verificar que se guardaron los tokens
      expect(storageServiceSpy.setItem).toHaveBeenCalledWith('access_token', 'access_token_123');
      expect(storageServiceSpy.setItem).toHaveBeenCalledWith('refresh_token', 'refresh_token_456');
      expect(storageServiceSpy.setItem).toHaveBeenCalledWith('user', mockUser);
    });

    it('debería establecer isLoading en true durante el login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      authServiceSpy.login.and.returnValue(new Promise(() => {})); // Never resolves

      const loginPromise = store.login(credentials);

      expect(store.isLoading()).toBeTrue();
      expect(store.error()).toBeNull();

      // Cleanup
      authServiceSpy.login.and.rejectWith(new Error('Cleanup'));
      try { await loginPromise; } catch {}
    });
  });

  describe('Login con error', () => {
    it('debería manejar error de login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const errorMessage = 'Credenciales invalidas';
      authServiceSpy.login.and.rejectWith(new Error(errorMessage));

      await expectAsync(store.login(credentials)).toBeRejectedWithError(errorMessage);

      expect(store.isAuthenticated()).toBeFalse();
      expect(store.user()).toBeNull();
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
    });

    it('debería manejar error de login con mensaje por defecto', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      authServiceSpy.login.and.rejectWith('Unknown error');

      await expectAsync(store.login(credentials)).toBeRejected();

      expect(store.error()).toBe('Error de autenticacion');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Setup authenticated state
      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return 'token';
        if (key === 'user') return mockUser;
        return null;
      });
      store = TestBed.inject(AuthStore);
    });

    it('debería realizar logout correctamente', async () => {
      authServiceSpy.logout.and.resolveTo();

      await store.logout();

      expect(store.isAuthenticated()).toBeFalse();
      expect(store.user()).toBeNull();
      expect(store.error()).toBeNull();

      // Verificar que se eliminaron los tokens
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('access_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('user');
    });

    it('debería redirigir a login después del logout', async () => {
      authServiceSpy.logout.and.resolveTo();

      await store.logout();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('debería limpiar auth incluso si logout del servicio falla', async () => {
      authServiceSpy.logout.and.rejectWith(new Error('Network error'));

      await store.logout();

      expect(store.isAuthenticated()).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('Computed signals', () => {
    beforeEach(() => {
      // Setup authenticated state
      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return 'token';
        if (key === 'user') return mockUser;
        return null;
      });
      store = TestBed.inject(AuthStore);
    });

    it('debería calcular userFullName correctamente', () => {
      expect(store.userFullName()).toBe('John Doe');
    });

    it('debería retornar string vacío para userFullName cuando no hay usuario', () => {
      store.clearAuth();
      expect(store.userFullName()).toBe('');
    });

    it('debería calcular userInitials correctamente', () => {
      expect(store.userInitials()).toBe('JD');
    });

    it('debería retornar string vacío para userInitials cuando no hay usuario', () => {
      store.clearAuth();
      expect(store.userInitials()).toBe('');
    });

    it('debería verificar hasRole correctamente', () => {
      const isUser = store.hasRole('USER');
      expect(isUser()).toBeTrue();

      const isAdmin = store.hasRole('ADMIN');
      expect(isAdmin()).toBeFalse();
    });

    it('debería retornar false para hasRole cuando no hay usuario', () => {
      store.clearAuth();
      const isUser = store.hasRole('USER');
      expect(isUser()).toBeFalse();
    });
  });

  describe('ClearAuth', () => {
    it('debería limpiar estado y storage', () => {
      store.clearAuth();

      expect(store.isAuthenticated()).toBeFalse();
      expect(store.user()).toBeNull();
      expect(store.error()).toBeNull();

      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('access_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Setters', () => {
    it('debería actualizar loading con setLoading', () => {
      store.setLoading(true);
      expect(store.isLoading()).toBeTrue();

      store.setLoading(false);
      expect(store.isLoading()).toBeFalse();
    });

    it('debería actualizar error con setError', () => {
      store.setError('Error message');
      expect(store.error()).toBe('Error message');
    });

    it('debería limpiar error con clearError', () => {
      store.setError('Error message');
      store.clearError();
      expect(store.error()).toBeNull();
    });
  });

  describe('UpdateUser', () => {
    beforeEach(() => {
      storageServiceSpy.getItem.and.callFake((key: string) => {
        if (key === 'access_token') return 'token';
        if (key === 'user') return mockUser;
        return null;
      });
      store = TestBed.inject(AuthStore);
    });

    it('debería actualizar datos del usuario', () => {
      const updatedData = { firstName: 'Jane' };
      store.updateUser(updatedData);

      expect(store.user()?.firstName).toBe('Jane');
      expect(store.user()?.lastName).toBe('Doe'); // Unchanged
    });

    it('debería guardar usuario actualizado en storage', () => {
      const updatedData = { firstName: 'Jane' };
      store.updateUser(updatedData);

      const expectedUser = { ...mockUser, ...updatedData };
      expect(storageServiceSpy.setItem).toHaveBeenCalledWith('user', expectedUser);
    });

    it('no debería hacer nada si no hay usuario autenticado', () => {
      store.clearAuth();
      store.updateUser({ firstName: 'Jane' });

      // No debería llamar a setItem de nuevo
      expect(storageServiceSpy.setItem).not.toHaveBeenCalledTimes(2);
    });
  });
});
