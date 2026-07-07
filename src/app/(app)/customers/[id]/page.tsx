// ============================================================================
// Customer Details — Customer Khata ledger details & update
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, History, ArrowDownRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Customer, CreditLedgerEntry } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [entries, setEntries] = useState<CreditLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [modalType, setModalType] = useState<'credit' | 'debit'>('credit'); // credit = increase debt, debit = record payment

  // Pay/Record form state
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}/credit`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data.customer);
        setEntries(data.data.entries);
      } else {
        toast('Customer account details not found', 'error');
        router.push('/customers');
      }
    } catch (e) {
      console.error(e);
      toast('Network error loading ledger details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [id]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast('Please enter a valid amount', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${id}/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), type: modalType }),
      });
      const data = await res.json();

      if (data.success) {
        setShowPayModal(false);
        setAmount('');
        toast(modalType === 'credit' ? 'Credit recorded successfully' : 'Payment recorded successfully', 'success');
        fetchDetails();
      } else {
        toast(data.error?.message || 'Transaction recording failed', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Error saving transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !customer) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <SkeletonCard />
        {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  const balance = customer ? customer.total_credit - customer.total_paid : 0;
  const owesYou = balance > 0;
  const settled = balance === 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/customers')}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
            aria-label="Back to customer ledger"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none capitalize">
              {customer?.name}
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">
              {customer?.phone || 'No phone number'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setModalType('debit'); setShowPayModal(true); }}
            icon={<ArrowDownRight className="w-4 h-4 text-green-400" />}
          >
            Record Payment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setModalType('credit'); setShowPayModal(true); }}
            icon={<Plus className="w-4 h-4" />}
          >
            Give Credit
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card padding="md" className="border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credit Given</p>
          <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight mt-2">
            ₹{customer?.total_credit.toLocaleString('en-IN') || '0.00'}
          </p>
        </Card>

        <Card padding="md" className="border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Back</p>
          <p className="text-[var(--text-h4)] font-black text-white leading-none tracking-tight mt-2">
            ₹{customer?.total_paid.toLocaleString('en-IN') || '0.00'}
          </p>
        </Card>

        <Card padding="md" className="border-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Balance</p>
          <p className={[
            'text-[var(--text-h4)] font-black leading-none tracking-tight mt-2',
            settled ? 'text-white' : owesYou ? 'text-yellow-400' : 'text-green-400'
          ].join(' ')}>
            {settled ? '₹0.00' : owesYou ? `Owes: ₹${balance.toLocaleString('en-IN')}` : `Owed: ₹${Math.abs(balance).toLocaleString('en-IN')}`}
          </p>
        </Card>
      </div>

      {/* Ledger History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Ledger Entries
          </h2>
          <button onClick={fetchDetails} className="p-2.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <Card padding="none" className="border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
          {entries.length === 0 ? (
            <div className="text-center py-20 px-6">
              <p className="font-bold text-white text-sm">No credit ledger entries yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Record credit transactions or customer payments to populate this log ledger.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-4.5 px-6 hover:bg-white/[0.02] transition-colors">
                <div>
                  <Badge variant={entry.type === 'credit' ? 'danger' : 'success'}>
                    {entry.type === 'credit' ? 'Udhar Given' : 'Payment Received'}
                  </Badge>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1.5 tracking-wider">
                    Balance after: ₹{entry.balance_after.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="text-right">
                  <span className={[
                    'font-black text-sm',
                    entry.type === 'credit' ? 'text-red-400' : 'text-green-400'
                  ].join(' ')}>
                    {entry.type === 'credit' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1">
                    {new Date(entry.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Record transaction modal */}
      <Dialog isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={modalType === 'credit' ? 'Give Credit (Udhar)' : 'Record Payment Received'}>
        <form onSubmit={handleRecord} className="space-y-6">
          <Input
            label="Amount (₹) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" fullWidth loading={submitting}>
              Save Entry
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
