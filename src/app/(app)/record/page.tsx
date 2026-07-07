// ============================================================================
// Record Page — v2 Premium Voice Transaction Recorder & Confirm
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Square, Sparkles, Check, RotateCcw, Keyboard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import type { ParsedTransaction, Intent, PaymentMode, DueStatus } from '@/types';

type FlowState = 'idle' | 'recording' | 'processing' | 'review' | 'success';

export default function RecordPage() {
  const [state, setState] = useState<FlowState>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsed, setParsed] = useState<Partial<ParsedTransaction> | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Edit variables
  const [editIntent, setEditIntent] = useState<Intent>('sale');
  const [editItem, setEditItem] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCust, setEditCust] = useState('');
  const [editPayMode, setEditPayMode] = useState<PaymentMode>('cash');
  const [editDueStatus, setEditDueStatus] = useState<DueStatus>('paid');

  // Audio recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setState('recording');
    } catch (err) {
      console.error(err);
      toast('Could not access microphone', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream to release mic access
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    setState('processing');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const res = await fetch('/api/transactions/voice', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const tx = data.data;
        setTxId(tx.id);
        setTranscript(tx.raw_transcript);
        
        // Map parsed transaction fields
        setParsed({
          intent: tx.intent,
          item: tx.item || undefined,
          quantity: tx.quantity || undefined,
          unit: tx.unit || undefined,
          amount: tx.amount || undefined,
          customer: tx.customer_name || undefined,
          payment_mode: tx.payment_mode || undefined,
          due_status: tx.due_status || undefined,
          confidence: tx.confidence_score,
          provider_used: tx.provider_used,
        });

        // Initialize editor state
        setEditIntent(tx.intent);
        setEditItem(tx.item || '');
        setEditQty(tx.quantity ? String(tx.quantity) : '');
        setEditUnit(tx.unit || '');
        setEditAmount(tx.amount ? String(tx.amount) : '');
        setEditCust(tx.customer_name || '');
        setEditPayMode(tx.payment_mode || 'cash');
        setEditDueStatus(tx.due_status || 'paid');

        setState('review');
      } else {
        toast(data.error?.message || 'Voice extraction failed', 'error');
        setState('idle');
      }
    } catch (e) {
      console.error(e);
      toast('Network error processing audio', 'error');
      setState('idle');
    }
  };

  const handleConfirm = async () => {
    if (!txId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: txId,
          intent: editIntent,
          item: editItem || null,
          quantity: editQty ? Number(editQty) : null,
          unit: editUnit || null,
          amount: Number(editAmount) || 0,
          customer_name: editCust || null,
          payment_mode: editPayMode,
          due_status: editDueStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setState('success');
        toast('Transaction confirmed successfully', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast(data.error?.message || 'Confirmation failed', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Error confirming transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: editIntent,
          item: editItem || null,
          quantity: editQty ? Number(editQty) : null,
          unit: editUnit || null,
          amount: Number(editAmount) || 0,
          customer_name: editCust || null,
          payment_mode: editPayMode,
          due_status: editDueStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast('Transaction saved successfully', 'success');
        router.push('/dashboard');
      } else {
        toast(data.error?.message || 'Saving transaction failed', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Error saving transaction', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
          {t('record.title', 'Record Transaction')}
        </h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {t('record.speak_or_manual', 'Speak your transaction or type manually')}
        </p>
      </div>

      {state === 'idle' && !isManual && (
        <Card padding="lg" className="border-white/5 flex flex-col items-center justify-center py-20 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />

          {/* Micro Animation indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Voice</span>
          </div>

          {/* Record Button */}
          <button
            onClick={startRecording}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-400/20 flex items-center justify-center text-white shadow-[0_12px_40px_rgba(59,130,246,0.4)] cursor-pointer transition-transform btn-press relative"
            aria-label="Start audio recording"
          >
            <Mic className="w-10 h-10" />
          </button>

          <div className="space-y-1 text-center">
            <p className="text-sm font-bold text-white">{t('record.tap_to_speak', 'Tap to Speak')}</p>
            <p className="text-xs text-slate-500 font-medium">Record sales, expenses, and credit logs</p>
          </div>

          <div className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 pt-4 border-t border-white/5">
            <button onClick={() => setIsManual(true)} className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              {t('record.enter_manually', 'Enter Manually')}
            </button>
          </div>
        </Card>
      )}

      {state === 'recording' && (
        <Card padding="lg" className="border-white/5 flex flex-col items-center justify-center py-20 space-y-8 shadow-2xl">
          {/* Animated Red Pulse ring */}
          <button
            onClick={stopRecording}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-red-600 to-red-500 border border-red-400/20 flex items-center justify-center text-white shadow-[0_12px_40px_rgba(239,68,68,0.4)] cursor-pointer animate-recording-pulse relative z-10"
            aria-label="Stop audio recording"
          >
            <Square className="w-8 h-8 fill-current" />
          </button>

          <div className="space-y-1 text-center">
            <p className="text-sm font-bold text-red-400 animate-pulse uppercase tracking-wider">{t('record.recording', 'Recording')}</p>
            <p className="text-xs text-slate-500 font-medium">Click to stop and begin voice extraction</p>
          </div>
        </Card>
      )}

      {state === 'processing' && (
        <Card padding="lg" className="border-white/5 flex flex-col items-center justify-center py-20 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white leading-none">{t('record.processing', 'Processing Audio')}</p>
            <p className="text-xs text-slate-500 font-medium">AI is extracting transaction details…</p>
          </div>
        </Card>
      )}

      {(state === 'review' || isManual) && (
        <div className="space-y-6">
          {/* Transcript bubble */}
          {state === 'review' && (
            <Card padding="md" className="border-white/5 space-y-3 relative">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider block uppercase">Raw Audio Transcript</span>
              <p className="text-sm font-mono text-slate-200 leading-relaxed italic bg-white/5 p-4 rounded-[12px] border border-white/5">
                &ldquo;{transcript}&rdquo;
              </p>
              {parsed && (
                <div className="flex items-center gap-2">
                  <Badge variant={parsed.confidence! > 0.8 ? 'success' : 'warning'}>
                    Confidence: {Math.round(parsed.confidence! * 100)}%
                  </Badge>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">via {parsed.provider_used}</span>
                </div>
              )}
            </Card>
          )}

          {/* Edit Form */}
          <Card padding="lg" className="border-white/5 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase">
                {isManual ? 'Manual Entry' : 'Verify extracted details'}
              </h2>
              <button
                onClick={() => { setState('idle'); setIsManual(false); setParsed(null); }}
                className="p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Intent */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Transaction Type</label>
                <select
                  value={editIntent}
                  onChange={(e) => setEditIntent(e.target.value as Intent)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500/50 rounded-[18px] h-12 px-4 transition-all duration-300 text-white font-semibold text-sm focus:outline-none"
                >
                  <option value="sale">Sale (Income)</option>
                  <option value="expense">Expense (Outflow)</option>
                  <option value="credit_given">Credit Given (Udhar)</option>
                  <option value="credit_received">Credit Paid (Repayment)</option>
                </select>
              </div>

              {/* Amount */}
              <Input
                label="Amount (₹) *"
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="0.00"
                required
              />

              {/* Item details */}
              {editIntent !== 'credit_given' && editIntent !== 'credit_received' && (
                <>
                  <Input
                    label="Item Name"
                    value={editItem}
                    onChange={(e) => setEditItem(e.target.value)}
                    placeholder="Rice, sugar, electric bill…"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      placeholder="0"
                    />
                    <Input
                      label="Unit"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      placeholder="kg, packet…"
                    />
                  </div>
                </>
              )}

              {/* Customer */}
              <Input
                label="Customer Name"
                value={editCust}
                onChange={(e) => setEditCust(e.target.value)}
                placeholder="Name (Optional for cash)"
              />

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Payment Mode</label>
                <select
                  value={editPayMode}
                  onChange={(e) => setEditPayMode(e.target.value as PaymentMode)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500/50 rounded-[18px] h-12 px-4 transition-all duration-300 text-white font-semibold text-sm focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Online</option>
                  <option value="credit">Credit / Udhar</option>
                  <option value="card">Card</option>
                </select>
              </div>

              {/* Due Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Due Status</label>
                <select
                  value={editDueStatus}
                  onChange={(e) => setEditDueStatus(e.target.value as DueStatus)}
                  className="w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500/50 rounded-[18px] h-12 px-4 transition-all duration-300 text-white font-semibold text-sm focus:outline-none"
                >
                  <option value="paid">Paid</option>
                  <option value="due">Due</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                fullWidth
                loading={submitting}
                onClick={isManual ? handleManualSave : handleConfirm}
                icon={<Check className="w-5 h-5" />}
              >
                {isManual ? 'Save Transaction' : 'Confirm Transaction'}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => { setState('idle'); setIsManual(false); setParsed(null); }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {state === 'success' && (
        <Card padding="lg" className="border-white/5 flex flex-col items-center justify-center py-20 space-y-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Check className="w-7 h-7 text-green-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-green-400 leading-none uppercase tracking-wider">{t('record.success', 'Transaction Confirmed')}</p>
            <p className="text-xs text-slate-500 font-medium">{t('record.returning', 'Returning to dashboard…')}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
