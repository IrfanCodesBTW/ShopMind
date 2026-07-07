// ============================================================================
// Login Page — v2 Premium Glass Login Screen
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, ArrowRight, Lock, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function LoginFormContent() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast('Please enter phone number and password', 'warning');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignUp
        ? { phone, password, name, shop_name: shopName }
        : { phone, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast(isSignUp ? 'Account created successfully!' : 'Signed in successfully!', 'success');
        // Let cookies set and session activate, then redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        toast(data.error?.message || 'Authentication failed', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Visual background blurred blob */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none" />

      <Card padding="lg" className="w-full max-w-md border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)] relative z-10 space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center border border-blue-400/20 shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight">
              {isSignUp ? 'Create your account' : 'Sign in to ShopMind'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {isSignUp ? 'Enter your shop details to get started' : 'Welcome back! Enter your credentials'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Shop Name"
                placeholder="e.g. Ramesh Kirana Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
            </>
          )}

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-500" />}
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} icon={<ArrowRight className="w-4 h-4" />}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ToastProvider>
      <LoginFormContent />
    </ToastProvider>
  );
}
