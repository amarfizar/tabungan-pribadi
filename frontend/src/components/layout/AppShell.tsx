'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  href: string;
  label: string;
  paths: string[];
}

const ICON_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
} as const;

function Icon({ paths, className = 'h-5 w-5' }: { paths: string[]; className?: string }) {
  return (
    <svg className={className} {...ICON_PROPS}>
      {paths.map((d) => (
        <path key={d} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
      ))}
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', paths: ['M3 11l9-7 9 7M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10'] },
  {
    href: '/transactions',
    label: 'Transaksi',
    paths: ['M8 6h13M8 12h13M8 18h13', 'M3.5 6h.01M3.5 12h.01M3.5 18h.01'],
  },
  { href: '/goals', label: 'Target', paths: ['M12 3a9 9 0 100 18 9 9 0 000-18z', 'M12 7a5 5 0 100 10 5 5 0 000-10z'] },
  { href: '/statistics', label: 'Statistik', paths: ['M4 20V10M10 20V4M16 20v-6M22 20H2'] },
  {
    href: '/settings',
    label: 'Pengaturan',
    paths: [
      'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
      'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    ],
  },
];

const QUICK_ADD_ITEMS = [
  { href: '/transactions/create?type=income', label: 'Tambah Pemasukan', color: 'text-success' },
  { href: '/transactions/create?type=expense', label: 'Tambah Pengeluaran', color: 'text-destructive' },
  { href: '/goals', label: 'Setor ke Target', color: 'text-warning' },
];

/**
 * Kerangka halaman terproteksi: sidebar untuk desktop, navigasi bawah
 * untuk mobile, plus shortcut Quick Add (PRD §20, §21).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [quickOpen, setQuickOpen] = useState(false);
  const quickRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Tutup menu quick add saat klik di luar menu; item menu juga menutup saat dipilih.
  useEffect(() => {
    if (!quickOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) {
        setQuickOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quickOpen]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r bg-card">
        <div className="px-6 py-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <svg className="h-6 w-6" {...ICON_PROPS}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v18M7 8h10M7 13h10M7 18h6" />
            </svg>
            Tabungan Pribadi
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon paths={item.paths} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t p-3">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Pengguna'}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <svg className="h-4 w-4" {...ICON_PROPS}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Konten */}
      <div className="lg:pl-64">
        <main className="pb-28 lg:pb-10">{children}</main>
      </div>

      {/* Quick Add */}
      <div ref={quickRef} className="fixed bottom-24 right-4 z-30 lg:bottom-6 lg:right-6">
        {quickOpen && (
          <div className="mb-2 w-52 rounded-lg border bg-card p-1 shadow-lg" role="menu">
            {QUICK_ADD_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setQuickOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent ${item.color}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setQuickOpen((open) => !open)}
          aria-expanded={quickOpen}
          aria-label="Tambah data"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-7 w-7" {...ICON_PROPS}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Navigasi bawah mobile */}
      <nav
        className="fixed bottom-0 inset-x-0 z-20 border-t bg-card lg:hidden"
        aria-label="Navigasi bawah"
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon paths={item.paths} className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
