// ============================================================================
// FeedbackWidget — Simple feedback form widget
// Source: ROADMAP Phase 3
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
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[300]">
      {/* Floating Action Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-12 h-12 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-[var(--shadow-lg)] flex items-center justify-center cursor-pointer transition-transform btn-press"
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Widget Card */}
      {open && (
        <Card padding="md" className="w-80 border-[var(--color-border)] shadow-[var(--shadow-xl)] animate-card-enter space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-divider)]">
            <h3 className="font-bold text-[var(--text-sm)] text-[var(--color-text-primary)]">Send Feedback</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-[var(--color-divider)] cursor-pointer">
              <X className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <p className="font-semibold text-[var(--color-success)] text-[var(--text-sm)]">Thank you!</p>
              <p className="text-xs text-[var(--color-text-muted)]">Your feedback helps improve ShopMind.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">How is your experience?</label>
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
                            ? 'fill-[var(--color-warning)] text-[var(--color-warning)]'
                            : 'text-[var(--color-text-muted)]',
                        ].join(' ')}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="feedback-msg" className="text-xs font-semibold text-[var(--color-text-secondary)]">Message</label>
                <textarea
                  id="feedback-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think…"
                  rows={3}
                  className="w-full p-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sm)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
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
