// ============================================================================
// Customers / Khata Page — Credit ledger list with balances
// Source: new_Design_plan.md Task 8, USER_FLOWS.md Flow 4
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { Search, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/Skeleton';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  outstanding_balance: number;
  last_transaction_date?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/customers');
        const data = await res.json();
        if (data.success) setCustomers(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalOwed   = customers.filter((c) => c.outstanding_balance > 0).reduce((s, c) => s + c.outstanding_balance, 0);
  const totalOwing  = customers.filter((c) => c.outstanding_balance < 0).reduce((s, c) => s + Math.abs(c.outstanding_balance), 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Khata Ledger</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">Track customer credit and outstanding payments</p>
        </div>
        <Button variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      {/* Summary strip — refined to look neutral and premium */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card padding="md" className="flex items-center justify-between border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="space-y-1">
              <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Customers Owe You</span>
              <p className="text-[var(--text-h5)] font-bold text-[var(--color-income)]">₹{totalOwed.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--color-income)]" />
            </div>
          </Card>
          <Card padding="md" className="flex items-center justify-between border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="space-y-1">
              <span className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">You Owe Customers</span>
              <p className="text-[var(--text-h5)] font-bold text-[var(--color-expense)]">₹{totalOwing.toLocaleString('en-IN')}</p>
            </div>
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[var(--color-expense)]" />
            </div>
          </Card>
        </div>
      )}

      {/* Search & List container */}
      <div className="space-y-6">
        <Input
          placeholder="Search customer by name or mobile number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />

        {/* Customer list */}
        <div className="space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <Card padding="lg" className="text-center py-20 space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
                <UserPlus className="w-6 h-6 text-[var(--color-primary)]" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[var(--color-text-primary)]">No customer accounts yet</p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-sm mx-auto">
                  Add customers to track custom ledgers, *Udhar* records, and transaction histories.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
                  Create Customer Account
                </Button>
              </div>
            </Card>
          ) : (
            filtered.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between py-4 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar name={customer.name} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-text-primary)] truncate text-[var(--text-sm)]">{customer.name}</p>
                    {customer.phone && (
                      <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-0.5">{customer.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end ml-4 flex-shrink-0">
                  {customer.outstanding_balance !== 0 ? (
                    <span className={['font-bold text-[var(--text-sm)]', customer.outstanding_balance > 0 ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'].join(' ')}>
                      {customer.outstanding_balance > 0 ? '+' : ''}₹{Math.abs(customer.outstanding_balance).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <Badge variant="success">Settled</Badge>
                  )}
                  {customer.last_transaction_date && (
                    <span className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-1">
                      Last: {new Date(customer.last_transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
