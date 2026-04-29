import {
  Signal,
  WritableSignal,
  signal,
  computed,
  effect,
  untracked,
  Injector
} from '@angular/core';

// ============================================
// UTILIDADES PARA SIGNALS
// ============================================

/**
 * Crear un signal con persistencia en localStorage
 */
export function persistentSignal<T>(key: string, initialValue: T): WritableSignal<T> {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const value = stored ? JSON.parse(stored) as T : initialValue;
  
  const sig = signal<T>(value);
  
  effect(() => {
    const current = sig();
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(current));
    }
  });
  
  return sig;
}

/**
 * Crear un signal con validación de tipo
 */
export function validatedSignal<T>(
  initialValue: T,
  validator: (value: T) => boolean
): WritableSignal<T> {
  const sig = signal<T>(initialValue);
  
  return {
    ...sig,
    set: (value: T) => {
      if (validator(value)) {
        sig.set(value);
      } else {
        console.warn('Signal value rejected by validator:', value);
      }
    },
    update: (fn: (value: T) => T) => {
      const newValue = fn(sig());
      if (validator(newValue)) {
        sig.set(newValue);
      } else {
        console.warn('Signal update rejected by validator:', newValue);
      }
    }
  } as WritableSignal<T>;
}

/**
 * Crear un signal con historial de cambios (undo/redo)
 */
export function historySignal<T>(initialValue: T, maxHistory: number = 50) {
  const sig = signal<T>(initialValue);
  const history = signal<T[]>([initialValue]);
  const currentIndex = signal<number>(0);
  
  const canUndo = computed(() => currentIndex() > 0);
  const canRedo = computed(() => currentIndex() < history().length - 1);
  
  const setWithHistory = (value: T) => {
    sig.set(value);
    
    // Remove any future history if we're not at the end
    const newHistory = history().slice(0, currentIndex() + 1);
    newHistory.push(value);
    
    // Keep only last maxHistory items
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    
    history.set(newHistory);
    currentIndex.set(newHistory.length - 1);
  };
  
  const undo = () => {
    if (canUndo()) {
      const newIndex = currentIndex() - 1;
      currentIndex.set(newIndex);
      sig.set(history()[newIndex]);
    }
  };
  
  const redo = () => {
    if (canRedo()) {
      const newIndex = currentIndex() + 1;
      currentIndex.set(newIndex);
      sig.set(history()[newIndex]);
    }
  };
  
  const reset = () => {
    sig.set(initialValue);
    history.set([initialValue]);
    currentIndex.set(0);
  };
  
  return {
    ...sig,
    set: setWithHistory,
    update: (fn: (value: T) => T) => setWithHistory(fn(sig())),
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyLength: computed(() => history().length),
    currentHistoryIndex: currentIndex.asReadonly()
  };
}

/**
 * Combinar múltiples signals en uno solo
 */
export function combineSignals<T extends Record<string, Signal<unknown>>>(
  signals: T
): Signal<{ [K in keyof T]: T[K] extends Signal<infer V> ? V : never }> {
  return computed(() => {
    const result = {} as { [K in keyof T]: T[K] extends Signal<infer V> ? V : never };
    
    for (const key of Object.keys(signals) as Array<keyof T>) {
      result[key] = signals[key]() as T[keyof T] extends Signal<infer V> ? V : never;
    }
    
    return result;
  });
}

/**
 * Crear un signal derivado (computed) con memoización personalizada
 */
export function memoizedComputed<T>(
  computation: () => T,
  equalityFn: (a: T, b: T) => boolean = Object.is
): Signal<T> {
  let lastValue: T | undefined;
  
  return computed(() => {
    const newValue = computation();
    
    if (lastValue === undefined || !equalityFn(lastValue, newValue)) {
      lastValue = newValue;
    }
    
    return lastValue;
  });
}

/**
 * Crear un signal async que maneja estados de carga
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function asyncSignal<T>(
  asyncFn: () => Promise<T>,
  initialValue: T | null = null
): Signal<AsyncState<T>> {
  const state = signal<AsyncState<T>>({
    data: initialValue,
    loading: false,
    error: null
  });
  
  const run = async () => {
    state.update(s => ({ ...s, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      state.set({ data, loading: false, error: null });
    } catch (error) {
      state.set({ 
        data: initialValue, 
        loading: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      });
    }
  };
  
  // Auto-run
  run();
  
  return state.asReadonly();
}

/**
 * Crear un signal con debounce
 */
export function debouncedSignal<T>(
  initialValue: T,
  delayMs: number = 300
): { value: WritableSignal<T>; debouncedValue: Signal<T> } {
  const value = signal<T>(initialValue);
  const debouncedValue = signal<T>(initialValue);
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  effect(() => {
    const current = value();
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue.set(current);
    }, delayMs);
  });
  
  return { value, debouncedValue: debouncedValue.asReadonly() };
}

/**
 * Crear un signal con throttle
 */
export function throttledSignal<T>(
  initialValue: T,
  intervalMs: number = 300
): { value: WritableSignal<T>; throttledValue: Signal<T> } {
  const value = signal<T>(initialValue);
  const throttledValue = signal<T>(initialValue);
  
  let lastEmitTime = 0;
  
  effect(() => {
    const current = value();
    const now = Date.now();
    
    if (now - lastEmitTime >= intervalMs) {
      throttledValue.set(current);
      lastEmitTime = now;
    }
  });
  
  return { value, throttledValue: throttledValue.asReadonly() };
}

/**
 * Crear un signal con transformación de array (filter, map, sort)
 */
export function arraySignal<T>(initialValue: T[] = []) {
  const sig = signal<T[]>(initialValue);
  
  return {
    ...sig,
    push: (item: T) => sig.update(arr => [...arr, item]),
    unshift: (item: T) => sig.update(arr => [item, ...arr]),
    remove: (predicate: (item: T) => boolean) => 
      sig.update(arr => arr.filter(item => !predicate(item))),
    updateItem: (predicate: (item: T) => boolean, updateFn: (item: T) => T) =>
      sig.update(arr => arr.map(item => predicate(item) ? updateFn(item) : item)),
    sort: (compareFn?: (a: T, b: T) => number) =>
      sig.update(arr => [...arr].sort(compareFn)),
    clear: () => sig.set([]),
    length: computed(() => sig().length),
    isEmpty: computed(() => sig().length === 0),
    first: computed(() => sig()[0] ?? null),
    last: computed(() => sig()[sig().length - 1] ?? null)
  };
}

/**
 * Crear un signal con límite de tamaño (LRU cache)
 */
export function limitedSignal<T>(maxSize: number): {
  value: Signal<T[]>;
  add: (item: T) => void;
  remove: (index: number) => void;
  clear: () => void;
} {
  const sig = signal<T[]>([]);
  
  const add = (item: T) => {
    sig.update(arr => {
      const newArr = [item, ...arr];
      return newArr.slice(0, maxSize);
    });
  };
  
  const remove = (index: number) => {
    sig.update(arr => arr.filter((_, i) => i !== index));
  };
  
  const clear = () => sig.set([]);
  
  return {
    value: sig.asReadonly(),
    add,
    remove,
    clear
  };
}

/**
 * Crear un signal de toggle (boolean)
 */
export function toggleSignal(initialValue: boolean = false): {
  value: WritableSignal<boolean>;
  toggle: () => void;
  on: () => void;
  off: () => void;
} {
  const sig = signal<boolean>(initialValue);
  
  return {
    value: sig,
    toggle: () => sig.update(v => !v),
    on: () => sig.set(true),
    off: () => sig.set(false)
  };
}

/**
 * Crear un signal de contador
 */
export function counterSignal(initialValue: number = 0, min?: number, max?: number): {
  value: WritableSignal<number>;
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
  set: (value: number) => void;
} {
  const sig = signal<number>(initialValue);
  
  const clamp = (value: number) => {
    if (min !== undefined && value < min) return min;
    if (max !== undefined && value > max) return max;
    return value;
  };
  
  return {
    value: sig,
    increment: (amount: number = 1) => sig.update(v => clamp(v + amount)),
    decrement: (amount: number = 1) => sig.update(v => clamp(v - amount)),
    reset: () => sig.set(initialValue),
    set: (value: number) => sig.set(clamp(value))
  };
}

/**
 * Crear un signal con selector (derive value from signal)
 */
export function selectSignal<T, R>(
  source: Signal<T>,
  selector: (value: T) => R
): Signal<R> {
  return computed(() => selector(source()));
}

/**
 * Pipe para transformar signals
 */
export function pipeSignal<T>(
  source: Signal<T>,
  ...fns: Array<(value: T) => T>
): Signal<T> {
  return computed(() => {
    return fns.reduce((acc, fn) => fn(acc), source());
  });
}

/**
 * Crear un signal de búsqueda (search/query)
 */
export function searchSignal<T>(
  items: Signal<T[]>,
  searchFn: (item: T, query: string) => boolean
): { query: WritableSignal<string>; results: Signal<T[]> } {
  const query = signal<string>('');
  
  const results = computed(() => {
    const q = query().toLowerCase().trim();
    if (!q) return items();
    return items().filter(item => searchFn(item, q));
  });
  
  return { query, results };
}

/**
 * Crear un signal paginado
 */
export function paginatedSignal<T>(
  items: Signal<T[]>,
  pageSize: number = 10
): {
  currentPage: WritableSignal<number>;
  pageSize: Signal<number>;
  totalPages: Signal<number>;
  totalItems: Signal<number>;
  currentItems: Signal<T[]>;
  hasNextPage: Signal<boolean>;
  hasPreviousPage: Signal<boolean>;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
} {
  const currentPage = signal<number>(1);
  const pageSizeSig = signal<number>(pageSize);
  
  const totalItems = computed(() => items().length);
  const totalPages = computed(() => Math.ceil(totalItems() / pageSizeSig()));
  
  const currentItems = computed(() => {
    const start = (currentPage() - 1) * pageSizeSig();
    const end = start + pageSizeSig();
    return items().slice(start, end);
  });
  
  const hasNextPage = computed(() => currentPage() < totalPages());
  const hasPreviousPage = computed(() => currentPage() > 1);
  
  const nextPage = () => {
    if (hasNextPage()) {
      currentPage.update(p => p + 1);
    }
  };
  
  const previousPage = () => {
    if (hasPreviousPage()) {
      currentPage.update(p => p - 1);
    }
  };
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages()) {
      currentPage.set(page);
    }
  };
  
  return {
    currentPage,
    pageSize: pageSizeSig.asReadonly(),
    totalPages,
    totalItems,
    currentItems,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    goToPage
  };
}

/**
 * Crear un signal de formulario reactivo
 */
export function formSignal<T extends Record<string, unknown>>(
  initialValue: T
): {
  value: WritableSignal<T>;
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  updateField: <K extends keyof T>(field: K, fn: (value: T[K]) => T[K]) => void;
  reset: () => void;
  isDirty: Signal<boolean>;
  dirtyFields: Signal<Array<keyof T>>;
} {
  const sig = signal<T>(initialValue);
  const initial = signal<T>(initialValue);
  const dirtyFieldsSet = signal<Set<keyof T>>(new Set());
  
  const setField = <K extends keyof T>(field: K, value: T[K]) => {
    sig.update(v => ({ ...v, [field]: value }));
    dirtyFieldsSet.update(s => new Set(s).add(field));
  };
  
  const updateField = <K extends keyof T>(field: K, fn: (value: T[K]) => T[K]) => {
    sig.update(v => ({ ...v, [field]: fn(v[field]) }));
    dirtyFieldsSet.update(s => new Set(s).add(field));
  };
  
  const reset = () => {
    sig.set(initial());
    dirtyFieldsSet.set(new Set());
  };
  
  const isDirty = computed(() => dirtyFieldsSet().size > 0);
  const dirtyFields = computed(() => Array.from(dirtyFieldsSet()));
  
  return {
    value: sig,
    setField,
    updateField,
    reset,
    isDirty,
    dirtyFields
  };
}
