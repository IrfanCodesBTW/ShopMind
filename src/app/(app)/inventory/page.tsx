// ============================================================================
// Inventory Page — v2 Premium Glass Stock Management
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Package, AlertTriangle, Pencil, Trash2, X, Check, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newUnit, setNewUnit] = useState('pc');
  const [newReorder, setNewReorder] = useState('5');
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editQty, setEditQty] = useState('');
  const [editReorder, setEditReorder] = useState('');

  const { t } = useTranslation();
  const { toast } = useToast();

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
      toast('Failed to load inventory items', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, viewMode, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
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
        setShowAddModal(false);
        setNewName(''); setNewQty(''); setNewUnit('pc'); setNewReorder('5');
        toast('Inventory item added successfully', 'success');
        fetchItems();
      } else {
        toast(data.error?.message || 'Failed to add item', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Error saving inventory item', 'error');
    } finally {
      setSubmitting(false);
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
        toast('Inventory item updated', 'success');
        fetchItems();
      }
    } catch (e) {
      console.error(e);
      toast('Failed to update inventory', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast('Item deleted from inventory', 'success');
        fetchItems();
      }
    } catch (e) {
      console.error(e);
      toast('Failed to delete item', 'error');
    }
  };

  const lowStockCount = items.filter((i) => i.low_stock).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
            {t('inventory.title', 'Inventory')}
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {t('inventory.subtitle', 'Manage your shop stock and reorder levels')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <Badge variant="warning" icon={<AlertTriangle className="w-4 h-4" />}>
              {lowStockCount} low stock
            </Badge>
          )}
          <button
            onClick={fetchItems}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            {t('inventory.add_item', 'Add Item')}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <Input
            placeholder={t('inventory.search_placeholder', 'Search items…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            rightIcon={search ? (
              <button onClick={() => setSearch('')} className="cursor-pointer p-1 rounded-full hover:bg-white/5">
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            ) : undefined}
          />
        </div>
        <div className="flex gap-1.5 bg-white/5 p-1 border border-white/10 rounded-full self-start">
          <Button variant={viewMode === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('all')} className="!h-8">
            {t('inventory.all_items', 'All Items')}
          </Button>
          <Button variant={viewMode === 'low_stock' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('low_stock')} className="!h-8">
            {t('inventory.low_stock', 'Low Stock')}
          </Button>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <Card padding="lg" className="text-center py-20 space-y-4 border-white/5 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">{t('inventory.no_items', 'No inventory items yet')}</p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {t('inventory.no_items_desc', 'Add your shop items to track stock levels and get low-stock alerts.')}
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                Add First Item
              </Button>
            </div>
          </Card>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={[
                'flex items-center justify-between py-4.5 px-6 rounded-[var(--radius-md)] bg-white/5 border transition-all duration-300',
                item.low_stock
                  ? 'border-red-500/30 bg-red-500/[0.02]'
                  : 'border-white/5 hover:border-white/10',
              ].join(' ')}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={[
                  'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border',
                  item.low_stock
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-white/5 border-white/5 text-slate-400',
                ].join(' ')}>
                  {item.low_stock ? <AlertTriangle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{item.item_name}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1 tracking-wider uppercase">
                    Reorder level: {item.reorder_level} {item.unit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-16 h-8 text-center text-xs border border-white/10 rounded-full bg-slate-950 text-white focus:outline-none focus:border-blue-500/50"
                    />
                    <button onClick={() => handleUpdate(item.id)} className="p-1.5 rounded-full hover:bg-white/5 cursor-pointer">
                      <Check className="w-4 h-4 text-green-400" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-full hover:bg-white/5 cursor-pointer">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <span className={[
                        'font-black text-sm',
                        item.low_stock ? 'text-red-400 animate-pulse' : 'text-white',
                      ].join(' ')}>
                        {item.quantity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 ml-1 uppercase">{item.unit}</span>
                    </div>
                    {item.low_stock && <Badge variant="danger">Critical</Badge>}
                    <button
                      onClick={() => { setEditingId(item.id); setEditQty(String(item.quantity)); setEditReorder(String(item.reorder_level)); }}
                      className="p-1.5 rounded-full hover:bg-white/5 cursor-pointer text-slate-500 hover:text-white"
                      aria-label={`Edit ${item.item_name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-full hover:bg-red-500/10 cursor-pointer text-slate-500 hover:text-red-400"
                      aria-label={`Delete ${item.item_name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item">
        <form onSubmit={handleAdd} className="space-y-6">
          <Input
            label="Item Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Basmati Rice"
            required
          />
          <Input
            label="Stock Unit"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            placeholder="kg, pc, packet, bag…"
          />
          <Input
            label="Initial Stock Quantity"
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Reorder Alert Level"
            type="number"
            value={newReorder}
            onChange={(e) => setNewReorder(e.target.value)}
            placeholder="5"
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" fullWidth loading={submitting} icon={<Plus className="w-4 h-4" />}>
              Save Item
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
