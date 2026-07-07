// ============================================================================
// ConfirmationCard (refactored) — No emoji; uses Badge + Lucide icons + primitives
// Source: new_Design_plan.md Task 5, USER_FLOWS.md Flow 3
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  Check, X, Pencil, ShoppingCart, Receipt, CreditCard,
  Package, RotateCcw, Search, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Transaction, Intent } from '@/types';

interface ConfirmationCardProps {
  transaction: Transaction;
  onConfirm: (corrections?: Record<string, unknown>) => void;
  onCancel: () => void;
}

const INTENT_CONFIG: Record<Intent, { label: string; Icon: React.ElementType; badge: 'success' | 'danger' | 'warning' | 'info' | 'neutral' }> = {
  sale:             { label: 'Sale',           Icon: ShoppingCart, badge: 'success' },
  expense:          { label: 'Expense',        Icon: Receipt,      badge: 'danger'  },
  credit_given:     { label: 'Credit Given',   Icon: CreditCard,   badge: 'warning' },
  credit_received:  { label: 'Credit Recv.',   Icon: CreditCard,   badge: 'info'    },
  stock_update:     { label: 'Stock Update',   Icon: Package,      badge: 'neutral' },
  stock_check:      { label: 'Stock Check',    Icon: Search,       badge: 'neutral' },
  return:           { label: 'Return',         Icon: RotateCcw,    badge: 'neutral' },
};

export function ConfirmationCard({ transaction, onConfirm, onCancel }: ConfirmationCardProps) {
  const [editing, setEditing] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, unknown>>({});

  const intent = transaction.intent as Intent;
  const confidence = transaction.confidence_score ?? 0;
  const isPositive = ['sale', 'credit_received'].includes(intent);
  const cfg = INTENT_CONFIG[intent] ?? INTENT_CONFIG.sale;
  const { label, Icon, badge } = cfg;

  function set(field: string, value: string | number) {
    setCorrections((p) => ({ ...p, [field]: value }));
  }

  function handleConfirm() {
    onConfirm(Object.keys(corrections).length > 0 ? corrections : undefined);
  }

  // Confidence bar color
  const barColor =
    confidence >= 0.85 ? 'var(--color-success)' :
    confidence >= 0.7  ? 'var(--color-warning)' :
    'var(--color-danger)';

  return (
    <Card padding="none" className="animate-card-enter overflow-hidden">
      {/* Confidence bar */}
      <div
        className="h-1 transition-all duration-500"
        style={{ background: barColor, width: `${Math.round(confidence * 100)}%` }}
        role="progressbar"
        aria-valuenow={Math.round(confidence * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence: ${Math.round(confidence * 100)}%`}
      />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge variant={badge} icon={<Icon className="w-3.5 h-3.5" />}>
            {label}
          </Badge>
          <span className="text-[var(--text-caption)] text-[var(--color-text-muted)]">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">Amount</span>
          {editing ? (
            <Input
              type="number"
              defaultValue={transaction.amount}
              onChange={(e) => set('amount', Number(e.target.value))}
              className="!w-32 !h-9 text-right text-lg font-bold"
            />
          ) : (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-[var(--color-income)]" aria-hidden />
              ) : (
                <TrendingDown className="w-4 h-4 text-[var(--color-expense)]" aria-hidden />
              )}
              <span
                className={[
                  'text-2xl font-bold',
                  isPositive ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]',
                ].join(' ')}
              >
                {isPositive ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Item */}
        {(transaction.item || editing) && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)] flex-shrink-0">Item</span>
            {editing ? (
              <Input
                defaultValue={transaction.item || ''}
                onChange={(e) => set('item', e.target.value)}
                className="!h-9 text-right"
              />
            ) : (
              <span className="font-medium">{transaction.item}</span>
            )}
          </div>
        )}

        {/* Quantity */}
        {transaction.quantity != null && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">Qty</span>
            <span className="font-medium">{transaction.quantity} {transaction.unit || ''}</span>
          </div>
        )}

        {/* Customer */}
        {(transaction.customer_name || editing) && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)] flex-shrink-0">Customer</span>
            {editing ? (
              <Input
                defaultValue={transaction.customer_name || ''}
                onChange={(e) => set('customer_name', e.target.value)}
                className="!h-9 text-right"
              />
            ) : (
              <span className="font-medium">{transaction.customer_name}</span>
            )}
          </div>
        )}

        {/* Payment mode */}
        {transaction.payment_mode && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">Payment</span>
            <Badge variant="neutral">{transaction.payment_mode}</Badge>
          </div>
        )}

        {/* Transcript */}
        {transaction.raw_transcript && (
          <blockquote className="text-[var(--text-sm)] text-[var(--color-text-muted)] italic border-l-2 border-[var(--color-border)] pl-3">
            &ldquo;{transaction.raw_transcript}&rdquo;
          </blockquote>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-divider)]">
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            icon={<Check className="w-4 h-4" />}
          >
            Confirm
          </Button>
          {!editing ? (
            <Button variant="secondary" onClick={() => setEditing(true)} icon={<Pencil className="w-4 h-4" />}>
              Edit
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => { setEditing(false); setCorrections({}); }}>
              Reset
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} icon={<X className="w-4 h-4" />} aria-label="Cancel" />
        </div>
      </div>
    </Card>
  );
}
