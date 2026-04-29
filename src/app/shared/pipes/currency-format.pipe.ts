import { Pipe, PipeTransform } from '@angular/core';

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'MXN' | 'ARS' | 'BRL' | 'CLP' | 'COP';

interface CurrencyConfig {
  symbol: string;
  locale: string;
  decimals: number;
}

const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { symbol: '$', locale: 'en-US', decimals: 2 },
  EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
  GBP: { symbol: '£', locale: 'en-GB', decimals: 2 },
  JPY: { symbol: '¥', locale: 'ja-JP', decimals: 0 },
  MXN: { symbol: '$', locale: 'es-MX', decimals: 2 },
  ARS: { symbol: '$', locale: 'es-AR', decimals: 2 },
  BRL: { symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  CLP: { symbol: '$', locale: 'es-CL', decimals: 0 },
  COP: { symbol: '$', locale: 'es-CO', decimals: 0 }
};

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency: CurrencyCode = 'USD',
    display: 'symbol' | 'code' | 'name' = 'symbol',
    showDecimals: boolean = true,
    useGrouping: boolean = true
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '';
    }

    const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
    const decimals = showDecimals ? config.decimals : 0;

    try {
      const formatter = new Intl.NumberFormat(config.locale, {
        style: display === 'code' ? 'decimal' : 'currency',
        currency: currency,
        currencyDisplay: display === 'code' ? 'code' : 'symbol',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: useGrouping
      });

      if (display === 'code') {
        return `${currency} ${formatter.format(numValue)}`;
      }

      return formatter.format(numValue);
    } catch {
      // Fallback
      return `${config.symbol}${numValue.toFixed(decimals)}`;
    }
  }
}

@Pipe({
  name: 'percentageFormat',
  standalone: true
})
export class PercentageFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    decimals: number = 1,
    includeSign: boolean = true
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '';
    }

    const formatted = numValue.toFixed(decimals);
    const sign = includeSign && numValue > 0 ? '+' : '';

    return `${sign}${formatted}%`;
  }
}

@Pipe({
  name: 'numberFormat',
  standalone: true
})
export class NumberFormatPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    decimals: number = 0,
    locale: string = 'es-ES'
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '';
    }

    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(numValue);
    } catch {
      return numValue.toFixed(decimals);
    }
  }
}

@Pipe({
  name: 'accountNumber',
  standalone: true
})
export class AccountNumberPipe implements PipeTransform {
  transform(value: string | null | undefined, mask: boolean = false): string {
    if (!value) {
      return '';
    }

    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    if (mask) {
      // Show only last 4 digits
      const masked = '*'.repeat(Math.max(0, cleaned.length - 4));
      const lastFour = cleaned.slice(-4);
      return `${masked}${lastFour}`;
    }

    // Format with spaces every 4 digits
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  }
}
