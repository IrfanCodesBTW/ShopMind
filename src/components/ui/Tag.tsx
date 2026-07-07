// ============================================================================
// Tag — Transaction Type Indicator (removable)
// Source: new_Design_plan.md Task 4
// ============================================================================

import React from 'react';
import { X, ShoppingCart, Receipt, CreditCard, Package, RotateCcw, Search } from 'lucide-react';
import type { Intent } from '@/types';

interface TagProps {
  intent: Intent;
  onRemove?: () => void;
  className?: string;
}

const INTENT_CONFIG: Record<Intent, { label: string; Icon: React.ElementType; bg: string; text: string }> = {
  sale:             { label: 'Sale',           Icon: ShoppingCart, bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-800 dark:text-green-300' },
  expense:          { label: 'Expense',        Icon: Receipt,      bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-800 dark:text-red-300' },
  credit_given:     { label: 'Credit Given',   Icon: CreditCard,   bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
  credit_received:  { label: 'Credit Recv.',   Icon: CreditCard,   bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-800 dark:text-blue-300' },
  stock_update:     { label: 'Stock Update',   Icon: Package,      bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
  stock_check:      { label: 'Stock Check',    Icon: Search,       bg: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-700 dark:text-gray-300' },
  return:           { label: 'Return',         Icon: RotateCcw,    bg: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-700 dark:text-gray-300' },
};

export function Tag({ intent, onRemove, className = '' }: TagProps) {
  const config = INTENT_CONFIG[intent] || INTENT_CONFIG.sale;
  const { label, Icon, bg, text } = config;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-pill)]',
        'text-[var(--text-sm)] font-medium',
        bg,
        text,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden />
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 cursor-pointer"
          aria-label={`Remove ${label} filter`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
