// ============================================================================
// Settings Page — v2 Premium Glass Settings & Preferences
// Source: Design.md, design-taste-frontend
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, LogOut, Monitor, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/contexts/ThemeContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { SupportedLanguage } from '@/types';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [langPreference, setLangPreference] = useState<SupportedLanguage>('en');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Load current merchant profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me'); // Simple endpoint to fetch user info
        const json = await res.json();
        if (json.success && json.data) {
          setName(json.data.name || '');
          setShopName(json.data.shop_name || '');
          setLangPreference(json.data.language_preference || 'en');
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shop_name: shopName, language_preference: langPreference }),
      });
      const json = await res.json();
      if (json.success) {
        toast('Profile updated successfully', 'success');
        // Update html lang attribute
        document.documentElement.lang = langPreference;
      } else {
        toast(json.error?.message || 'Failed to update profile', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Network error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        toast('Signed out successfully', 'success');
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      toast('Failed to sign out', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto select-none">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-[var(--text-h5)] font-black text-white tracking-tight leading-none">
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {t('settings.subtitle', 'Manage your shop profile and settings')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <Card padding="lg" className="border-white/5 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            {t('settings.profile_details', 'Profile Details')}
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('settings.your_name', 'Your Name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                required
              />
              <Input
                label={t('settings.shop_name', 'Shop Name')}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ramesh Kirana Store"
                required
              />
            </div>

            {/* Language Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                {t('settings.language_selection', 'Language')}
              </label>
              <select
                value={langPreference}
                onChange={(e) => setLangPreference(e.target.value as SupportedLanguage)}
                className="w-full bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500/50 rounded-[18px] h-12 px-4 transition-all duration-300 text-white font-semibold text-sm focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-medium">
                {t('settings.language_desc', 'Select language for app text and speech recognition')}
              </p>
            </div>

            <Button type="submit" variant="primary" loading={loading} icon={<Save className="w-4 h-4" />}>
              {t('settings.save_profile', 'Save Profile')}
            </Button>
          </form>
        </Card>

        {/* System Customization */}
        <Card padding="lg" className="border-white/5 space-y-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-400" />
            System Customization
          </h2>

          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <p className="text-sm font-bold text-white">Theme Mode</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Toggle between light and dark display modes</p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <p className="text-sm font-bold text-white">Daily SMS summary</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Get SMS reports of today’s balances</p>
            </div>
            <Badge variant="primary">Active</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Critical Stock Alerts</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Alerts on low stock thresholds</p>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
        </Card>

        {/* Sign Out Card */}
        <Card padding="lg" className="border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white tracking-tight uppercase">Account Security</h2>
            <p className="text-xs text-slate-500 font-medium">Log out of your active session on this device</p>
          </div>
          <Button variant="danger" size="sm" onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
