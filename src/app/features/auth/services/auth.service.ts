import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthTokens
} from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Login
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
    );
  }

  // Register
  register(data: RegisterData): Promise<AuthResponse> {
    return lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
    );
  }

  // Logout
  logout(): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/logout`, {})
    );
  }

  // Refresh token
  refreshToken(refreshToken: string): Promise<AuthTokens> {
    return lastValueFrom(
      this.http.post<AuthTokens>(`${this.apiUrl}/refresh`, { refreshToken })
    );
  }

  // Verify email
  verifyEmail(token: string): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/verify-email`, { token })
    );
  }

  // Request password reset
  requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/forgot-password`, data)
    );
  }

  // Confirm password reset
  confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/reset-password`, data)
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/change-password`, {
        currentPassword,
        newPassword
      })
    );
  }

  // Get current user
  getCurrentUser(): Promise<User> {
    return lastValueFrom(
      this.http.get<User>(`${this.apiUrl}/me`)
    );
  }

  // Update profile
  updateProfile(userData: Partial<User>): Promise<User> {
    return lastValueFrom(
      this.http.patch<User>(`${this.apiUrl}/profile`, userData)
    );
  }

  // Upload avatar
  uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return lastValueFrom(
      this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData)
    );
  }

  // Enable 2FA
  enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    return lastValueFrom(
      this.http.post<{ qrCode: string; secret: string }>(`${this.apiUrl}/2fa/enable`, {})
    );
  }

  // Verify 2FA code
  verifyTwoFactor(code: string): Promise<{ verified: boolean }> {
    return lastValueFrom(
      this.http.post<{ verified: boolean }>(`${this.apiUrl}/2fa/verify`, { code })
    );
  }

  // Disable 2FA
  disableTwoFactor(password: string): Promise<void> {
    return lastValueFrom(
      this.http.post<void>(`${this.apiUrl}/2fa/disable`, { password })
    );
  }
}
