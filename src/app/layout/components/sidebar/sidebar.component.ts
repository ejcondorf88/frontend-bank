import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <!-- Sidebar Header -->
      <div class="sidebar__header">
        <div class="sidebar__brand">
          <div class="sidebar__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          @if (!collapsed()) {
            <span class="sidebar__brand-text">BankApp</span>
          }
        </div>
      </div>
      
      <!-- Navigation -->
      <nav class="sidebar__nav">
        <ul class="sidebar__menu">
          @for (item of menuItems(); track item.route) {
            <li class="sidebar__item">
              <a
                [routerLink]="item.route"
                routerLinkActive="sidebar__link--active"
                class="sidebar__link"
                [attr.title]="collapsed() ? item.label : null"
              >
                <span class="sidebar__icon" [innerHTML]="getIcon(item.icon)"></span>
                @if (!collapsed()) {
                  <span class="sidebar__label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="sidebar__badge">{{ item.badge }}</span>
                  }
                }
              </a>
            </li>
          }
        </ul>
        
        <!-- Section divider -->
        @if (!collapsed()) {
          <div class="sidebar__divider">
            <span>Administración</span>
          </div>
        }
        
        <ul class="sidebar__menu">
          @for (item of adminItems(); track item.route) {
            <li class="sidebar__item">
              <a
                [routerLink]="item.route"
                routerLinkActive="sidebar__link--active"
                class="sidebar__link"
                [attr.title]="collapsed() ? item.label : null"
              >
                <span class="sidebar__icon" [innerHTML]="getIcon(item.icon)"></span>
                @if (!collapsed()) {
                  <span class="sidebar__label">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="sidebar__footer">
        <button
          type="button"
          class="sidebar__toggle"
          (click)="toggle.emit()"
          [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
          [attr.title]="collapsed() ? 'Expandir menú' : 'Colapsar menú'"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            [class.sidebar__toggle-icon--rotated]="collapsed()"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          @if (!collapsed()) {
            <span class="sidebar__toggle-text">Colapsar</span>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--surface-1);
      
      &--collapsed {
        .sidebar__icon {
          margin: 0;
        }
      }
      
      &__header {
        padding: var(--space-4);
        border-bottom: var(--border-width-thin) solid var(--color-gray-200);
      }
      
      &__brand {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      
      &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: var(--text-inverse);
        border-radius: var(--border-radius-lg);
        flex-shrink: 0;
        
        svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }
      
      &__brand-text {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        white-space: nowrap;
      }
      
      &__nav {
        flex: 1;
        padding: var(--space-2);
        overflow-y: auto;
      }
      
      &__menu {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      &__item {
        margin-bottom: var(--space-1);
      }
      
      &__link {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: var(--border-radius-lg);
        transition: all var(--transition-fast);
        
        &:hover {
          background-color: var(--surface-3);
          color: var(--text-primary);
        }
        
        &--active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        
        .sidebar--collapsed & {
          justify-content: center;
          padding: var(--space-3);
        }
      }
      
      &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        
        ::ng-deep svg {
          width: 100%;
          height: 100%;
        }
      }
      
      &__label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        white-space: nowrap;
      }
      
      &__badge {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25rem;
        height: 1.25rem;
        padding: 0 var(--space-1);
        margin-left: auto;
        font-size: 0.625rem;
        font-weight: var(--font-weight-semibold);
        color: var(--text-inverse);
        background-color: var(--primary);
        border-radius: var(--border-radius-full);
      }
      
      &__divider {
        display: flex;
        align-items: center;
        margin: var(--space-4) var(--space-3);
        color: var(--text-muted);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        
        &::before,
        &::after {
          content: '';
          flex: 1;
          height: var(--border-width-thin);
          background-color: var(--color-gray-200);
        }
        
        &::before {
          margin-right: var(--space-2);
        }
        
        &::after {
          margin-left: var(--space-2);
        }
      }
      
      &__footer {
        padding: var(--space-2);
        border-top: var(--border-width-thin) solid var(--color-gray-200);
      }
      
      &__toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        gap: var(--space-2);
        padding: var(--space-2);
        color: var(--text-muted);
        background: none;
        border: none;
        border-radius: var(--border-radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
        
        &:hover {
          background-color: var(--surface-3);
          color: var(--text-primary);
        }
        
        &-icon {
          &--rotated {
            transform: rotate(180deg);
          }
        }
        
        &-text {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }
      }
    }
  `]
})
export class SidebarComponent {
  // Inputs
  collapsed = input<boolean>(false);
  
  // Outputs
  toggle = output<void>();
  
  // Menu items
  menuItems = computed<NavItem[]>(() => [
    {
      label: 'Dashboard',
      icon: 'layout-dashboard',
      route: '/dashboard'
    },
    {
      label: 'Productos',
      icon: 'package',
      route: '/products'
    },
    {
      label: 'Cuentas',
      icon: 'credit-card',
      route: '/accounts'
    },
    {
      label: 'Transferencias',
      icon: 'arrow-left-right',
      route: '/transfers',
      badge: 3
    },
    {
      label: 'Pagos',
      icon: 'receipt',
      route: '/payments'
    },
    {
      label: 'Inversiones',
      icon: 'trending-up',
      route: '/investments'
    },
    {
      label: 'Reportes',
      icon: 'bar-chart-3',
      route: '/reports'
    }
  ]);
  
  adminItems = computed<NavItem[]>(() => [
    {
      label: 'Usuarios',
      icon: 'users',
      route: '/admin/users'
    },
    {
      label: 'Configuración',
      icon: 'settings',
      route: '/settings'
    },
    {
      label: 'Ayuda',
      icon: 'help-circle',
      route: '/help'
    }
  ]);
  
  // Icon SVGs
  private icons: Record<string, string> = {
    'layout-dashboard': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>`,
    'package': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>`,
    'credit-card': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>`,
    'arrow-left-right': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"></path><path d="M4 7h16"></path><path d="m16 21 4-4-4-4"></path><path d="M20 17H4"></path></svg>`,
    'receipt': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 17.5v-11"></path></svg>`,
    'trending-up': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
    'bar-chart-3': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>`,
    'users': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    'settings': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    'help-circle': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>`
  };
  
  getIcon(name: string): string {
    return this.icons[name] || '';
  }
}
