// ============================================================================
// Login Page — Restyled with design system
// Source: new_Design_plan.md Task 7, Design.md §Brand
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mic } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === 'signup') {
        if (!email || !password || !name || !shopName) {
          setError('All fields are required.');
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) { setError(signUpError.message); return; }
        if (data.user) {
          await supabase.from('merchants').insert({
            id: data.user.id, name, shop_name: shopName,
            phone: email, language_preference: 'en',
          });
        }
        router.push('/dashboard');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { setError(signInError.message); return; }
        router.push('/dashboard');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-6 py-16">
      <div className="w-full max-w-md space-y-10">
        {/* Brand mark */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-primary)] shadow-[var(--shadow-lg)] mx-auto">
            <Mic className="w-8 h-8 text-white" aria-hidden />
          </div>
          <div className="space-y-1">
            <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">ShopMind</h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)]">
              Voice-first business assistant
            </p>
          </div>
        </div>

        {/* Form card */}
        <Card padding="lg" className="border-[var(--color-border)] shadow-[var(--shadow-lg)]">
          <h2 className="text-[var(--text-h6)] font-semibold text-[var(--color-text-primary)] mb-8">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {/* Form spacing updated to space-y-6 (24px) for perfect rhythm */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {mode === 'signup' && (
              <>
                <Input
                  label="Your Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
                <Input
                  label="Shop Name"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Enter your shop name"
                  required
                />
              </>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Enter your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />

            {error && (
              <div role="alert" className="p-4 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-900/20 border border-[var(--color-danger)]/30 text-[var(--text-sm)] text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </Card>

        {/* Toggle */}
        <p className="text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            className="text-[var(--color-primary)] font-semibold hover:underline cursor-pointer transition-colors"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
