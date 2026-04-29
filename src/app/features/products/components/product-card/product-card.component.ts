import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';

/**
 * Componente Card para mostrar un producto financiero
 * Diseño limpio con información del producto y acciones disponibles
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="product-card" [attr.aria-label]="'Producto: ' + product.name">
      <header class="product-header">
        <div class="product-logo">
          <img 
            [src]="product.logo" 
            [alt]="'Logo de ' + product.name"
            loading="lazy"
            (error)="onImageError($event)"
          />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <span class="product-id">ID: {{ product.id }}</span>
        </div>
      </header>
      
      <div class="product-body">
        <p class="product-description">{{ product.description }}</p>
      </div>
      
      <footer class="product-footer">
        <div class="product-dates">
          <div class="date-item">
            <span class="date-label">Liberación:</span>
            <span class="date-value">{{ formatDate(product.date_release) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Revisión:</span>
            <span class="date-value">{{ formatDate(product.date_revision) }}</span>
          </div>
        </div>
        
        <div class="product-actions">
          <button 
            class="btn-menu"
            (click)="toggleMenu($event)"
            [attr.aria-expanded]="menuOpen"
            aria-label="Menú de opciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          
          @if (menuOpen) {
            <div class="dropdown-menu" (clickOutside)="closeMenu()">
              <button class="dropdown-item" (click)="onEdit()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
              </button>
              <button class="dropdown-item delete" (click)="onDelete()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          }
        </div>
      </footer>
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }

    .product-card {
      background: white;
      border: 1px solid var(--color-gray-200, #e2e8f0);
      border-radius: 12px;
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
      position: relative;
    }

    .product-card:hover {
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
      border-color: var(--color-gray-300, #cbd5e1);
    }

    .product-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .product-logo {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      overflow: hidden;
      background: var(--color-gray-100, #f1f5f9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .product-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .product-info {
      flex: 1;
      min-width: 0;
    }

    .product-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-gray-900, #0f172a);
      margin: 0 0 4px 0;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-id {
      font-size: 0.75rem;
      color: var(--color-gray-500, #64748b);
      font-family: var(--font-family-mono, monospace);
    }

    .product-body {
      flex: 1;
      margin-bottom: 16px;
    }

    .product-description {
      font-size: 0.875rem;
      color: var(--color-gray-600, #475569);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-footer {
      padding-top: 16px;
      border-top: 1px solid var(--color-gray-100, #f1f5f9);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .product-dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
    }

    .date-label {
      color: var(--color-gray-500, #64748b);
    }

    .date-value {
      color: var(--color-gray-700, #334155);
      font-weight: 500;
    }

    .product-actions {
      position: relative;
    }

    .btn-menu {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-gray-600, #475569);
      transition: all 0.15s ease;
    }

    .btn-menu:hover {
      background: var(--color-gray-100, #f1f5f9);
      color: var(--color-gray-900, #0f172a);
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: white;
      border: 1px solid var(--color-gray-200, #e2e8f0);
      border-radius: 8px;
      box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1);
      min-width: 140px;
      z-index: 10;
      overflow: hidden;
    }

    .dropdown-item {
      width: 100%;
      padding: 10px 12px;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--color-gray-700, #334155);
      cursor: pointer;
      transition: background 0.15s ease;
      text-align: left;
    }

    .dropdown-item:hover {
      background: var(--color-gray-50, #f8fafc);
    }

    .dropdown-item.delete {
      color: var(--color-error-600, #dc2626);
    }

    .dropdown-item.delete:hover {
      background: var(--color-error-50, #fef2f2);
    }

    /* Responsive */
    @media (max-width: 640px) {
      .product-card {
        padding: 16px;
      }

      .product-logo {
        width: 48px;
        height: 48px;
      }

      .product-name {
        font-size: 1rem;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  menuOpen = false;

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onEdit(): void {
    this.menuOpen = false;
    this.edit.emit(this.product.id);
  }

  onDelete(): void {
    this.menuOpen = false;
    this.delete.emit(this.product.id);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-product.png';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
