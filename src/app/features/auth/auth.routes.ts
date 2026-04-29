import { Routes } from '@angular/router';
import { publicGuard } from '../../core/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage), // Temporal
    canActivate: [publicGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage), // Temporal
    canActivate: [publicGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage), // Temporal
    canActivate: [publicGuard]
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage), // Temporal
    canActivate: [publicGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
