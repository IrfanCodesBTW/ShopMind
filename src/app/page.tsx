// ============================================================================
// Landing Page — v2 Premium Asymmetric Landing Page (Aligned Layout Grid)
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
    <div className="min-h-dvh flex flex-col text-slate-200 relative overflow-hidden select-none bg-[#020617]">
      {/* Premium Visual Background Blurred Blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Floating Header aligned to the grid width */}
      <header
        className="fixed left-0 right-0 z-navigation px-4 sm:px-6 md:px-8"
        style={{
          top: 'calc(1.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="w-full bg-slate-950/45 backdrop-blur-2xl border border-white/10 rounded-full py-3.5 px-6 md:px-8 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
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
        </div>
      </header>

      {/* Main Hero & Content Flow */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-36 md:pt-44 pb-16 space-y-24 md:space-y-32">
        {/* 12-Column Hero Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left copy: spans 7 columns */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice-First Kirana Bookkeeping</span>
            </div>

            <h1 className="text-[var(--text-h2)] font-black text-white tracking-tight leading-[1.1] md:max-w-xl">
              Your shop’s ledger, <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">powered by your voice.</span>
            </h1>

            <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium md:max-w-lg">
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

          {/* Right Preview Card: spans 5 columns */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <Card padding="lg" className="w-full max-w-md shadow-[0_30px_80px_rgba(0,0,0,0.4)] border-white/10 animate-card-enter">
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
                        <span className="text-emerald-400 uppercase font-bold text-[10px]">Sale / Credit</span>
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

        {/* Feature Cards Grid Section */}
        <section id="features" className="space-y-8 scroll-mt-28">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Built for Kirana</h2>
            <p className="text-xl md:text-2xl font-black text-white tracking-tight">Smart Features, Zero Friction</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 bg-slate-950/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} ShopMind Inc. All rights reserved.</p>
          <p className="font-semibold text-slate-600">Designed for Kirana Retailers.</p>
        </div>
      </footer>
    </div>
  );
}
