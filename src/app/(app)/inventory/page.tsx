// ============================================================================
// Inventory Page — Stock management with CRUD
// Source: USER_FLOWS.md Flow 5, IMPLEMENTATION_PLAN Phase 1
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Package, AlertTriangle, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  low_stock: boolean;
  last_updated: string;
}

type ViewMode = 'all' | 'low_stock';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('pc');
  const [newReorder, setNewReorder] = useState('5');

  // Edit state
  const [editQty, setEditQty] = useState('');
  const [editReorder, setEditReorder] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: '100' });
      if (search) params.set('search', search);
      if (viewMode === 'low_stock') params.set('low_stock', 'true');

      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, viewMode]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: newName,
          quantity: Number(newQty) || 0,
          unit: newUnit || 'pc',
          reorder_level: Number(newReorder) || 5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setNewName(''); setNewQty(''); setNewUnit('pc'); setNewReorder('5');
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: Number(editQty),
          reorder_level: Number(editReorder),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const lowStockCount = items.filter((i) => i.low_stock).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Inventory</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">Manage your shop stock and reorder levels</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
              {lowStockCount} low stock
            </Badge>
          )}
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddForm(true)}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <Card padding="lg" className="animate-card-enter space-y-6 border-[var(--color-border)] shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-divider)]">
            <h2 className="text-[var(--text-body)] font-bold text-[var(--color-text-primary)]">Add New Item</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} icon={<X className="w-4 h-4" />} aria-label="Close" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Item Name *" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Basmati Rice" required />
            <Input label="Unit" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="kg, pc, packet…" />
            <Input label="Current Stock" type="number" value={newQty} onChange={(e) => setNewQty(e.target.value)} placeholder="0" />
            <Input label="Reorder Level" type="number" value={newReorder} onChange={(e) => setNewReorder(e.target.value)} placeholder="5" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>Add Item</Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            rightIcon={search ? (
              <button onClick={() => setSearch('')} className="cursor-pointer p-1 rounded-full hover:bg-[var(--color-divider)]">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            ) : undefined}
          />
        </div>
        <div className="flex gap-1.5 bg-[var(--color-surface)] p-1 border border-[var(--color-border)] rounded-[var(--radius-md)] self-start">
          <Button variant={viewMode === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('all')} className="!h-8">
            All Items
          </Button>
          <Button variant={viewMode === 'low_stock' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('low_stock')} className="!h-8">
            Low Stock
          </Button>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <Card padding="lg" className="text-center py-20 space-y-4 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-primary-muted)] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-[var(--color-text-primary)]">No inventory items yet</p>
              <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] leading-relaxed max-w-sm mx-auto">
                Add your shop items to track stock levels and get low-stock alerts.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddForm(true)}>
                Add First Item
              </Button>
            </div>
          </Card>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={[
                'flex items-center justify-between py-4 px-5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border transition-all',
                item.low_stock
                  ? 'border-[var(--color-warning)]/40 shadow-[var(--shadow-sm)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/20',
              ].join(' ')}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={[
                  'w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0',
                  item.low_stock
                    ? 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30'
                    : 'bg-[var(--color-primary-muted)]',
                ].join(' ')}>
                  {item.low_stock
                    ? <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
                    : <Package className="w-5 h-5 text-[var(--color-primary)]" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--color-text-primary)] truncate text-[var(--text-sm)]">
                    {item.item_name}
                  </p>
                  <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-0.5">
                    Reorder at: {item.reorder_level} {item.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-16 h-8 text-center text-sm border border-[var(--color-border)] rounded-[var(--radius-sm)] bg-[var(--color-bg)]"
                    />
                    <button onClick={() => handleUpdate(item.id)} className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-950/20 cursor-pointer">
                      <Check className="w-4 h-4 text-[var(--color-success)]" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-full hover:bg-[var(--color-divider)] cursor-pointer">
                      <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <span className={[
                        'font-bold text-[var(--text-body)]',
                        item.low_stock ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-primary)]',
                      ].join(' ')}>
                        {item.quantity}
                      </span>
                      <span className="text-[var(--text-caption)] text-[var(--color-text-muted)] ml-1">{item.unit}</span>
                    </div>
                    {item.low_stock && <Badge variant="warning">Low</Badge>}
                    <button
                      onClick={() => { setEditingId(item.id); setEditQty(String(item.quantity)); setEditReorder(String(item.reorder_level)); }}
                      className="p-1.5 rounded-full hover:bg-[var(--color-divider)] cursor-pointer"
                      aria-label={`Edit ${item.item_name}`}
                    >
                      <Pencil className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      aria-label={`Delete ${item.item_name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
