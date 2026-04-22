import React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)] ${className}`}
    >
      {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
