import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="footer__content">
        <div class="footer__left">
          <p class="footer__copyright">
            © {{ currentYear() }} BankApp. Todos los derechos reservados.
          </p>
        </div>
        
        <div class="footer__center">
          <span class="footer__version">v{{ version }}</span>
        </div>
        
        <div class="footer__right">
          <nav class="footer__links">
            <a href="#" class="footer__link">Privacidad</a>
            <a href="#" class="footer__link">Términos</a>
            <a href="#" class="footer__link">Soporte</a>
          </nav>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .footer {
      height: 100%;
      background-color: var(--surface-1);
      border-top: var(--border-width-thin) solid var(--color-gray-200);
      
      &__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        padding: 0 var(--space-6);
        gap: var(--space-4);
        
        @media (max-width: 640px) {
          flex-direction: column;
          justify-content: center;
          padding: var(--space-3) var(--space-4);
          gap: var(--space-2);
        }
      }
      
      &__left {
        flex: 1;
      }
      
      &__copyright {
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        margin: 0;
      }
      
      &__center {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      &__version {
        display: inline-flex;
        align-items: center;
        padding: var(--space-1) var(--space-3);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--text-muted);
        background-color: var(--surface-3);
        border-radius: var(--border-radius-full);
      }
      
      &__right {
        flex: 1;
        display: flex;
        justify-content: flex-end;
      }
      
      &__links {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
      
      &__link {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        text-decoration: none;
        transition: color var(--transition-fast);
        
        &:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }
      }
    }
  `]
})
export class FooterComponent {
  private readonly VERSION = '1.0.0';
  
  version = this.VERSION;
  
  currentYear = computed(() => new Date().getFullYear());
}
