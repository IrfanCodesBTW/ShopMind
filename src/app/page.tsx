// ============================================================================
// Landing Page — v2 Premium Asymmetric Landing Page
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mic, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col text-slate-200 relative overflow-hidden select-none">
      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 z-[400] flex justify-center">
        <div className="w-full max-w-5xl bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-full py-3 px-6 md:px-8 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center border border-blue-400/20 shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-tight uppercase">ShopMind</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors px-3 py-1">
              Sign In
            </Link>
            <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center max-w-6xl mx-auto px-6 pt-32 pb-16 w-full gap-12 md:gap-16">
        {/* Left copy: Asymmetric alignment */}
        <div className="flex-1 space-y-6 text-left max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice-First Kirana Bookkeeping</span>
          </div>

          <h1 className="text-[var(--text-h2)] font-black text-white tracking-tight leading-[1.1]">
            Your shop’s ledger, <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">powered by your voice.</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
            No keyboards. No cramped screens. Just speak in Hindi, Telugu, or English to record sales, track inventory stock, and manage customer credit instantly.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
              <Link href="/login">Start Bookkeeping</Link>
            </Button>
            <Button variant="secondary" size="lg">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>

        {/* Right Preview Card: Spatial Glass card with depth */}
        <div className="flex-1 w-full max-w-md md:max-w-none">
          <Card padding="lg" className="w-full relative shadow-[0_30px_80px_rgba(0,0,0,0.4)] border-white/10 animate-card-enter">
            {/* Visual Glass highlights */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full filter blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Simulation</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>

              {/* Simulation Feed */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">You Say:</p>
                  <p className="p-3 bg-white/5 border border-white/5 rounded-[12px] text-xs font-mono text-slate-200">
                    &ldquo;Sharma ji ko do kilo aatta becha pachas rupaye me&rdquo;
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">AI Extraction:</p>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-[18px] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Intent:</span>
                      <span className="text-emerald-400 uppercase font-bold">Sale / Credit</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Customer:</span>
                      <span className="text-white">Sharma ji</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Items:</span>
                      <span className="text-white">Aatta (2 kg)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-blue-400 font-extrabold text-sm">₹50.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Feature Strip */}
      <section id="features" className="py-20 border-t border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card padding="md" className="space-y-4 border-white/5 hover:border-blue-500/20 hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Multilingual Speech STT</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Speech-to-Text automatically transcribes dialects. Support for Hindi, Telugu, and English.
            </p>
          </Card>

          <Card padding="md" className="space-y-4 border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Automated Khata Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Recognized credit intents auto-link to customer ledger accounts, updating balance sheets without key entries.
            </p>
          </Card>

          <Card padding="md" className="space-y-4 border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.06] transition-all">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Production Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Full defense against SQL & prompt injection scripts. Rate limit fallbacks safeguard merchant workloads.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-600 border-t border-white/5 max-w-6xl mx-auto w-full">
        <p>&copy; {new Date().getFullYear()} ShopMind Inc. All rights reserved. Designed for Kirana Retailers.</p>
      </footer>
    </div>
  );
}
