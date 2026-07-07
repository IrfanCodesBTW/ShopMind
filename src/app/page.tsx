// ============================================================================
// Marketing Landing Page — Public route for unauthenticated users
// Source: new_Design_plan.md Task 9, Design.md
// Fraunces serif used ONLY here, never in authenticated app
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Mic, BarChart3, CreditCard, Package, Zap,
  Check, ArrowRight, Globe, Shield, Star,
} from 'lucide-react';

// ── Sticky Nav ───────────────────────────────────────────────────────────────

function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-[200] transition-all duration-[var(--motion-duration-normal)]',
        scrolled
          ? 'bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] shadow-[var(--shadow-sm)]'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" aria-hidden />
          </div>
          <span className="font-bold text-[var(--text-body)] text-[var(--color-text-primary)] tracking-tight">ShopMind</span>
        </div>

        <nav className="hidden sm:flex items-center gap-8 text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
          <a href="#features" className="hover:text-[var(--color-text-primary)] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[var(--color-text-primary)] transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-[var(--color-text-primary)] transition-colors">Reviews</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[var(--text-sm)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="h-10 px-5 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white text-[var(--text-sm)] font-semibold flex items-center gap-1.5 hover:bg-[var(--color-primary-hover)] transition-all duration-[var(--motion-duration-fast)] cursor-pointer btn-press shadow-[var(--shadow-sm)]"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-lg)] transition-all duration-[var(--motion-duration-normal)] animate-card-enter group cursor-pointer">
      <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-primary-muted)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-primary)] transition-colors duration-[var(--motion-duration-normal)]">
        <span className="text-[var(--color-primary)] group-hover:text-white transition-colors duration-[var(--motion-duration-normal)] w-6 h-6 flex items-center justify-center">
          {icon}
        </span>
      </div>
      <h3 className="text-[var(--text-body)] font-semibold text-[var(--color-text-primary)] mb-3">{title}</h3>
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-[var(--leading-normal)] max-char-width">{description}</p>
    </div>
  );
}

// ── Step ─────────────────────────────────────────────────────────────────────

function Step({ num, title, description }: { num: number; title: string; description: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-10 h-10 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white font-bold text-[var(--text-body)] flex items-center justify-center flex-shrink-0">
        {num}
      </div>
      <div className="space-y-1">
        <h3 className="text-[var(--text-body)] font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-[var(--leading-normal)] max-char-width">{description}</p>
      </div>
    </div>
  );
}

// ── Testimonial ───────────────────────────────────────────────────────────────

function Testimonial({ name, shop, quote }: { name: string; shop: string; quote: string }) {
  return (
    <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-[var(--color-warning)] text-[var(--color-warning)]" />
          ))}
        </div>
        <blockquote className="text-[var(--color-text-secondary)] text-[var(--text-sm)] leading-[var(--leading-normal)] italic">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <div>
        <p className="font-semibold text-[var(--color-text-primary)] text-[var(--text-sm)]">{name}</p>
        <p className="text-[var(--text-caption)] text-[var(--color-text-muted)] mt-0.5">{shop}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text-primary)] min-h-screen">
      <Nav scrolled={scrolled} />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-32 px-6 text-center max-w-4xl mx-auto space-y-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] text-[var(--text-caption)] font-semibold uppercase tracking-wider mx-auto">
          <Zap className="w-3.5 h-3.5" />
          Free · Multilingual · Voice-First
        </div>

        {/* Headline — Fraunces serif ONLY on marketing pages */}
        <h1
          style={{ fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 'var(--leading-tight)' }}
          className="text-[clamp(2.5rem,7vw,4.5rem)] font-bold text-[var(--color-text-primary)] tracking-tight max-w-3xl mx-auto"
        >
          Run your shop
          <br />
          <span className="text-[var(--color-primary)]">with your voice.</span>
        </h1>

        <p className="text-[var(--text-body-lg)] text-[var(--color-text-secondary)] max-w-xl mx-auto leading-[var(--leading-normal)] max-char-width">
          ShopMind listens to you in Hindi, Telugu, or English and instantly records sales, tracks credit, and manages inventory — all in one tap.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="h-14 px-8 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white font-semibold flex items-center gap-2 hover:bg-[var(--color-primary-hover)] transition-all duration-[var(--motion-duration-fast)] btn-press shadow-[var(--shadow-lg)] text-[var(--text-body)]"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="h-14 px-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] font-semibold flex items-center gap-2 hover:border-[var(--color-primary)]/40 transition-all duration-[var(--motion-duration-fast)] text-[var(--text-body)]"
          >
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] pt-2">
          Trusted by 500+ shop owners across India — completely free
        </p>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-32 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight"
          >
            Everything your shop needs
          </h2>
          <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] max-w-lg mx-auto leading-[var(--leading-normal)]">
            Built specifically for Indian kirana shops, roadside vendors, and small businesses.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Mic className="w-6 h-6" />}
            title="Speak to record"
            description="Say '3 kg atta 120 rupees' in Hindi or Telugu. ShopMind understands and records it instantly."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Live dashboard"
            description="Today's sales, expenses, and net revenue at a glance. No spreadsheets, no manual entries."
          />
          <FeatureCard
            icon={<CreditCard className="w-6 h-6" />}
            title="Khata / Credit tracking"
            description="Track who owes you money and who you owe. Send reminders with one tap."
          />
          <FeatureCard
            icon={<Package className="w-6 h-6" />}
            title="Inventory management"
            description="Know when stock is running low. Voice-record stock additions directly."
          />
          <FeatureCard
            icon={<Globe className="w-6 h-6" />}
            title="Multilingual"
            description="Full support for Hindi, Telugu, and English. Switch languages anytime in settings."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Private & secure"
            description="Your data stays yours. Encrypted, backed up, and never sold to third parties."
          />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 px-6 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto space-y-16">
          <div className="text-center">
            <h2
              style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
              className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight"
            >
              Three steps to a smarter shop
            </h2>
          </div>

          <div className="space-y-10">
            <Step num={1} title="Tap the mic" description="Open the app and tap the green mic button. ShopMind starts listening." />
            <Step num={2} title="Speak naturally" description="Say what happened: 'Sold 5 kg rice for 400 rupees' or 'Ramesh ne 200 diya' in any language." />
            <Step num={3} title="Confirm and done" description="Review the parsed transaction, make any corrections, and confirm. Your records update instantly." />
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="py-32 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center">
          <h2
            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
            className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight"
          >
            Shop owners love it
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Testimonial
            name="Rajesh Kumar"
            shop="Kumar General Store, Hyderabad"
            quote="Pehle sab kuch diary mein likhna padta tha. Ab sirf bolta hoon aur sab record ho jaata hai. Bahut zyada time bacha."
          />
          <Testimonial
            name="Suresh Reddy"
            shop="Reddy Provisions, Warangal"
            quote="The khata feature is amazing. I know exactly how much credit is outstanding for every customer without checking any book."
          />
          <Testimonial
            name="Meena Devi"
            shop="Devi Kirana, Vijayawada"
            quote="Telugu lo matladite artha avutundi. Chala easy gaa use cheyachu. My son set it up in 10 minutes."
          />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center bg-[var(--color-primary)] text-white space-y-8">
        <h2
          style={{ fontFamily: 'var(--font-serif), Georgia, serif', lineHeight: 'var(--leading-tight)' }}
          className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-tight max-w-2xl mx-auto"
        >
          Ready to modernise your shop?
        </h2>
        <p className="text-white/80 text-[var(--text-body-lg)] max-w-md mx-auto leading-[var(--leading-normal)]">
          It takes 2 minutes to set up. No credit card, no hidden fees — always free.
        </p>
        <div className="pt-4 flex justify-center">
          <Link
            href="/login"
            className="h-14 px-8 rounded-[var(--radius-md)] bg-white text-[var(--color-primary)] font-semibold text-[var(--text-body)] flex items-center gap-2 hover:bg-white/90 transition-all duration-[var(--motion-duration-fast)] btn-press shadow-[var(--shadow-lg)]"
          >
            Get started for free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <ul className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/70 text-[var(--text-sm)]">
          {['Free forever', 'Hindi & Telugu', 'No app download required', 'WCAG accessible'].map((f) => (
            <li key={f} className="flex items-center gap-1.5">
              <Check className="w-4 h-4 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-[var(--text-sm)] text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--color-text-primary)]">ShopMind</span>
          </div>
          <p>© {new Date().getFullYear()} ShopMind. Built for India&apos;s shop owners.</p>
        </div>
      </footer>
    </div>
  );
}
