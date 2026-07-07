// ============================================================================
// Toast — Notification System with Context
// Source: new_Design_plan.md Task 5
// ============================================================================

'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
});

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'border-[var(--color-success)] text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/20',
  error:   'border-[var(--color-danger)] text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/20',
  warning: 'border-[var(--color-warning)] text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20',
  info:    'border-[var(--color-info)] text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/20',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-[var(--color-success)]',
  error:   'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
  info:    'text-[var(--color-info)]',
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const Icon = icons[item.type];

  React.useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), item.duration ?? 4000);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onRemove]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        'animate-toast-enter flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)]',
        'border shadow-[var(--shadow-dropdown)] max-w-sm w-full',
        'text-[var(--text-sm)] font-medium',
        styles[item.type],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon className={['w-5 h-5 flex-shrink-0 mt-0.5', iconColors[item.type]].join(' ')} aria-hidden />
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const ctx: ToastContextValue = {
    toast: add,
    success: (m) => add(m, 'success'),
    error:   (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
    info:    (m) => add(m, 'info'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast stack — top-right desktop / top-center mobile */}
      <div
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
        style={{ zIndex: 'var(--z-toast)' }}
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem item={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
