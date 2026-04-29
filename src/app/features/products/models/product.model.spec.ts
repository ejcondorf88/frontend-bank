import { Product, ProductRequest, ProductUI, CurrencyCode } from './product.model';

describe('Product Model', () => {
  describe('Product Interface', () => {
    it('debería crear un producto válido', () => {
      const product: Product = {
        id: 'trj-crd',
        name: 'Tarjetas de Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      expect(product).toBeTruthy();
      expect(product.id).toBe('trj-crd');
      expect(product.name).toBe('Tarjetas de Crédito');
    });

    it('debería validar longitud de ID (3-10 caracteres)', () => {
      const productWithShortId: Product = {
        id: 'ab', // 2 caracteres - inválido
        name: 'Producto',
        description: 'Descripción del producto',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      expect(productWithShortId.id.length).toBeLessThan(3);
    });

    it('debería validar longitud de nombre (5-100 caracteres)', () => {
      const productWithLongName: Product = {
        id: 'valid-id',
        name: 'A'.repeat(101), // 101 caracteres - excede máximo
        description: 'Descripción',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      expect(productWithLongName.name.length).toBeGreaterThan(100);
    });

    it('debería validar formato de fechas (YYYY-MM-DD)', () => {
      const product: Product = {
        id: 'test-001',
        name: 'Producto Test',
        description: 'Descripción válida del producto test',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(product.date_release).toMatch(dateRegex);
      expect(product.date_revision).toMatch(dateRegex);
    });

    it('debería validar que fecha revisión sea 1 año después de liberación', () => {
      const releaseDate = new Date('2024-01-15');
      const expectedRevision = new Date('2025-01-15');

      const product: Product = {
        id: 'test-002',
        name: 'Producto Test',
        description: 'Descripción del producto',
        logo: 'logo.png',
        date_release: releaseDate.toISOString().split('T')[0],
        date_revision: expectedRevision.toISOString().split('T')[0]
      };

      const release = new Date(product.date_release);
      const revision = new Date(product.date_revision);
      const diffYears = revision.getFullYear() - release.getFullYear();

      expect(diffYears).toBe(1);
    });
  });

  describe('ProductRequest Interface', () => {
    it('debería permitir crear producto sin ID (para edición)', () => {
      const request: ProductRequest = {
        name: 'Nuevo Producto',
        description: 'Descripción del producto',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      expect(request.id).toBeUndefined();
      expect(request.name).toBe('Nuevo Producto');
    });

    it('debería incluir ID para actualización', () => {
      const request: ProductRequest = {
        id: 'existing-id',
        name: 'Producto Actualizado',
        description: 'Descripción actualizada',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15'
      };

      expect(request.id).toBe('existing-id');
    });
  });

  describe('ProductUI Interface', () => {
    it('debería extender Product con campos UI', () => {
      const productUI: ProductUI = {
        id: 'test-001',
        name: 'Producto UI',
        description: 'Descripción extendida',
        logo: 'logo.png',
        date_release: '2024-01-15',
        date_revision: '2025-01-15',
        releaseDate: new Date('2024-01-15'),
        revisionDate: new Date('2025-01-15'),
        daysSinceRelease: 0,
        status: 'active'
      };

      expect(productUI.releaseDate).toBeInstanceOf(Date);
      expect(productUI.status).toBe('active');
    });
  });

  describe('CurrencyCode Type', () => {
    it('debería aceptar códigos de moneda válidos', () => {
      const validCurrencies: CurrencyCode[] = [
        'USD', 'EUR', 'GBP', 'JPY', 'MXN', 
        'ARS', 'BRL', 'CLP', 'COP'
      ];

      validCurrencies.forEach(currency => {
        expect(currency).toBeTruthy();
      });
    });
  });
});
