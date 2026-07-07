// ============================================================================
// Record Page — Voice Recording + Confirmation Flow (restyled)
// Source: new_Design_plan.md Task 7, USER_FLOWS.md Flow 1, Flow 3, Flow 7
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import { VoiceRecordButton } from '@/components/voice/VoiceRecordButton';
import { ConfirmationCard } from '@/components/transaction/ConfirmationCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { CheckCircle2, Plus, ArrowLeft } from 'lucide-react';
import type { Transaction, Intent, PaymentMode } from '@/types';

type PageState = 'ready' | 'processing' | 'confirm' | 'success' | 'manual';

const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'card', 'credit'];
const INTENTS: Intent[] = ['sale', 'expense', 'credit_given', 'credit_received', 'stock_update'];

export default function RecordPage() {
  const [pageState, setPageState] = useState<PageState>('ready');
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manual entry state
  const [manualIntent, setManualIntent] = useState<Intent>('sale');
  const [manualItem, setManualItem] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualUnit, setManualUnit] = useState('');
  const [manualPaymentMode, setManualPaymentMode] = useState<PaymentMode>('cash');

  const handleTransactionParsed = useCallback((transaction: Transaction) => {
    setPendingTransaction(transaction);
    setPageState('confirm');
    setError(null);
  }, []);

  const handleConfirm = useCallback(
    async (corrections?: Record<string, unknown>) => {
      if (!pendingTransaction) return;
      try {
        const response = await fetch('/api/transactions/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_id: pendingTransaction.id, corrections }),
        });
        const data = await response.json();
        if (data.success) {
          setPageState('success');
          setTimeout(() => { setPageState('ready'); setPendingTransaction(null); }, 2500);
        } else {
          setError(data.error?.message || 'Failed to confirm transaction');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      }
    },
    [pendingTransaction]
  );

  const handleCancel = useCallback(() => {
    setPendingTransaction(null);
    setPageState('ready');
    setError(null);
  }, []);

  const handleManualSubmit = useCallback(async () => {
    if (!manualAmount || Number(manualAmount) <= 0) {
      setError('Amount is required');
      return;
    }
    try {
      const response = await fetch('/api/transactions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: 'manual',
          corrections: {
            intent: manualIntent,
            item: manualItem || null,
            amount: Number(manualAmount),
            customer_name: manualCustomer || null,
            quantity: manualQuantity ? Number(manualQuantity) : null,
            unit: manualUnit || null,
            payment_mode: manualPaymentMode,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPageState('success');
        setManualItem(''); setManualAmount(''); setManualCustomer('');
        setManualQuantity(''); setManualUnit('');
        setTimeout(() => setPageState('ready'), 2500);
      } else {
        setError(data.error?.message || 'Failed to save transaction');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }, [manualIntent, manualItem, manualAmount, manualCustomer, manualQuantity, manualUnit, manualPaymentMode]);

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">
          Record Transaction
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed">
          {pageState === 'ready' && 'Speak your transaction or enter details manually'}
          {pageState === 'processing' && 'Processing your voice audio…'}
          {pageState === 'confirm' && 'Review details extracted by AI'}
          {pageState === 'success' && 'Transaction recorded successfully'}
          {pageState === 'manual' && 'Enter transaction details below'}
        </p>
      </div>

      {/* Success */}
      {pageState === 'success' && (
        <div className="flex flex-col items-center gap-4 py-20 animate-card-enter">
          <div className="w-16 h-16 rounded-[var(--radius-full)] bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-[var(--color-success)]" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[var(--text-body-lg)] font-bold text-[var(--color-success)]">Transaction Saved!</p>
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">Returning to recording screen…</p>
          </div>
        </div>
      )}

      {/* Voice recording — Centered with generous vertical padding for high visual focus */}
      {(pageState === 'ready' || pageState === 'processing') && (
        <div className="flex flex-col items-center justify-center py-20 space-y-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)]">
          <VoiceRecordButton
            onTransactionParsed={handleTransactionParsed}
            onProcessingStart={() => setPageState('processing')}
            onError={(err) => { setError(err); setPageState('ready'); }}
          />

          <div className="flex items-center gap-4 text-[var(--color-text-muted)] w-full max-w-xs px-6">
            <div className="h-px flex-grow bg-[var(--color-border)]" />
            <span className="text-[var(--text-sm)] font-medium">or</span>
            <div className="h-px flex-grow bg-[var(--color-border)]" />
          </div>

          <Button variant="secondary" onClick={() => setPageState('manual')} icon={<Plus className="w-4 h-4" />}>
            Enter Manually
          </Button>
        </div>
      )}

      {/* Confirmation card */}
      {pageState === 'confirm' && pendingTransaction && (
        <div className="max-w-md mx-auto">
          <ConfirmationCard
            transaction={pendingTransaction}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Manual entry form using design system primitives */}
      {pageState === 'manual' && (
        <Card padding="lg" className="animate-card-enter space-y-6 border-[var(--color-border)] shadow-[var(--shadow-md)]">
          {/* Header row to go back */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-divider)]">
            <h2 className="text-[var(--text-body)] font-bold text-[var(--color-text-primary)]">Manual Entry</h2>
            <Button variant="ghost" size="sm" onClick={() => setPageState('ready')} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Mic
            </Button>
          </div>

          {/* Type selector */}
          <div className="space-y-2">
            <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Transaction Type</p>
            <div className="flex flex-wrap gap-2">
              {INTENTS.map((intent) => (
                <button key={intent} onClick={() => setManualIntent(intent)} className="cursor-pointer">
                  <Tag
                    intent={intent}
                    className={manualIntent === intent ? 'ring-2 ring-[var(--color-primary)] ring-offset-2' : 'opacity-85 hover:opacity-100'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Amount *"
            type="number"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            placeholder="0.00"
            leftIcon={<span className="text-sm font-semibold text-[var(--color-text-muted)]">₹</span>}
            error={error && !manualAmount ? 'Amount is required' : undefined}
            required
          />

          {/* Item */}
          <Input
            label="Item description"
            value={manualItem}
            onChange={(e) => setManualItem(e.target.value)}
            placeholder="e.g. Rice, Milk, Electricity bill"
          />

          {/* Qty + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Unit"
              value={manualUnit}
              onChange={(e) => setManualUnit(e.target.value)}
              placeholder="kg, pc, packet, litre…"
            />
          </div>

          {/* Customer */}
          <Input
            label="Customer Name"
            value={manualCustomer}
            onChange={(e) => setManualCustomer(e.target.value)}
            placeholder="e.g. Rajesh Kumar (optional)"
          />

          {/* Payment mode */}
          <div className="space-y-2">
            <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Payment Mode</p>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setManualPaymentMode(mode)}
                  className={[
                    'px-5 py-2.5 rounded-[var(--radius-pill)] text-[var(--text-sm)] font-semibold capitalize cursor-pointer',
                    'border transition-all duration-[var(--motion-duration-fast)] btn-press',
                    manualPaymentMode === mode
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-[var(--shadow-sm)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]',
                  ].join(' ')}
                  aria-pressed={manualPaymentMode === mode}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-divider)]">
            <Button variant="primary" fullWidth onClick={handleManualSubmit}>
              Save Transaction
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !['confirm', 'manual'].includes(pageState) && (
        <div
          role="alert"
          className="p-4 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-[var(--color-danger)]/35 text-[var(--text-sm)] text-[var(--color-danger)]"
        >
          {error}
        </div>
      )}
    </div>
  );
}
