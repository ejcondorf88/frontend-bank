import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Skeleton para productos
 * Muestra una animación de carga mientras se obtienen los datos reales
 * Mejora la experiencia de usuario evitando pantallas en blanco
 *
 * Estrategia: ChangeDetectionStrategy.OnPush
 * Componente puramente presentacional sin estado mutable.
 * Una vez renderizado, no necesita actualizarse nunca.
 */
@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card" role="status" aria-label="Cargando producto...">
      <div class="skeleton-header">
        <div class="skeleton-logo"></div>
        <div class="skeleton-title-wrapper">
          <div class="skeleton-title"></div>
          <div class="skeleton-subtitle"></div>
        </div>
      </div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-date"></div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .skeleton-card {
      background: white;
      border: 1px solid var(--color-gray-200, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
      height: 100%;
      min-height: 200px;
    }

    .skeleton-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .skeleton-logo {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100, #f1f5f9) 25%,
        var(--color-gray-200, #e2e8f0) 50%,
        var(--color-gray-100, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      flex-shrink: 0;
    }

    .skeleton-title-wrapper {
      flex: 1;
      padding-top: 4px;
    }

    .skeleton-title {
      width: 70%;
      height: 24px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100, #f1f5f9) 25%,
        var(--color-gray-200, #e2e8f0) 50%,
        var(--color-gray-100, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-bottom: 8px;
    }

    .skeleton-subtitle {
      width: 40%;
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100, #f1f5f9) 25%,
        var(--color-gray-200, #e2e8f0) 50%,
        var(--color-gray-100, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite 0.1s;
    }

    .skeleton-body {
      margin-bottom: 16px;
    }

    .skeleton-line {
      width: 100%;
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100, #f1f5f9) 25%,
        var(--color-gray-200, #e2e8f0) 50%,
        var(--color-gray-100, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite 0.2s;
      margin-bottom: 8px;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-footer {
      padding-top: 12px;
      border-top: 1px solid var(--color-gray-100, #f1f5f9);
    }

    .skeleton-date {
      width: 50%;
      height: 14px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--color-gray-100, #f1f5f9) 25%,
        var(--color-gray-200, #e2e8f0) 50%,
        var(--color-gray-100, #f1f5f9) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite 0.3s;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    /* Reducir animación para usuarios que prefieren menos movimiento */
    @media (prefers-reduced-motion: reduce) {
      .skeleton-logo,
      .skeleton-title,
      .skeleton-subtitle,
      .skeleton-line,
      .skeleton-date {
        animation: none;
        background: var(--color-gray-100, #f1f5f9);
      }
    }
  `]
})
export class ProductSkeletonComponent {}
