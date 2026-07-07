// ============================================================================
// useRealtimeTransactions — Supabase Realtime subscription
// Source: ARCHITECTURE.md §Realtime
// ============================================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/types';

interface UseRealtimeTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Subscribes to Supabase Realtime changes on the transactions table.
 * Automatically updates the list when new transactions are confirmed.
 */
export function useRealtimeTransactions(limit: number = 20): UseRealtimeTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTransactions(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();

    // Subscribe to realtime changes
    const supabase = createClient();
    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTx = payload.new as Transaction;
            if (newTx.status === 'confirmed') {
              setTransactions((prev) => [newTx, ...prev].slice(0, limit));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTx = payload.new as Transaction;
            setTransactions((prev) => {
              const index = prev.findIndex((t) => t.id === updatedTx.id);
              if (updatedTx.status === 'confirmed') {
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = updatedTx;
                  return updated;
                }
                return [updatedTx, ...prev].slice(0, limit);
              } else if (updatedTx.status === 'cancelled' && index >= 0) {
                return prev.filter((t) => t.id !== updatedTx.id);
              }
              return prev;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              setTransactions((prev) => prev.filter((t) => t.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions, limit]);

  return { transactions, loading, error, refresh: fetchTransactions };
}
