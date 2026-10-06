'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { formatRupiah, formatDateIndonesian } from '@/lib/constants';

interface DashboardData {
  balance: number;
  monthly: {
    income: number;
    expense: number;
    saving: number;
    balance: number;
  };
  expense_categories: Record<string, number>;
  recent_transactions: Array<{
    id: number;
    type: string;
    category: string;
    amount: number;
    note: string | null;
    transaction_date: string;
    saving_goal: { id: number; name: string } | null;
  }>;
  active_goals: Array<{
    id: number;
    name: string;
    target_amount: number;
    saved_amount: number;
    progress: number;
    deadline: string | null;
    status: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.getDashboard();
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.message ?? 'Gagal memuat dashboard');
        }
      } catch {
        setError('Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-success';
      case 'expense':
        return 'text-destructive';
      case 'saving':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Tabungan Pribadi</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Halo, {user?.name ?? 'Pengguna'}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/settings">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Saldo Utama */}
        <div className="mb-6">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm font-medium">
                    Saldo Tersedia
                  </p>
                  <p className="text-4xl font-bold mt-1">
                    {formatRupiah(data.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ringkasan Bulan Ini */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pemasukan Bulan Ini</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatRupiah(data.monthly.income)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {formatRupiah(data.monthly.expense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tabungan Bulan Ini</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatRupiah(data.monthly.saving)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ringkasan Pengeluaran (PRD §5.3) — hanya ditampilkan bila ada data. */}
        {Object.keys(data.expense_categories).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ringkasan Pengeluaran</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/statistics">Statistik Lengkap</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.expense_categories)
                  .slice(0, 3)
                  .map(([category, amount]) => {
                    const percentage =
                      data.monthly.expense > 0
                        ? Math.min(100, (amount / data.monthly.expense) * 100)
                        : 0;

                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{category}</span>
                          <span className="font-medium">{formatRupiah(amount)}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Button asChild variant="outline" className="h-20 flex-col gap-2">
            <Link href="/transactions/create">
              <svg className="h-8 w-8 mx-auto text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Pemasukan</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col gap-2">
            <Link href="/transactions/create?type=expense">
              <svg className="h-8 w-8 mx-auto text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              <span>Pengeluaran</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col gap-2">
            <Link href="/goals/create">
              <svg className="h-8 w-8 mx-auto text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.799 1.121a4.062 4.062 0 010 7.758c-.711.719-1.681 1.121-2.799 1.121a4.041 4.041 0 01-2.799-1.121 4.058 4.058 0 010-7.758c.71-.719 1.679-1.12 2.799-1.12z" />
              </svg>
              <span>Target Baru</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col gap-2">
            <Link href="/transactions">
              <svg className="h-8 w-8 mx-auto text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Semua Transaksi</span>
            </Link>
          </Button>
        </div>

        {/* Target Aktif & Transaksi Terbaru */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Target Aktif */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Target Aktif</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/goals">Lihat Semua</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.active_goals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada target tabungan aktif</p>
                  <Button asChild>
                    <Link href="/goals/create">Buat Target Pertama</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.active_goals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatRupiah(goal.saved_amount)} / {formatRupiah(goal.target_amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning transition-all duration-300"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.progress.toFixed(1)}%</span>
                        {goal.deadline && (
                          <span>Batas: {formatDateIndonesian(goal.deadline)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/goals">Kelola Target</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Transaksi Terbaru */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaksi Terbaru</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/transactions">Lihat Semua</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.recent_transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Belum ada transaksi</p>
                  <Button asChild>
                    <Link href="/transactions/create">Tambah Transaksi</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recent_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            tx.type === 'income'
                              ? 'bg-success/10 text-success'
                              : tx.type === 'expense'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tx.type === 'income' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            )}
                            {tx.type === 'expense' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            )}
                            {tx.type === 'saving' && (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{tx.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateIndonesian(tx.transaction_date)}
                            {tx.note && ` · ${tx.note}`}
                          </p>
                        </div>
                      </div>
                      <span className={`${getTypeColor(tx.type)} font-semibold`}>
                        {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/transactions">Lihat Semua Transaksi</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}