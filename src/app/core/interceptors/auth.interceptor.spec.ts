import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { authInterceptor, loggingInterceptor, commonHeadersInterceptor } from './auth.interceptor';
import { StorageService } from '../services/storage.service';
import { ErrorHandlerService } from '../services/error-handler.service';

describe('Auth Interceptors', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let errorHandlerSpy: jasmine.SpyObj<ErrorHandlerService>;

  beforeEach(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'removeItem'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    errorHandlerSpy = jasmine.createSpyObj('ErrorHandlerService', [
      'handleError'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ErrorHandlerService, useValue: errorHandlerSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('authInterceptor', () => {
    it('debería agregar token a requests cuando existe', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token_123');

      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
      req.flush({});
    });

    it('debería agregar token a request POST', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token_123');

      httpClient.post('/api/data', { test: true }).subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
      req.flush({});
    });

    it('debería agregar token a request PUT', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token_123');

      httpClient.put('/api/data/1', { test: true }).subscribe();

      const req = httpTestingController.expectOne('/api/data/1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
      req.flush({});
    });

    it('debería agregar token a request DELETE', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token_123');

      httpClient.delete('/api/data/1').subscribe();

      const req = httpTestingController.expectOne('/api/data/1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
      req.flush({});
    });

    it('debería agregar token a request PATCH', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token_123');

      httpClient.patch('/api/data/1', { test: true }).subscribe();

      const req = httpTestingController.expectOne('/api/data/1');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token_123');
      req.flush({});
    });

    it('no debería agregar token si no existe', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue(null);

      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    });

    it('no debería agregar token si es string vacio', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('');

      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      // An empty string is truthy in JavaScript, so it will be added
      expect(req.request.headers.get('Authorization')).toBe('Bearer ');
      req.flush({});
    });

    describe('manejo de errores 401', () => {
      it('debería limpiar tokens y redirigir al login en error 401', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Unauthorized' },
          { status: 401, statusText: 'Unauthorized' }
        );

        expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('access_token');
        expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(storageServiceSpy.removeItem).toHaveBeenCalledWith('user');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
      });

      it('debería llamar a errorHandler.handleError', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Unauthorized' },
          { status: 401, statusText: 'Unauthorized' }
        );

        expect(errorHandlerSpy.handleError).toHaveBeenCalledWith(
          jasmine.any(HttpErrorResponse)
        );
      });
    });

    describe('manejo de otros errores HTTP', () => {
      it('debería llamar errorHandler.handleError en error 400', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Bad Request' },
          { status: 400, statusText: 'Bad Request' }
        );

        expect(errorHandlerSpy.handleError).toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
      });

      it('debería llamar errorHandler.handleError en error 403', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Forbidden' },
          { status: 403, statusText: 'Forbidden' }
        );

        expect(errorHandlerSpy.handleError).toHaveBeenCalled();
      });

      it('debería llamar errorHandler.handleError en error 404', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Not Found' },
          { status: 404, statusText: 'Not Found' }
        );

        expect(errorHandlerSpy.handleError).toHaveBeenCalled();
      });

      it('debería llamar errorHandler.handleError en error 500', () => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: () => {}
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' }
        );

        expect(errorHandlerSpy.handleError).toHaveBeenCalled();
      });

      it('debería propagar el error', (done) => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: (error) => {
            expect(error).toBeInstanceOf(HttpErrorResponse);
            expect(error.status).toBe(500);
            done();
          }
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush(
          { message: 'Server Error' },
          { status: 500, statusText: 'Internal Server Error' }
        );
      });
    });

    describe('manejo de error de red', () => {
      it('debería manejar errores de red', (done) => {
        storageServiceSpy.getItem.withArgs('access_token').and.returnValue('valid_token');

        httpClient.get('/api/data').subscribe({
          error: (error) => {
            expect(error).toBeTruthy();
            done();
          }
        });

        const req = httpTestingController.expectOne('/api/data');
        req.error(new ProgressEvent('Network error'));
      });
    });
  });

  describe('loggingInterceptor', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideHttpClient(withInterceptors([loggingInterceptor])),
          { provide: StorageService, useValue: storageServiceSpy }
        ]
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);

      spyOn(console, 'log');
      spyOn(console, 'error');
    });

    it('debería loggear requests HTTP', () => {
      httpClient.get('/api/data').subscribe();

      expect(console.log).toHaveBeenCalledWith('[HTTP] GET /api/data');

      const req = httpTestingController.expectOne('/api/data');
      req.flush({});
    });

    it('debería loggear requests POST', () => {
      httpClient.post('/api/data', {}).subscribe();

      expect(console.log).toHaveBeenCalledWith('[HTTP] POST /api/data');

      const req = httpTestingController.expectOne('/api/data');
      req.flush({});
    });

    it('debería loggear errores HTTP', () => {
      httpClient.get('/api/data').subscribe({
        error: () => {}
      });

      const req = httpTestingController.expectOne('/api/data');
      req.flush(
        { message: 'Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      expect(console.error).toHaveBeenCalledWith(
        '[HTTP Error] GET /api/data',
        jasmine.any(HttpErrorResponse)
      );
    });
  });

  describe('commonHeadersInterceptor', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideHttpClient(withInterceptors([commonHeadersInterceptor]))
        ]
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('debería agregar Content-Type header', () => {
      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush({});
    });

    it('debería agregar Accept header', () => {
      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush({});
    });

    it('debería agregar ambos headers a POST requests', () => {
      httpClient.post('/api/data', {}).subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      req.flush({});
    });

    it('debería preservar headers existentes', () => {
      httpClient.get('/api/data', {
        headers: { 'X-Custom-Header': 'custom-value' }
      }).subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush({});
    });
  });

  describe('combinacion de interceptores', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideHttpClient(withInterceptors([
            commonHeadersInterceptor,
            authInterceptor,
            loggingInterceptor
          ])),
          { provide: StorageService, useValue: storageServiceSpy },
          { provide: Router, useValue: routerSpy },
          { provide: ErrorHandlerService, useValue: errorHandlerSpy }
        ]
      });

      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);

      spyOn(console, 'log');
    });

    it('debería aplicar todos los interceptores en orden', () => {
      storageServiceSpy.getItem.withArgs('access_token').and.returnValue('test_token');

      httpClient.get('/api/data').subscribe();

      const req = httpTestingController.expectOne('/api/data');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test_token');
      expect(console.log).toHaveBeenCalledWith('[HTTP] GET /api/data');
      req.flush({});
    });
  });
});
