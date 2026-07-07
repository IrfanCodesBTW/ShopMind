// ============================================================================
// ThemeProvider — Dark Mode Context
// Persists data-theme to localStorage, respects system preference as default
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  function applyTheme(t: Theme) {
    const html = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = t === 'dark' || (t === 'system' && prefersDark);

    if (isDark) {
      html.setAttribute('data-theme', 'dark');
      setResolvedTheme('dark');
    } else {
      html.setAttribute('data-theme', 'light');
      html.removeAttribute('data-theme');
      setResolvedTheme('light');
    }
  }

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('shopmind-theme') as Theme | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setThemeState(saved);
    applyTheme(saved ?? 'system');
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem('shopmind-theme', t);
    applyTheme(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
