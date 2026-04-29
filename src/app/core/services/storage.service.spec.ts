import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let localStorageMock: Storage;
  let sessionStorageMock: Storage;
  let consoleErrorSpy: jasmine.Spy;

  const mockLocalStorage = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; }
    } as Storage;
  })();

  const mockSessionStorage = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      key: (index: number) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; }
    } as Storage;
  })();

  beforeEach(() => {
    localStorageMock = mockLocalStorage;
    sessionStorageMock = mockSessionStorage;

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });

    consoleErrorSpy = spyOn(console, 'error').and.callThrough();

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorageMock.clear();
    sessionStorageMock.clear();
    consoleErrorSpy.calls.reset();
  });

  describe('LocalStorage operations', () => {
    describe('getItem', () => {
      it('debería obtener item de localStorage', () => {
        const data = { name: 'Test', value: 123 };
        localStorageMock.setItem('test-key', JSON.stringify(data));

        const result = service.getItem<typeof data>('test-key');
        expect(result).toEqual(data);
      });

      it('debería retornar null si el item no existe', () => {
        const result = service.getItem('non-existent-key');
        expect(result).toBeNull();
      });

      it('debería retornar string directamente si no es JSON valido', () => {
        localStorageMock.setItem('string-key', 'plain string');

        const result = service.getItem<string>('string-key');
        expect(result).toBe('plain string');
      });

      it('debería retornar null y loggear error si localStorage lanza error', () => {
        spyOn(localStorageMock, 'getItem').and.throwError('Storage error');

        const result = service.getItem('test-key');
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error reading from localStorage: test-key',
          jasmine.any(Error)
        );
      });

      it('debería retornar null si window no esta definido', () => {
        const originalWindow = window;
        Object.defineProperty(global, 'window', { value: undefined, writable: true });

        const result = service.getItem('test-key');
        expect(result).toBeNull();

        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
      });
    });

    describe('setItem', () => {
      it('debería guardar objeto como JSON string', () => {
        const data = { name: 'Test', value: 123 };
        service.setItem('test-key', data);

        const stored = localStorageMock.getItem('test-key');
        expect(stored).toBe(JSON.stringify(data));
      });

      it('debería guardar string directamente sin JSON stringify', () => {
        service.setItem('string-key', 'plain string');

        const stored = localStorageMock.getItem('string-key');
        expect(stored).toBe('plain string');
      });

      it('debería guardar numeros como JSON', () => {
        service.setItem('number-key', 42);

        const stored = localStorageMock.getItem('number-key');
        expect(stored).toBe('42');
        expect(service.getItem<number>('number-key')).toBe(42);
      });

      it('debería guardar booleanos como JSON', () => {
        service.setItem('bool-key', true);

        const stored = localStorageMock.getItem('bool-key');
        expect(stored).toBe('true');
        expect(service.getItem<boolean>('bool-key')).toBeTrue();
      });

      it('debería loggear error si setItem falla', () => {
        spyOn(localStorageMock, 'setItem').and.throwError('Storage full');

        service.setItem('test-key', 'value');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error writing to localStorage: test-key',
          jasmine.any(Error)
        );
      });

      it('no debería hacer nada si window no esta definido', () => {
        const originalWindow = window;
        Object.defineProperty(global, 'window', { value: undefined, writable: true });

        service.setItem('test-key', 'value');
        // No debería lanzar error

        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
      });
    });

    describe('removeItem', () => {
      it('debería remover item de localStorage', () => {
        localStorageMock.setItem('test-key', 'value');
        service.removeItem('test-key');

        const result = localStorageMock.getItem('test-key');
        expect(result).toBeNull();
      });

      it('debería loggear error si removeItem falla', () => {
        spyOn(localStorageMock, 'removeItem').and.throwError('Storage error');

        service.removeItem('test-key');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error removing from localStorage: test-key',
          jasmine.any(Error)
        );
      });

      it('no debería hacer nada si window no esta definido', () => {
        const originalWindow = window;
        Object.defineProperty(global, 'window', { value: undefined, writable: true });

        service.removeItem('test-key');
        // No debería lanzar error

        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
      });
    });

    describe('clear', () => {
      it('debería limpiar todo el localStorage', () => {
        localStorageMock.setItem('key1', 'value1');
        localStorageMock.setItem('key2', 'value2');
        service.clear();

        expect(localStorageMock.getItem('key1')).toBeNull();
        expect(localStorageMock.getItem('key2')).toBeNull();
      });

      it('debería loggear error si clear falla', () => {
        spyOn(localStorageMock, 'clear').and.throwError('Storage error');

        service.clear();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error clearing localStorage',
          jasmine.any(Error)
        );
      });
    });

    describe('hasItem', () => {
      it('debería retornar true si el item existe', () => {
        localStorageMock.setItem('test-key', 'value');
        expect(service.hasItem('test-key')).toBeTrue();
      });

      it('debería retornar false si el item no existe', () => {
        expect(service.hasItem('non-existent')).toBeFalse();
      });
    });

    describe('getKeys', () => {
      it('debería retornar todas las keys del localStorage', () => {
        localStorageMock.setItem('key1', 'value1');
        localStorageMock.setItem('key2', 'value2');
        localStorageMock.setItem('key3', 'value3');

        const keys = service.getKeys();
        expect(keys).toContain('key1');
        expect(keys).toContain('key2');
        expect(keys).toContain('key3');
        expect(keys.length).toBe(3);
      });

      it('debería retornar array vacío si no hay keys', () => {
        expect(service.getKeys()).toEqual([]);
      });

      it('debería retornar array vacío si window no esta definido', () => {
        const originalWindow = window;
        Object.defineProperty(global, 'window', { value: undefined, writable: true });

        expect(service.getKeys()).toEqual([]);

        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
      });
    });

    describe('getSize', () => {
      it('debería calcular el tamaño total del storage', () => {
        localStorageMock.setItem('key1', 'value1'); // 4 + 6 = 10 chars
        localStorageMock.setItem('key2', 'value2'); // 4 + 6 = 10 chars

        const size = service.getSize();
        expect(size).toBe(20); // Total characters
      });

      it('debería retornar 0 si no hay items', () => {
        expect(service.getSize()).toBe(0);
      });

      it('debería retornar 0 si window no esta definido', () => {
        const originalWindow = window;
        Object.defineProperty(global, 'window', { value: undefined, writable: true });

        expect(service.getSize()).toBe(0);

        Object.defineProperty(global, 'window', { value: originalWindow, writable: true });
      });
    });
  });

  describe('SessionStorage operations', () => {
    describe('getSessionItem', () => {
      it('debería obtener item de sessionStorage', () => {
        const data = { name: 'Test', value: 123 };
        sessionStorageMock.setItem('test-key', JSON.stringify(data));

        const result = service.getSessionItem<typeof data>('test-key');
        expect(result).toEqual(data);
      });

      it('debería retornar null si el item no existe en sessionStorage', () => {
        const result = service.getSessionItem('non-existent-key');
        expect(result).toBeNull();
      });

      it('debería retornar string directamente si no es JSON valido', () => {
        sessionStorageMock.setItem('string-key', 'plain string');

        const result = service.getSessionItem<string>('string-key');
        expect(result).toBe('plain string');
      });

      it('debería retornar null y loggear error si sessionStorage lanza error', () => {
        spyOn(sessionStorageMock, 'getItem').and.throwError('Storage error');

        const result = service.getSessionItem('test-key');
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error reading from sessionStorage: test-key',
          jasmine.any(Error)
        );
      });
    });

    describe('setSessionItem', () => {
      it('debería guardar objeto como JSON string en sessionStorage', () => {
        const data = { name: 'Test', value: 123 };
        service.setSessionItem('test-key', data);

        const stored = sessionStorageMock.getItem('test-key');
        expect(stored).toBe(JSON.stringify(data));
      });

      it('debería guardar string directamente sin JSON stringify', () => {
        service.setSessionItem('string-key', 'plain string');

        const stored = sessionStorageMock.getItem('string-key');
        expect(stored).toBe('plain string');
      });

      it('debería loggear error si setSessionItem falla', () => {
        spyOn(sessionStorageMock, 'setItem').and.throwError('Storage full');

        service.setSessionItem('test-key', 'value');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error writing to sessionStorage: test-key',
          jasmine.any(Error)
        );
      });
    });

    describe('removeSessionItem', () => {
      it('debería remover item de sessionStorage', () => {
        sessionStorageMock.setItem('test-key', 'value');
        service.removeSessionItem('test-key');

        const result = sessionStorageMock.getItem('test-key');
        expect(result).toBeNull();
      });

      it('debería loggear error si removeSessionItem falla', () => {
        spyOn(sessionStorageMock, 'removeItem').and.throwError('Storage error');

        service.removeSessionItem('test-key');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error removing from sessionStorage: test-key',
          jasmine.any(Error)
        );
      });
    });

    describe('clearSession', () => {
      it('debería limpiar todo el sessionStorage', () => {
        sessionStorageMock.setItem('key1', 'value1');
        sessionStorageMock.setItem('key2', 'value2');
        service.clearSession();

        expect(sessionStorageMock.getItem('key1')).toBeNull();
        expect(sessionStorageMock.getItem('key2')).toBeNull();
      });

      it('debería loggear error si clearSession falla', () => {
        spyOn(sessionStorageMock, 'clear').and.throwError('Storage error');

        service.clearSession();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error clearing sessionStorage',
          jasmine.any(Error)
        );
      });
    });

    describe('hasSessionItem', () => {
      it('debería retornar true si el item existe en sessionStorage', () => {
        sessionStorageMock.setItem('test-key', 'value');
        expect(service.hasSessionItem('test-key')).toBeTrue();
      });

      it('debería retornar false si el item no existe en sessionStorage', () => {
        expect(service.hasSessionItem('non-existent')).toBeFalse();
      });
    });
  });

  describe('Signals', () => {
    it('debería emitir cambios de storage a traves del signal', (done) => {
      const storageChangeValues: (string | null)[] = [];

      // Subscribe to the computed signal
      const effect = service.storageChange;

      // Simulate storage event
      const storageEvent = new StorageEvent('storage', {
        key: 'test-key',
        newValue: 'new-value',
        oldValue: null,
        url: window.location.href
      });

      window.dispatchEvent(storageEvent);

      // Wait for the signal to update
      setTimeout(() => {
        expect(service.storageChange()).toBe('test-key');
        done();
      }, 0);
    });

    it('no debería emitir si el evento no tiene key', (done) => {
      const storageEvent = new StorageEvent('storage', {
        key: null,
        newValue: 'new-value',
        oldValue: null,
        url: window.location.href
      });

      window.dispatchEvent(storageEvent);

      setTimeout(() => {
        // Signal should remain unchanged
        expect(service.storageChange()).toBeNull();
        done();
      }, 0);
    });
  });
});
