import { Injectable, inject, signal, computed } from '@angular/core';
import { CurrencyCode } from '../../../shared/pipes/currency-format.pipe';

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

interface DashboardState {
  accounts: Account[];
  selectedAccountId: string | null;
  recentTransactions: Transaction[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  // State
  private readonly state = signal<DashboardState>({
    accounts: [
      {
        id: '1',
        name: 'Cuenta Corriente',
        type: 'checking',
        balance: 15432.50,
        currency: 'EUR',
        lastUpdated: new Date(),
        status: 'active',
        number: '**** 4521'
      },
      {
        id: '2',
        name: 'Ahorros',
        type: 'savings',
        balance: 28750.00,
        currency: 'EUR',
        lastUpdated: new Date(),
        status: 'active',
        number: '**** 8934'
      },
      {
        id: '3',
        name: 'Tarjeta de Credito',
        type: 'credit',
        balance: -2340.75,
        currency: 'EUR',
        lastUpdated: new Date(),
        status: 'active',
        number: '**** 5521'
      }
    ],
    selectedAccountId: null,
    recentTransactions: [
      {
        id: '1',
        description: 'Supermercado Dia',
        amount: 87.43,
        type: 'expense',
        date: new Date('2024-01-15'),
        category: 'Alimentacion'
      },
      {
        id: '2',
        description: 'Nomina Enero',
        amount: 2500.00,
        type: 'income',
        date: new Date('2024-01-14'),
        category: 'Nomina'
      },
      {
        id: '3',
        description: 'Transferencia a Juan',
        amount: 150.00,
        type: 'transfer',
        date: new Date('2024-01-13'),
        category: 'Transferencias'
      },
      {
        id: '4',
        description: 'Netflix',
        amount: 15.99,
        type: 'expense',
        date: new Date('2024-01-12'),
        category: 'Entretenimiento'
      },
      {
        id: '5',
        description: 'Reembolso',
        amount: 45.00,
        type: 'income',
        date: new Date('2024-01-11'),
        category: 'Reembolsos'
      }
    ],
    alerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Pago proximo',
        message: 'Tu pago de tarjeta de credito vence en 3 dias',
        date: new Date(),
        read: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Nueva funcion disponible',
        message: 'Ahora puedes configurar alertas personalizadas',
        date: new Date(Date.now() - 86400000),
        read: false
      }
    ],
    isLoading: false,
    error: null,
    lastUpdated: new Date()
  });

  // Computed signals
  readonly accounts = computed(() => this.state().accounts);
  readonly selectedAccountId = computed(() => this.state().selectedAccountId);
  readonly selectedAccount = computed(() => {
    const accounts = this.state().accounts;
    const selectedId = this.state().selectedAccountId;
    return selectedId
      ? accounts.find(a => a.id === selectedId) || accounts[0]
      : accounts[0];
  });

  readonly recentTransactions = computed(() => this.state().recentTransactions);
  readonly alerts = computed(() => this.state().alerts);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  // Stats computados
  readonly totalBalance = computed(() => {
    return this.state().accounts.reduce((sum, account) => sum + account.balance, 0);
  });

  readonly monthlyIncome = computed(() => {
    return 2500; // Simulado
  });

  readonly monthlyExpenses = computed(() => {
    return 1850.75; // Simulado
  });

  readonly pendingTransactions = computed(() => {
    return 3; // Simulado
  });

  readonly monthlyChange = computed(() => {
    const total = this.totalBalance();
    const previousMonth = total * 0.92; // Simulado: 8% de incremento
    return ((total - previousMonth) / previousMonth) * 100;
  });

  // Methods
  setSelectedAccount(accountId: string): void {
    this.state.update(s => ({ ...s, selectedAccountId: accountId }));
  }

  addAccount(account: Account): void {
    this.state.update(s => ({
      ...s,
      accounts: [...s.accounts, account],
      lastUpdated: new Date()
    }));
  }

  removeAccount(accountId: string): void {
    this.state.update(s => ({
      ...s,
      accounts: s.accounts.filter(a => a.id !== accountId),
      lastUpdated: new Date()
    }));
  }

  addTransaction(transaction: Transaction): void {
    this.state.update(s => ({
      ...s,
      recentTransactions: [transaction, ...s.recentTransactions.slice(0, 9)],
      lastUpdated: new Date()
    }));
  }

  markAlertAsRead(alertId: string): void {
    this.state.update(s => ({
      ...s,
      alerts: s.alerts.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      )
    }));
  }

  removeAlert(alertId: string): void {
    this.state.update(s => ({
      ...s,
      alerts: s.alerts.filter(a => a.id !== alertId)
    }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, isLoading: loading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error }));
  }

  refreshDashboard(): void {
    this.setLoading(true);
    this.setError(null);

    // Simular carga de datos
    setTimeout(() => {
      this.state.update(s => ({
        ...s,
        lastUpdated: new Date(),
        isLoading: false
      }));
    }, 1000);
  }
}
