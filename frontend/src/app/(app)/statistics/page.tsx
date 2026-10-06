'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/constants';

interface StatisticsData {
  period: { month: number; year: number };
  summary: {
    income: number;
    expense: number;
    saving: number;
    balance: number;
  };
  income_categories: Record<string, number>;
  expense_categories: Record<string, number>;
  saving_categories: Record<string, number>;
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.getStatistics({ month, year });
      if (response.data.success && response.data.data) {
        setData(response.data.data);
        setError('');
      } else {
        setError(response.data.message ?? 'Gagal memuat statistik');
      }
    } catch {
      setError('Gagal memuat statistik');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatistics();
  }, [fetchStatistics]);

  const handleMonthChange = (value: number) => {
    setLoading(true);
    setMonth(value);
  };

  const handleYearChange = (value: number) => {
    setLoading(true);
    setYear(value);
  };

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
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getMonthName = (m: number) => {
    return new Date(year, m - 1).toLocaleDateString('id-ID', { month: 'long' });
  };

  const renderCategoryBreakdown = (
    title: string,
    categories: Record<string, number>,
    color: 'success' | 'destructive' | 'warning'
  ) => {
    const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return null;

    const total = entries.reduce((sum, [, amount]) => sum + amount, 0);
    const dotColor = { success: 'bg-success', destructive: 'bg-destructive', warning: 'bg-warning' }[color];

    return (
      <Card key={title} className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm">
                  {category}
                  {total > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {((amount / total) * 100).toFixed(0)}%
                    </span>
                  )}
                </span>
                <span className="text-sm font-medium">{formatRupiah(amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Statistik</h1>
          <div className="flex items-center gap-4">
            <select
              value={month}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="border border-input rounded-md px-3 py-2 text-sm bg-background"
              aria-label="Pilih bulan"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              min={2000}
              max={2100}
              aria-label="Pilih tahun"
              className="border border-input rounded-md px-3 py-2 text-sm bg-background w-24"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pemasukan</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatRupiah(data.summary.income)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pengeluaran</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {formatRupiah(data.summary.expense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Tabungan</p>
              <p className="text-2xl font-bold text-warning mt-1">
                {formatRupiah(data.summary.saving)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Saldo Bulanan</p>
              <p className="text-2xl font-bold mt-1">
                {formatRupiah(data.summary.balance)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdowns */}
        {Object.keys(data.expense_categories).length === 0 &&
        Object.keys(data.income_categories).length === 0 &&
        Object.keys(data.saving_categories).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-1">Belum ada data pada bulan ini</p>
              <p className="text-sm text-muted-foreground">
                Catat transaksi pada bulan {getMonthName(month)} {year} untuk melihat rincian kategori.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {renderCategoryBreakdown(
              'Kategori Pemasukan',
              data.income_categories,
              'success'
            )}
            {renderCategoryBreakdown(
              'Kategori Pengeluaran',
              data.expense_categories,
              'destructive'
            )}
            {renderCategoryBreakdown(
              'Kategori Tabungan',
              data.saving_categories,
              'warning'
            )}
          </div>
        )}
      </main>
    </div>
  );
}