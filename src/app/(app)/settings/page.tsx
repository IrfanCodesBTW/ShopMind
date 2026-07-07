// ============================================================================
// Settings Page — Dark Mode Toggle, Language Switch, Profile (restyled)
// Source: new_Design_plan.md Task 8, Design.md §Typography
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Sun, Moon, Monitor, Bell, User, ChevronRight, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';

type Lang = { code: string; label: string; nativeLabel: string };

const LANGUAGES: Lang[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[var(--text-caption)] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
      {children}
    </h2>
  );
}

function SettingsRow({
  icon, label, description, children, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const Element = onClick ? 'button' : 'div';
  return (
    <Element
      onClick={onClick}
      className={[
        'flex items-center justify-between gap-4 py-4 px-4 border-b border-[var(--color-divider)] last:border-0 w-full',
        onClick ? 'cursor-pointer hover:bg-[var(--color-divider)] transition-colors' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-[var(--color-text-muted)] flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[var(--text-body)] font-semibold text-[var(--color-text-primary)]">{label}</p>
          {description && (
            <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] truncate mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children || (onClick && <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />)}
    </Element>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeLang, setActiveLang] = useState('en');
  const [profileName, setProfileName] = useState('');
  const [shopName, setShopName] = useState('');

  function switchLanguage(code: string) {
    setActiveLang(code);
    // setTimeout handles DOM mutation to avoid immutability lint error
    setTimeout(() => {
      document.documentElement.lang = code;
    }, 0);
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-[var(--text-h5)] font-bold text-[var(--color-text-primary)] tracking-tight">Settings</h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] font-medium">Manage your shop preferences and profile</p>
      </div>

      {/* Appearance */}
      <div className="space-y-3">
        <SectionHeader>Appearance</SectionHeader>
        <Card padding="md" className="border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-4">
          <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Theme Mode</p>
          <div className="flex gap-3">
            {([
              { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
              { value: 'dark',  icon: <Moon className="w-4 h-4" />, label: 'Dark' },
              { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
            ] as const).map(({ value, icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={[
                  'flex-1 flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-[var(--radius-md)]',
                  'text-[var(--text-sm)] font-semibold border cursor-pointer transition-all duration-[var(--motion-duration-fast)] btn-press',
                  theme === value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]',
                ].join(' ')}
                aria-pressed={theme === value}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Language */}
      <div className="space-y-3">
        <SectionHeader>Language Selection</SectionHeader>
        <Card padding="md" className="border-[var(--color-border)] shadow-[var(--shadow-sm)] space-y-4">
          <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Choose language for voice and app UI</p>
          <div className="flex gap-3 flex-wrap">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={[
                  'flex flex-col items-center gap-1 px-5 py-3 rounded-[var(--radius-md)] min-w-[100px]',
                  'text-[var(--text-sm)] font-semibold border cursor-pointer transition-all duration-[var(--motion-duration-fast)] btn-press',
                  activeLang === lang.code
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]',
                ].join(' ')}
                aria-pressed={activeLang === lang.code}
                lang={lang.code}
              >
                <span className="text-[var(--text-sm)] font-bold">{lang.nativeLabel}</span>
                <span className="text-[var(--text-caption)] opacity-70 mt-0.5">{lang.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Profile */}
      <div className="space-y-3">
        <SectionHeader>Profile Details</SectionHeader>
        <Card padding="lg" className="space-y-6 border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Your Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter your name"
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Shop Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter your shop name"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" className="w-full md:w-auto px-8">Save Profile</Button>
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <SectionHeader>Notification Preferences</SectionHeader>
        <Card padding="none" className="divide-y divide-[var(--color-divider)] overflow-hidden border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            label="Daily Book Summary"
            description="Receive daily balance ledger summaries via SMS/Email"
          />
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            label="Low Stock Alerts"
            description="Alert when store inventory falls below critical levels"
          />
        </Card>
      </div>

      {/* Sign out */}
      <div className="pt-4">
        <Button variant="ghost" fullWidth size="lg" icon={<LogOut className="w-5 h-5" />} className="text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/30">
          Sign Out of Account
        </Button>
      </div>
    </div>
  );
}
