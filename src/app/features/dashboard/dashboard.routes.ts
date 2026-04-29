import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'overview',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
