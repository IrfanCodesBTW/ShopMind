// ============================================================================
// GET /api/dashboard/summary — Dashboard aggregation
// Source: API_SPEC.md §GET /dashboard/summary
// ============================================================================

import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { successResponse, Errors } from '@/lib/api/response';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardPeriod } from '@/types';

function getDateRange(period: DashboardPeriod): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  let from: Date;

  switch (period) {
    case 'today':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      from = new Date(now);
      from.setDate(from.getDate() - 7);
      break;
    case 'month':
      from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      break;
    case 'year':
      from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return { from: from.toISOString(), to };
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (auth.error) return auth.error;

  try {
    const period = (new URL(request.url).searchParams.get('period') || 'today') as DashboardPeriod;
    const { from, to } = getDateRange(period);

    const supabase = await createServerSupabaseClient();

    // Fetch confirmed transactions in the period
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('intent, item, quantity, amount')
      .eq('status', 'confirmed')
      .gte('created_at', from)
      .lte('created_at', to);

    if (error) {
      console.error('Dashboard summary error:', error);
      return Errors.internal('Failed to fetch dashboard data');
    }

    const txs = transactions || [];

    // Aggregate
    let totalSales = 0;
    let totalPurchases = 0;
    let totalCreditGiven = 0;
    let totalCreditReceived = 0;
    const itemRevenue: Record<string, { quantity: number; revenue: number }> = {};

    for (const tx of txs) {
      const amount = Number(tx.amount) || 0;

      switch (tx.intent) {
        case 'sale':
          totalSales += amount;
          if (tx.item) {
            if (!itemRevenue[tx.item]) itemRevenue[tx.item] = { quantity: 0, revenue: 0 };
            itemRevenue[tx.item].quantity += Number(tx.quantity) || 1;
            itemRevenue[tx.item].revenue += amount;
          }
          break;
        case 'expense':
        case 'stock_update':
          totalPurchases += amount;
          break;
        case 'credit_given':
          totalCreditGiven += amount;
          break;
        case 'credit_received':
          totalCreditReceived += amount;
          break;
      }
    }

    // Top items by revenue
    const topItems = Object.entries(itemRevenue)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([item, data]) => ({
        item,
        quantity_sold: data.quantity,
        revenue: data.revenue,
      }));

    // Get outstanding credit total
    const { data: creditData } = await supabase
      .from('customers')
      .select('total_credit');

    const outstandingCredit = (creditData || []).reduce(
      (sum, c) => sum + (Number(c.total_credit) || 0),
      0
    );

    // Get low stock count
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('quantity, reorder_level');

    const lowStock = (inventoryData || []).filter(
      (i) => Number(i.quantity) <= Number(i.reorder_level)
    ).length;

    return successResponse({
      period,
      total_sales: totalSales,
      total_purchases: totalPurchases,
      total_credit_given: totalCreditGiven,
      total_credit_received: totalCreditReceived,
      net_revenue: totalSales - totalPurchases,
      transaction_count: txs.length,
      top_items: topItems,
      outstanding_credit: outstandingCredit,
      low_stock_count: lowStock,
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    return Errors.internal('An unexpected error occurred');
  }
}
