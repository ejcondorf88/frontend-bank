import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { AuthStore } from '../../signals/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  template: `
    <div class="login-page">
      <div class="login-page__container">
        <!-- Logo y branding -->
        <div class="login-page__branding">
          <div class="login-page__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
          </div>
          <h1 class="login-page__brand-name">BankApp</h1>
          <p class="login-page__brand-tagline">Gestión bancaria segura y eficiente</p>
        </div>

        <!-- Card de login -->
        <app-card class="login-page__card" [class.login-page__card--loading]="isLoading()">
          <div class="login-page__header">
            <h2 class="login-page__title">Iniciar sesión</h2>
            <p class="login-page__subtitle">Ingresa tus credenciales para acceder</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-page__form">
            <!-- Error general -->
            @if (errorMessage()) {
              <div class="login-page__error" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Email -->
            <div class="login-page__field">
              <label for="email" class="login-page__label">
                Correo electrónico
                <span class="login-page__required">*</span>
              </label>
              <div class="login-page__input-wrapper">
                <svg class="login-page__input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="login-page__input"
                  [class.login-page__input--error]="emailError()"
                  placeholder="tu@email.com"
                  autocomplete="email"
                />
              </div>
              @if (emailError()) {
                <p class="login-page__field-error">{{ emailError() }}</p>
              }
            </div>

            <!-- Password -->
            <div class="login-page__field">
              <label for="password" class="login-page__label">
                Contraseña
                <span class="login-page__required">*</span>
              </label>
              <div class="login-page__input-wrapper">
                <svg class="login-page__input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  class="login-page__input"
                  [class.login-page__input--error]="passwordError()"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="login-page__toggle-password"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  @if (showPassword()) {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 13 8a13.93 13.93 0 0 1-2.66 3"/>
                      <path d="M6.61 6.61A13.89 13.89 0 0 0 2 12s3 7 10 7a9.67 9.67 0 0 0 4.61-1.11"/>
                      <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
              @if (passwordError()) {
                <p class="login-page__field-error">{{ passwordError() }}</p>
              }
            </div>

            <!-- Remember me & Forgot password -->
            <div class="login-page__options">
              <label class="login-page__checkbox">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="login-page__checkbox-input"
                />
                <span class="login-page__checkbox-checkmark"></span>
                <span class="login-page__checkbox-label">Recordarme</span>
              </label>
              <a routerLink="/auth/forgot-password" class="login-page__forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <!-- Submit button -->
            <app-button
              type="submit"
              variant="primary"
              size="lg"
              [fullWidth]="true"
              [loading]="isLoading()"
              [disabled]="loginForm.invalid || isLoading()"
            >
              @if (isLoading()) {
                <span>Iniciando sesión...</span>
              } @else {
                <span>Iniciar sesión</span>
              }
            </app-button>
          </form>

          <!-- Divider -->
          <div class="login-page__divider">
            <span>o</span>
          </div>

          <!-- Social login -->
          <div class="login-page__social">
            <button type="button" class="login-page__social-btn" aria-label="Continuar con Google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button type="button" class="login-page__social-btn" aria-label="Continuar con Microsoft">
              <svg viewBox="0 0 21 21" width="20" height="20">
                <path fill="#f25022" d="M1 1h9v9H1z"/>
                <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                <path fill="#ffb900" d="M11 11h9v9h-9z"/>
              </svg>
            </button>
          </div>
        </app-card>

        <!-- Register link -->
        <div class="login-page__footer">
          <p class="login-page__footer-text">
            ¿No tienes una cuenta?
            <a routerLink="/auth/register" class="login-page__footer-link">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: var(--space-6);
      background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%);
      
      &__container {
        width: 100%;
        max-width: 28rem;
      }
      
      &__branding {
        text-align: center;
        margin-bottom: var(--space-8);
      }
      
      &__logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 4rem;
        height: 4rem;
        background: var(--surface-1);
        color: var(--primary);
        border-radius: var(--border-radius-xl);
        margin-bottom: var(--space-4);
        box-shadow: var(--shadow-lg);
        
        svg {
          width: 2rem;
          height: 2rem;
        }
      }
      
      &__brand-name {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-inverse);
        margin: 0 0 var(--space-2) 0;
      }
      
      &__brand-tagline {
        font-size: var(--font-size-base);
        color: var(--color-primary-200);
        margin: 0;
      }
      
      &__card {
        ::ng-deep .card {
          padding: var(--space-8);
        }
        
        &--loading {
          opacity: 0.7;
          pointer-events: none;
        }
      }
      
      &__header {
        text-align: center;
        margin-bottom: var(--space-8);
      }
      
      &__title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        margin: 0 0 var(--space-2) 0;
      }
      
      &__subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
        margin: 0;
      }
      
      &__form {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }
      
      &__error {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background-color: var(--color-error-50);
        border: var(--border-width-thin) solid var(--color-error-200);
        border-radius: var(--border-radius-lg);
        color: var(--error);
        font-size: var(--font-size-sm);
        
        svg {
          flex-shrink: 0;
        }
      }
      
      &__field {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      
      &__label {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
      }
      
      &__required {
        color: var(--error);
      }
      
      &__input-wrapper {
        position: relative;
      }
      
      &__input-icon {
        position: absolute;
        left: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
      }
      
      &__input {
        width: 100%;
        padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
        font-size: var(--font-size-base);
        color: var(--text-primary);
        background-color: var(--surface-1);
        border: var(--border-width-thin) solid var(--color-gray-300);
        border-radius: var(--border-radius-lg);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        
        &::placeholder {
          color: var(--text-muted);
        }
        
        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }
        
        &--error {
          border-color: var(--error);
          
          &:focus {
            box-shadow: 0 0 0 3px var(--color-error-100);
          }
        }
      }
      
      &__toggle-password {
        position: absolute;
        right: var(--space-3);
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1);
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--border-radius-md);
        transition: all var(--transition-fast);
        
        &:hover {
          color: var(--text-primary);
          background-color: var(--surface-3);
        }
      }
      
      &__field-error {
        font-size: var(--font-size-sm);
        color: var(--error);
        margin: 0;
      }
      
      &__options {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
      }
      
      &__checkbox {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        cursor: pointer;
        
        &-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          
          &:checked + .login-page__checkbox-checkmark {
            background-color: var(--primary);
            border-color: var(--primary);
            
            &::after {
              opacity: 1;
            }
          }
          
          &:focus + .login-page__checkbox-checkmark {
            box-shadow: 0 0 0 3px var(--color-primary-100);
          }
        }
        
        &-checkmark {
          position: relative;
          width: 1.25rem;
          height: 1.25rem;
          background-color: var(--surface-1);
          border: var(--border-width-thin) solid var(--color-gray-300);
          border-radius: var(--border-radius-md);
          transition: all var(--transition-fast);
          flex-shrink: 0;
          
          &::after {
            content: '';
            position: absolute;
            left: 5px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
            opacity: 0;
            transition: opacity var(--transition-fast);
          }
        }
        
        &-label {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
      }
      
      &__forgot-link {
        font-size: var(--font-size-sm);
        color: var(--primary);
        text-decoration: none;
        font-weight: var(--font-weight-medium);
        transition: color var(--transition-fast);
        white-space: nowrap;
        
        &:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }
      }
      
      &__divider {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin: var(--space-6) 0;
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        
        &::before,
        &::after {
          content: '';
          flex: 1;
          height: var(--border-width-thin);
          background-color: var(--color-gray-200);
        }
      }
      
      &__social {
        display: flex;
        justify-content: center;
        gap: var(--space-3);
        
        &-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.75rem;
          height: 2.75rem;
          background-color: var(--surface-1);
          border: var(--border-width-thin) solid var(--color-gray-200);
          border-radius: var(--border-radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          
          &:hover {
            background-color: var(--surface-3);
            border-color: var(--color-gray-300);
          }
        }
      }
      
      &__footer {
        text-align: center;
        margin-top: var(--space-6);
      }
      
      &__footer-text {
        font-size: var(--font-size-sm);
        color: var(--color-primary-200);
        margin: 0;
      }
      
      &__footer-link {
        color: var(--text-inverse);
        font-weight: var(--font-weight-semibold);
        text-decoration: none;
        margin-left: var(--space-1);
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  showPassword = signal<boolean>(false);
  isLoading = computed(() => this.authStore.isLoading());
  errorMessage = computed(() => this.authStore.error());

  // Form
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  // Computed validation errors
  emailError = computed(() => {
    const control = this.loginForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El correo es requerido';
      if (control.errors['email']) return 'Ingresa un correo válido';
    }
    return '';
  });

  passwordError = computed(() => {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La contraseña es requerida';
      if (control.errors['minlength']) return 'Mínimo 6 caracteres';
    }
    return '';
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      
      await this.authStore.login({ email, password, rememberMe });
      
      if (this.authStore.isAuthenticated()) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        await this.router.navigate([returnUrl]);
      }
    } else {
      // Mark all fields as touched to show errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
