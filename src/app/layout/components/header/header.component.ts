import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="header__left">
        <button
          type="button"
          class="header__menu-toggle"
          (click)="toggleSidebar.emit()"
          [attr.aria-label]="sidebarCollapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <a routerLink="/dashboard" class="header__brand">
          <div class="header__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          <span class="header__brand-text">BankApp</span>
        </a>
      </div>
      
      <div class="header__center">
        <div class="header__search">
          <svg class="header__search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <input
            type="search"
            class="header__search-input"
            placeholder="Buscar..."
            (input)="search.emit($any($event).target.value)"
          />
        </div>
      </div>
      
      <div class="header__right">
        <div class="header__actions">
          <button
            type="button"
            class="header__action-btn"
            [class.header__action-btn--active]="notificationsOpen()"
            (click)="toggleNotifications()"
            aria-label="Notificaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
            </svg>
            @if (notificationCount() > 0) {
              <span class="header__badge">{{ notificationCount() }}</span>
            }
          </button>
          
          <button
            type="button"
            class="header__action-btn"
            aria-label="Configuración"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
        
        <div class="header__user-menu">
          <button
            type="button"
            class="header__user-btn"
            (click)="toggleUserMenu()"
            [attr.aria-expanded]="userMenuOpen()"
          >
            <div class="header__avatar">
              {{ userInitials() }}
            </div>
            <span class="header__user-name">{{ userName() }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
          
          @if (userMenuOpen()) {
            <div class="header__dropdown">
              <div class="header__dropdown-header">
                <div class="header__dropdown-avatar">
                  {{ userInitials() }}
                </div>
                <div class="header__dropdown-info">
                  <p class="header__dropdown-name">{{ userName() }}</p>
                  <p class="header__dropdown-email">{{ userEmail() }}</p>
                </div>
              </div>
              <div class="header__dropdown-divider"></div>
              <nav class="header__dropdown-nav">
                <a routerLink="/profile" class="header__dropdown-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Perfil
                </a>
                <a routerLink="/settings" class="header__dropdown-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Configuración
                </a>
              </nav>
              <div class="header__dropdown-divider"></div>
              <button
                type="button"
                class="header__dropdown-link header__dropdown-link--danger"
                (click)="logout.emit()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Cerrar sesión
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 var(--space-6);
      background-color: var(--surface-1);
      border-bottom: var(--border-width-thin) solid var(--color-gray-200);
      gap: var(--space-4);
      
      &__left {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
      
      &__menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: var(--border-radius-lg);
        transition: all var(--transition-fast);
        
        &:hover {
          background-color: var(--surface-3);
          color: var(--text-primary);
        }
        
        @media (min-width: 1024px) {
          display: flex;
        }
      }
      
      &__brand {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        text-decoration: none;
        color: inherit;
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
        
        svg {
          width: 1.5rem;
          height: 1.5rem;
        }
      }
      
      &__brand-text {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        display: none;
        
        @media (min-width: 640px) {
          display: block;
        }
      }
      
      &__center {
        flex: 1;
        max-width: 28rem;
        display: none;
        
        @media (min-width: 768px) {
          display: block;
        }
      }
      
      &__search {
        position: relative;
        
        &-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        
        &-input {
          width: 100%;
          padding: var(--space-2) var(--space-3) var(--space-2) var(--space-10);
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          background-color: var(--surface-2);
          border: var(--border-width-thin) solid transparent;
          border-radius: var(--border-radius-lg);
          transition: all var(--transition-fast);
          
          &::placeholder {
            color: var(--text-muted);
          }
          
          &:focus {
            outline: none;
            background-color: var(--surface-1);
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--color-primary-100);
          }
        }
      }
      
      &__right {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      
      &__actions {
        display: flex;
        align-items: center;
        gap: var(--space-1);
      }
      
      &__action-btn {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
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
      }
      
      &__badge {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 1rem;
        height: 1rem;
        padding: 0 var(--space-1);
        font-size: 0.625rem;
        font-weight: var(--font-weight-semibold);
        color: var(--text-inverse);
        background-color: var(--error);
        border-radius: var(--border-radius-full);
      }
      
      &__user-menu {
        position: relative;
      }
      
      &__user-btn {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-2);
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        border-radius: var(--border-radius-lg);
        transition: all var(--transition-fast);
        
        &:hover {
          background-color: var(--surface-3);
        }
      }
      
      &__avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: var(--text-inverse);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        border-radius: var(--border-radius-full);
      }
      
      &__user-name {
        display: none;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        
        @media (min-width: 1024px) {
          display: block;
        }
      }
      
      &__dropdown {
        position: absolute;
        top: calc(100% + var(--space-2));
        right: 0;
        min-width: 16rem;
        background-color: var(--surface-1);
        border: var(--border-width-thin) solid var(--color-gray-200);
        border-radius: var(--border-radius-xl);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-dropdown);
        animation: fadeIn 150ms ease-out;
        
        &-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        
        &-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: var(--text-inverse);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--border-radius-full);
        }
        
        &-info {
          flex: 1;
          min-width: 0;
        }
        
        &-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        &-email {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          margin: var(--space-1) 0 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        &-divider {
          height: var(--border-width-thin);
          background-color: var(--color-gray-200);
          margin: 0 var(--space-4);
        }
        
        &-nav {
          padding: var(--space-2);
        }
        
        &-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          text-decoration: none;
          background: none;
          border: none;
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          
          &:hover {
            background-color: var(--surface-3);
          }
          
          &--danger {
            color: var(--error);
            
            &:hover {
              background-color: var(--color-error-50);
            }
          }
        }
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-0.5rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HeaderComponent {
  // Inputs
  sidebarCollapsed = input<boolean>(false);
  userName = input<string>('Usuario');
  userEmail = input<string>('usuario@example.com');
  notificationCount = input<number>(0);
  
  // Outputs
  toggleSidebar = output<void>();
  search = output<string>();
  logout = output<void>();
  
  // Internal signals
  notificationsOpen = signal<boolean>(false);
  userMenuOpen = signal<boolean>(false);
  
  // Computed
  userInitials = computed(() => {
    const name = this.userName();
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });
  
  // Methods
  toggleNotifications(): void {
    this.notificationsOpen.update(open => !open);
    if (this.notificationsOpen()) {
      this.userMenuOpen.set(false);
    }
  }
  
  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
    if (this.userMenuOpen()) {
      this.notificationsOpen.set(false);
    }
  }
  
  closeMenus(): void {
    this.notificationsOpen.set(false);
    this.userMenuOpen.set(false);
  }
}
