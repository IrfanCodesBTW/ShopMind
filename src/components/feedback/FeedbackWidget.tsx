// ============================================================================
// FeedbackWidget — Simple feedback form widget (v2 Premium Glass)
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useState } from 'react';
import { MessageSquare, Star, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, message, category: 'in-app' }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
          setRating(0);
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed z-navigation bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-[calc(1.5rem+env(safe-area-inset-right,0px))]">
      {/* Floating Action Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center justify-center cursor-pointer transition-transform btn-press border border-blue-400/20"
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Widget Card */}
      {open && (
        <Card padding="md" className="w-80 border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="font-extrabold text-sm text-white tracking-tight">Send Feedback</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-white/5 cursor-pointer">
              <X className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <p className="font-bold text-green-400 text-sm">Thank you!</p>
              <p className="text-xs text-slate-400">Your feedback helps improve ShopMind.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">How is your experience?</label>
                <div className="flex gap-1.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={[
                          'w-6 h-6',
                          rating >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-500',
                        ].join(' ')}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="feedback-msg" className="text-xs font-bold text-slate-400 uppercase tracking-wide">Message</label>
                <textarea
                  id="feedback-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think…"
                  rows={3}
                  className="w-full p-3 text-sm bg-white/5 border border-white/10 focus:border-blue-500/40 rounded-[12px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 text-white placeholder-slate-500 font-medium"
                />
              </div>

              <Button type="submit" variant="primary" fullWidth loading={submitting} disabled={!rating}>
                Submit Feedback
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
