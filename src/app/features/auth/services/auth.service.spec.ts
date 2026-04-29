import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User, LoginCredentials, RegisterData, UserRole, PasswordResetRequest, PasswordResetConfirm } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/auth`;

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

  const mockAuthResponse = {
    user: mockUser,
    tokens: {
      accessToken: 'access_token_123',
      refreshToken: 'refresh_token_456',
      expiresIn: 3600
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    it('debería realizar login con credenciales correctas', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);

      const response = await promise;
      expect(response).toEqual(mockAuthResponse);
    });

    it('debería enviar rememberMe en el body cuando se proporciona', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);

      await promise;
    });

    it('debería manejar error 401 al hacer login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(
        { message: 'Credenciales invalidas' },
        { status: 401, statusText: 'Unauthorized' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 401
      }));
    });

    it('debería manejar error 500 del servidor', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 500
      }));
    });

    it('debería manejar error de red', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const promise = service.login(credentials);

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.error(new ProgressEvent('Network error'));

      await expectAsync(promise).toBeRejected();
    });
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const promise = service.register(registerData);

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);

      const response = await promise;
      expect(response).toEqual(mockAuthResponse);
    });

    it('debería incluir phoneNumber opcional', async () => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '+1234567890'
      };

      const promise = service.register(registerData);

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);

      await promise;
    });

    it('debería manejar error 409 si el email ya existe', async () => {
      const registerData: RegisterData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const promise = service.register(registerData);

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush(
        { message: 'Email already exists' },
        { status: 409, statusText: 'Conflict' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 409
      }));
    });
  });

  describe('logout', () => {
    it('debería realizar logout', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);

      await promise;
    });

    it('debería manejar error 401 al hacer logout', async () => {
      const promise = service.logout();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 401
      }));
    });
  });

  describe('refreshToken', () => {
    it('debería refrescar el token', async () => {
      const refreshToken = 'old_refresh_token';
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 3600
      };

      const promise = service.refreshToken(refreshToken);

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken });
      req.flush(newTokens);

      const response = await promise;
      expect(response).toEqual(newTokens);
    });

    it('debería manejar error 401 con token de refresh invalido', async () => {
      const refreshToken = 'invalid_token';

      const promise = service.refreshToken(refreshToken);

      const req = httpMock.expectOne(`${apiUrl}/refresh`);
      req.flush(
        { message: 'Invalid refresh token' },
        { status: 401, statusText: 'Unauthorized' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 401
      }));
    });
  });

  describe('verifyEmail', () => {
    it('debería verificar email con token', async () => {
      const token = 'verification_token_123';

      const promise = service.verifyEmail(token);

      const req = httpMock.expectOne(`${apiUrl}/verify-email`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token });
      req.flush(null);

      await promise;
    });
  });

  describe('requestPasswordReset', () => {
    it('debería solicitar reset de password', async () => {
      const data: PasswordResetRequest = { email: 'test@example.com' };

      const promise = service.requestPasswordReset(data);

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(null);

      await promise;
    });
  });

  describe('confirmPasswordReset', () => {
    it('debería confirmar reset de password', async () => {
      const data: PasswordResetConfirm = {
        token: 'reset_token_123',
        newPassword: 'newpassword123'
      };

      const promise = service.confirmPasswordReset(data);

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(null);

      await promise;
    });
  });

  describe('changePassword', () => {
    it('debería cambiar el password', async () => {
      const currentPassword = 'oldpassword123';
      const newPassword = 'newpassword123';

      const promise = service.changePassword(currentPassword, newPassword);

      const req = httpMock.expectOne(`${apiUrl}/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword, newPassword });
      req.flush(null);

      await promise;
    });

    it('debería manejar error 400 si el password actual es incorrecto', async () => {
      const promise = service.changePassword('wrongpassword', 'newpassword');

      const req = httpMock.expectOne(`${apiUrl}/change-password`);
      req.flush(
        { message: 'Current password is incorrect' },
        { status: 400, statusText: 'Bad Request' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 400
      }));
    });
  });

  describe('getCurrentUser', () => {
    it('debería obtener el usuario actual', async () => {
      const promise = service.getCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      const response = await promise;
      expect(response).toEqual(mockUser);
    });

    it('debería manejar error 401 si no está autenticado', async () => {
      const promise = service.getCurrentUser();

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );

      await expectAsync(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 401
      }));
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar el perfil', async () => {
      const userData = { firstName: 'Jane', lastName: 'Smith' };
      const updatedUser = { ...mockUser, ...userData };

      const promise = service.updateProfile(userData);

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(userData);
      req.flush(updatedUser);

      const response = await promise;
      expect(response).toEqual(updatedUser);
    });
  });

  describe('uploadAvatar', () => {
    it('debería subir avatar como FormData', async () => {
      const file = new File(['image content'], 'avatar.png', { type: 'image/png' });
      const response = { avatarUrl: 'https://example.com/avatar.png' };

      const promise = service.uploadAvatar(file);

      const req = httpMock.expectOne(`${apiUrl}/avatar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(response);

      const result = await promise;
      expect(result).toEqual(response);
    });
  });

  describe('enableTwoFactor', () => {
    it('debería habilitar 2FA y retornar QR code', async () => {
      const response = {
        qrCode: 'data:image/png;base64,xxx',
        secret: 'secret_key'
      };

      const promise = service.enableTwoFactor();

      const req = httpMock.expectOne(`${apiUrl}/2fa/enable`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(response);

      const result = await promise;
      expect(result).toEqual(response);
    });
  });

  describe('verifyTwoFactor', () => {
    it('debería verificar código 2FA', async () => {
      const code = '123456';
      const response = { verified: true };

      const promise = service.verifyTwoFactor(code);

      const req = httpMock.expectOne(`${apiUrl}/2fa/verify`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ code });
      req.flush(response);

      const result = await promise;
      expect(result).toEqual(response);
    });
  });

  describe('disableTwoFactor', () => {
    it('debería deshabilitar 2FA', async () => {
      const password = 'password123';

      const promise = service.disableTwoFactor(password);

      const req = httpMock.expectOne(`${apiUrl}/2fa/disable`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ password });
      req.flush(null);

      await promise;
    });
  });
});
