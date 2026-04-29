import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '../../signals/dashboard.store';
import { AuthStore } from '../../../auth/signals/auth.store';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CurrencyFormatPipe, CurrencyCode } from '../../../../shared/pipes/currency-format.pipe';

interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  pendingTransactions: number;
  monthlyChange: number;
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: CurrencyCode;
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'blocked';
  number: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: Date;
  category: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    CurrencyFormatPipe
  ],
  template: `
    <div class="dashboard">
      <!-- Header del Dashboard -->
      <header class="dashboard__header">
        <div class="dashboard__header-left">
          <h1 class="dashboard__title">Dashboard</h1>
          <p class="dashboard__subtitle">
            Bienvenido de nuevo, {{ userName() }}
          </p>
        </div>
        <div class="dashboard__header-right">
          <app-button
            variant="outline"
            size="sm"
            (onClick)="refreshData()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
            Actualizar
          </app-button>
        </div>
      </header>

      <!-- Estadísticas Principales -->
      <section class="dashboard__stats">
        <div class="dashboard__stat-card">
          <div class="dashboard__stat-header">
            <span class="dashboard__stat-title">Balance Total</span>
            <div class="dashboard__stat-icon dashboard__stat-icon--primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" x2="12" y1="2" y2="22"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div class="dashboard__stat-value">
            {{ totalBalance() | currencyFormat:'EUR':'symbol' }}
          </div>
          <div class="dashboard__stat-change" [class.dashboard__stat-change--positive]="monthlyChange() >= 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            {{ monthlyChange() }}% este mes
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-header">
            <span class="dashboard__stat-title">Ingresos</span>
            <div class="dashboard__stat-icon dashboard__stat-icon--success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <div class="dashboard__stat-value dashboard__stat-value--success">
            {{ monthlyIncome() | currencyFormat:'EUR':'symbol' }}
          </div>
          <div class="dashboard__stat-change dashboard__stat-change--positive">
            +12.5% vs mes anterior
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-header">
            <span class="dashboard__stat-title">Gastos</span>
            <div class="dashboard__stat-icon dashboard__stat-icon--error">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </svg>
            </div>
          </div>
          <div class="dashboard__stat-value dashboard__stat-value--error">
            {{ monthlyExpenses() | currencyFormat:'EUR':'symbol' }}
          </div>
          <div class="dashboard__stat-change dashboard__stat-change--negative">
            +8.2% vs mes anterior
          </div>
        </div>

        <div class="dashboard__stat-card">
          <div class="dashboard__stat-header">
            <span class="dashboard__stat-title">Pendientes</span>
            <div class="dashboard__stat-icon dashboard__stat-icon--warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div class="dashboard__stat-value dashboard__stat-value--warning">
            {{ pendingTransactions() }}
          </div>
          <div class="dashboard__stat-change">
            Transacciones por procesar
          </div>
        </div>
      </section>

      <!-- Grid Principal -->
      <div class="dashboard__grid">
        <!-- Cuentas -->
        <app-card class="dashboard__card dashboard__card--accounts" title="Mis Cuentas">
          <div class="dashboard__accounts">
            @for (account of accounts(); track account.id) {
              <div class="dashboard__account" [class.dashboard__account--active]="account.id === selectedAccountId()">
                <div class="dashboard__account-header">
                  <div class="dashboard__account-info">
                    <span class="dashboard__account-name">{{ account.name }}</span>
                    <span class="dashboard__account-number">{{ account.number }}</span>
                  </div>
                  <div class="dashboard__account-badge" [class]="'dashboard__account-badge--' + account.type">
                    {{ account.type === 'checking' ? 'Corriente' : account.type === 'savings' ? 'Ahorro' : 'Credito' }}
                  </div>
                </div>
                <div class="dashboard__account-balance">
                  {{ account.balance | currencyFormat:account.currency:'symbol' }}
                </div>
              </div>
            }
          </div>
        </app-card>

        <!-- Transacciones Recientes -->
        <app-card class="dashboard__card dashboard__card--transactions" title="Transacciones Recientes">
          <div class="dashboard__transactions">
            @for (transaction of recentTransactions(); track transaction.id) {
              <div class="dashboard__transaction">
                <div class="dashboard__transaction-icon" [class]="'dashboard__transaction-icon--' + transaction.type">
                  @if (transaction.type === 'income') {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 19V5"/>
                      <path d="m5 12 7-7 7 7"/>
                    </svg>
                  } @else if (transaction.type === 'expense') {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14"/>
                      <path d="m19 12-7 7-7-7"/>
                    </svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 2.2V19.82a2.81 2.81 0 0 1-2.8 2.8H9.8A2.81 2.81 0 0 1 7 19.82V2.2"/>
                      <path d="M7 4.2V1h10v3.2"/>
                      <path d="M11 9.2v5.6"/>
                      <path d="M13 9.2v5.6"/>
                    </svg>
                  }
                </div>
                <div class="dashboard__transaction-details">
                  <span class="dashboard__transaction-description">{{ transaction.description }}</span>
                  <span class="dashboard__transaction-category">{{ transaction.category }}</span>
                </div>
                <div class="dashboard__transaction-amount" [class.dashboard__transaction-amount--income]="transaction.type === 'income'">
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | currencyFormat:'EUR':'symbol' }}
                </div>
              </div>
            }
          </div>
          <a routerLink="/transactions" class="dashboard__view-all">Ver todas las transacciones</a>
        </app-card>

        <!-- Alertas -->
        <app-card class="dashboard__card dashboard__card--alerts" title="Alertas">
          <div class="dashboard__alerts">
            @for (alert of alerts(); track alert.id) {
              <div class="dashboard__alert" [class.dashboard__alert--unread]="!alert.read">
                <div class="dashboard__alert-icon" [class]="'dashboard__alert-icon--' + alert.type">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                </div>
                <div class="dashboard__alert-content">
                  <span class="dashboard__alert-title">{{ alert.title }}</span>
                  <span class="dashboard__alert-message">{{ alert.message }}</span>
                  <span class="dashboard__alert-date">{{ alert.date | date:'short' }}</span>
                </div>
              </div>
            }
          </div>
        </app-card>

        <!-- Acciones Rápidas -->
        <app-card class="dashboard__card dashboard__card--actions" title="Acciones Rapidas">
          <div class="dashboard__actions">
            <a routerLink="/transfer" class="dashboard__action">
              <div class="dashboard__action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 2.2V19.82a2.81 2.81 0 0 1-2.8 2.8H9.8A2.81 2.81 0 0 1 7 19.82V2.2"/>
                  <path d="M7 4.2V1h10v3.2"/>
                  <path d="M11 9.2v5.6"/>
                  <path d="M13 9.2v5.6"/>
                </svg>
              </div>
              <span class="dashboard__action-label">Transferir</span>
            </a>
            <a routerLink="/payments" class="dashboard__action">
              <div class="dashboard__action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
              </div>
              <span class="dashboard__action-label">Pagar</span>
            </a>
            <a routerLink="/reports" class="dashboard__action">
              <div class="dashboard__action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
              </div>
              <span class="dashboard__action-label">Reportes</span>
            </a>
            <a routerLink="/settings" class="dashboard__action">
              <div class="dashboard__action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <span class="dashboard__action-label">Configuracion</span>
            </a>
          </div>
        </app-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .dashboard {
      &__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: var(--space-8);
        gap: var(--space-4);
        
        @media (max-width: 640px) {
          flex-direction: column;
        }
        
        &-left {
          flex: 1;
        }
        
        &-right {
          flex-shrink: 0;
        }
      }
      
      &__title {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        margin: 0 0 var(--space-2) 0;
      }
      
      &__subtitle {
        font-size: var(--font-size-base);
        color: var(--text-secondary);
        margin: 0;
      }
      
      &__stats {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--space-6);
        margin-bottom: var(--space-8);
        
        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
        
        @media (min-width: 1024px) {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      
      &__stat-card {
        background: var(--surface-1);
        border: var(--border-width-thin) solid var(--color-gray-200);
        border-radius: var(--border-radius-xl);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
      }
      
      &__stat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-4);
      }
      
      &__stat-title {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-secondary);
      }
      
      &__stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: var(--border-radius-lg);
        
        &--primary {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        
        &--success {
          background-color: var(--color-success-100);
          color: var(--success);
        }
        
        &--error {
          background-color: var(--color-error-100);
          color: var(--error);
        }
        
        &--warning {
          background-color: var(--color-warning-100);
          color: var(--warning);
        }
      }
      
      &__stat-value {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        margin-bottom: var(--space-2);
        
        &--success {
          color: var(--success);
        }
        
        &--error {
          color: var(--error);
        }
        
        &--warning {
          color: var(--warning);
        }
      }
      
      &__stat-change {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-sm);
        color: var(--text-muted);
        
        &--positive {
          color: var(--success);
        }
        
        &--negative {
          color: var(--error);
        }
        
        svg {
          width: 1rem;
          height: 1rem;
        }
      }
      
      &__grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-6);
        
        @media (min-width: 1024px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      &__card {
        &--accounts {
          grid-column: 1 / -1;
        }
        
        &--transactions {
          @media (min-width: 1024px) {
            grid-column: span 1;
          }
        }
      }
      
      &__accounts {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: var(--space-4);
        
        @media (min-width: 640px) {
          grid-template-columns: repeat(2, 1fr);
        }
        
        @media (min-width: 1024px) {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      &__account {
        background: var(--surface-2);
        border: var(--border-width-thin) solid var(--color-gray-200);
        border-radius: var(--border-radius-lg);
        padding: var(--space-4);
        cursor: pointer;
        transition: all var(--transition-fast);
        
        &:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        
        &--active {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }
        
        &-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
        
        &-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        &-name {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }
        
        &-number {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }
        
        &-badge {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--border-radius-md);
          
          &--checking {
            background-color: var(--color-primary-100);
            color: var(--primary);
          }
          
          &--savings {
            background-color: var(--color-success-100);
            color: var(--success);
          }
          
          &--credit {
            background-color: var(--color-warning-100);
            color: var(--warning);
          }
        }
        
        &-balance {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
        }
      }
      
      &__transactions {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      
      &__transaction {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        border-radius: var(--border-radius-lg);
        transition: background-color var(--transition-fast);
        
        &:hover {
          background-color: var(--surface-2);
        }
        
        &-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: var(--border-radius-lg);
          flex-shrink: 0;
          
          &--income {
            background-color: var(--color-success-100);
            color: var(--success);
          }
          
          &--expense {
            background-color: var(--color-error-100);
            color: var(--error);
          }
          
          &--transfer {
            background-color: var(--color-primary-100);
            color: var(--primary);
          }
        }
        
        &-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        &-description {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        &-category {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }
        
        &-amount {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          white-space: nowrap;
          
          &--income {
            color: var(--success);
          }
        }
      }
      
      &__view-all {
        display: block;
        text-align: center;
        padding: var(--space-3);
        margin-top: var(--space-4);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--primary);
        text-decoration: none;
        border-top: var(--border-width-thin) solid var(--color-gray-200);
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      &__alerts {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      
      &__alert {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-3);
        border-radius: var(--border-radius-lg);
        background-color: var(--surface-2);
        
        &--unread {
          background-color: var(--primary-light);
        }
        
        &-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: var(--border-radius-md);
          flex-shrink: 0;
          
          &--info {
            background-color: var(--color-info-100);
            color: var(--info);
          }
          
          &--warning {
            background-color: var(--color-warning-100);
            color: var(--warning);
          }
          
          &--success {
            background-color: var(--color-success-100);
            color: var(--success);
          }
          
          &--error {
            background-color: var(--color-error-100);
            color: var(--error);
          }
        }
        
        &-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        &-title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
        
        &-message {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          line-height: 1.4;
        }
        
        &-date {
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }
      }
      
      &__actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
      }
      
      &__action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-4);
        background-color: var(--surface-2);
        border: var(--border-width-thin) solid var(--color-gray-200);
        border-radius: var(--border-radius-lg);
        text-decoration: none;
        transition: all var(--transition-fast);
        
        &:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
          
          .dashboard__action-icon {
            background-color: var(--primary);
            color: var(--text-inverse);
          }
        }
        
        &-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background-color: var(--primary-light);
          color: var(--primary);
          border-radius: var(--border-radius-xl);
          transition: all var(--transition-fast);
          
          svg {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
        
        &-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
      }
    }
  `]
})
export class DashboardPage {
  private authStore = inject(AuthStore);
  private dashboardStore = inject(DashboardStore);

  // User info
  userName = computed(() => this.authStore.userFullName());

  // Stats
  totalBalance = computed(() => this.dashboardStore.totalBalance());
  monthlyIncome = computed(() => this.dashboardStore.monthlyIncome());
  monthlyExpenses = computed(() => this.dashboardStore.monthlyExpenses());
  pendingTransactions = computed(() => this.dashboardStore.pendingTransactions());
  monthlyChange = computed(() => this.dashboardStore.monthlyChange());

  // Accounts
  accounts = computed(() => this.dashboardStore.accounts());
  selectedAccountId = computed(() => this.dashboardStore.selectedAccountId());

  // Transactions
  recentTransactions = computed(() => this.dashboardStore.recentTransactions());

  // Alerts
  alerts = computed(() => this.dashboardStore.alerts());

  refreshData(): void {
    this.dashboardStore.refreshDashboard();
  }
}
