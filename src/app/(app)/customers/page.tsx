// ============================================================================
// Customers Page — v2 Premium Glass Khata Ledger
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Users, ArrowUpRight, ArrowDownRight, Phone, RefreshCw, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add customer form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { t } = useTranslation();
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (e) {
      console.error(e);
      toast('Failed to load customer list', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setName('');
        setPhone('');
        toast('Customer account created successfully', 'success');
        fetchCustomers();
      } else {
        toast(data.error?.message || 'Failed to create customer', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Error creating customer account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute overall khata totals
  const totalOwedByCust = customers.reduce((sum, c) => {
    const bal = c.total_credit - c.total_paid;
    return bal > 0 ? sum + bal : sum;
  }, 0);

  const totalOwedToCust = customers.reduce((sum, c) => {
    const bal = c.total_credit - c.total_paid;
    return bal < 0 ? sum + Math.abs(bal) : sum;
  }, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
            {t('customers.title', 'Khata Ledger')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t('customers.subtitle', 'Track customer credit and outstanding payments')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            {t('customers.add_customer', 'Add Customer')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card padding="md" className="space-y-3 border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('customers.customers_owe_you', 'Customers Owe You')}
            </span>
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[var(--text-h4)] font-black text-yellow-400 leading-none tracking-tight">
            ₹{totalOwedByCust.toLocaleString('en-IN')}
          </p>
        </Card>

        <Card padding="md" className="space-y-3 border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('customers.you_owe_customers', 'You Owe Customers')}
            </span>
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[var(--text-h4)] font-black text-green-400 leading-none tracking-tight">
            ₹{totalOwedToCust.toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Search Filter */}
      <Input
        placeholder={t('customers.search_placeholder', 'Search customer by name or mobile number…')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-5 h-5" />}
        rightIcon={search ? (
          <button onClick={() => setSearch('')} className="cursor-pointer p-1 rounded-full hover:bg-white/5">
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        ) : undefined}
      />

      {/* Ledger Feed */}
      <Card padding="none" className="border-white/5 divide-y divide-white/5 overflow-hidden shadow-2xl">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : customers.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">
                {t('customers.no_customers', 'No customer accounts yet')}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {t('customers.no_customers_desc', 'Add customers to track custom ledgers, Udhar records, and transaction histories.')}
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                {t('customers.create_account', 'Create Customer Account')}
              </Button>
            </div>
          </div>
        ) : (
          customers.map((c) => {
            const balance = c.total_credit - c.total_paid;
            const owesYou = balance > 0;
            const settled = balance === 0;

            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="flex items-center justify-between py-4.5 px-6 transition-colors hover:bg-white/[0.02] cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 font-extrabold text-sm uppercase">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm truncate">{c.name}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5 tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {c.phone || 'No phone number'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <div className="text-right">
                    {settled ? (
                      <Badge variant="success">Settled</Badge>
                    ) : (
                      <span className={[
                        'font-black text-sm',
                        owesYou ? 'text-yellow-400' : 'text-green-400'
                      ].join(' ')}>
                        {owesYou ? 'Owes you: ' : 'You owe: '}₹{Math.abs(balance).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </Card>

      {/* Add Customer Modal */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Customer Account">
        <form onSubmit={handleAdd} className="space-y-6">
          <Input
            label="Customer Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunil Verma"
            required
          />
          <Input
            label="Mobile Number (Optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 99887 76655"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" fullWidth loading={submitting} icon={<Plus className="w-4 h-4" />}>
              Create Account
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
