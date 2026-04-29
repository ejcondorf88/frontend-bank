import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { User, LoginCredentials, AuthResponse } from '../../../core/models/user.model';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // State signals
  private readonly state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    initialized: false
  });

  // Public computed signals
  readonly user = computed(() => this.state().user);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly initialized = computed(() => this.state().initialized);

  // Derived computed signals
  readonly userInitials = computed(() => {
    const user = this.state().user;
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  readonly userFullName = computed(() => {
    const user = this.state().user;
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  });

  readonly hasRole = (role: string) => computed(() => {
    const user = this.state().user;
    return user?.role === role;
  });

  constructor() {
    this.initializeFromStorage();
  }

  // Initialize auth state from storage on app load
  private initializeFromStorage(): void {
    const token = this.storageService.getItem<string>('access_token');
    const user = this.storageService.getItem<User>('user');

    if (token && user) {
      this.state.update(s => ({
        ...s,
        user,
        isAuthenticated: true,
        initialized: true
      }));
    } else {
      this.state.update(s => ({
        ...s,
        initialized: true
      }));
    }
  }

  // Actions
  async login(credentials: LoginCredentials): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const response: AuthResponse = await this.authService.login(credentials);
      
      // Store tokens
      this.storageService.setItem('access_token', response.tokens.accessToken);
      this.storageService.setItem('refresh_token', response.tokens.refreshToken);
      this.storageService.setItem('user', response.user);

      // Update state
      this.state.set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true
      });
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Error de autenticacion');
      this.setLoading(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } finally {
      this.clearAuth();
      await this.router.navigate(['/auth/login']);
    }
  }

  clearAuth(): void {
    // Clear storage
    this.storageService.removeItem('access_token');
    this.storageService.removeItem('refresh_token');
    this.storageService.removeItem('user');

    // Reset state
    this.state.set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      initialized: true
    });
  }

  updateUser(user: Partial<User>): void {
    const currentUser = this.state().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      this.storageService.setItem('user', updatedUser);
      this.state.update(s => ({ ...s, user: updatedUser }));
    }
  }

  // Setters
  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, isLoading: loading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error }));
  }

  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }
}
