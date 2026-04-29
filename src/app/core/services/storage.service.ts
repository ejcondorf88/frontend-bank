import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Signals para reactividad del storage
  private _storageChange = signal<string | null>(null);
  readonly storageChange = computed(() => this._storageChange());

  constructor() {
    // Escuchar cambios de storage de otras pestañas
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key) {
          this._storageChange.set(event.key);
        }
      });
    }
  }

  // LocalStorage operations
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  setItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }

  // SessionStorage operations
  getSessionItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from sessionStorage: ${key}`, error);
      return null;
    }
  }

  setSessionItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error writing to sessionStorage: ${key}`, error);
    }
  }

  removeSessionItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage: ${key}`, error);
    }
  }

  clearSession(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage', error);
    }
  }

  // Utilities
  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  hasSessionItem(key: string): boolean {
    return this.getSessionItem(key) !== null;
  }

  // Get all keys
  getKeys(): string[] {
    if (typeof window === 'undefined') return [];
    
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  // Get storage size
  getSize(): number {
    if (typeof window === 'undefined') return 0;
    
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalSize += key.length + (localStorage.getItem(key)?.length || 0);
      }
    }
    return totalSize;
  }
}
