'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { formatRupiah, formatDateIndonesian, TYPE_OPTIONS, PERIOD_OPTIONS, getCategoriesForType } from '@/lib/constants';

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  note: string | null;
  transaction_date: string;
  saving_goal: { id: number; name: string } | null;
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, total: 0, last_page: 1, per_page: 20 });
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    period: '',
    from: '',
    to: '',
    page: 1,
    per_page: 20,
  });

  const categoryOptions = useMemo(
    () =>
      filters.type
        ? getCategoriesForType(filters.type as 'income' | 'expense' | 'saving').map((c) => ({
            value: c,
            label: c,
          }))
        : [],
    [filters.type]
  );

  const fetchTransactions = useCallback(async () => {
    try {
      const params: {
        type?: string;
        category?: string;
        period?: string;
        from?: string;
        to?: string;
        page?: number;
        per_page?: number;
      } = { page: filters.page, per_page: filters.per_page };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.period) params.period = filters.period;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await api.getTransactions(params);
      if (response.data.success && response.data.data) {
        setTransactions(response.data.data.items);
        setPagination({
          current_page: response.data.data.current_page,
          total: response.data.data.total,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
        });
        setError('');
      }
    } catch {
      setError('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (key: string, value: string | number) => {
    setLoading(true);
    setError('');
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
      ...(key === 'type' ? { category: '' } : null),
    }));
  };

  const handlePageChange = (page: number) => {
    setLoading(true);
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    try {
      await api.deleteTransaction(id);
      setLoading(true);
      fetchTransactions();
    } catch (err: unknown) {
      alert(apiErrorMessage(err, 'Gagal menghapus transaksi'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Transaksi</h1>
          <Button href="/transactions/create">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Transaksi
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Select
                label="Jenis"
                options={TYPE_OPTIONS}
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder="Semua Jenis"
              />
              <Select
                label="Periode"
                options={PERIOD_OPTIONS}
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                placeholder="Semua Waktu"
              />
              <Select
                label="Kategori"
                options={categoryOptions}
                value={filters.category}
                disabled={!filters.type}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder={filters.type ? 'Semua Kategori' : 'Pilih jenis dulu'}
              />
              <div className="md:col-span-2 flex gap-2">
                <Input
                  label="Dari Tanggal"
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
                <Input
                  label="Sampai Tanggal"
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            {error && !loading && (
              <div className="mt-4 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={fetchTransactions}>
                  Coba Lagi
                </Button>
              </div>
            )}
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Belum ada transaksi</p>
                <Button href="/transactions/create">Tambah Transaksi Pertama</Button>
              </div>
            ) : (
              <>
                {/* Mobile: daftar kartu sederhana (PRD §13) */}
                <div className="space-y-3 md:hidden">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{tx.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateIndonesian(tx.transaction_date)}
                            {tx.note && ` · ${tx.note}`}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-semibold ${
                            tx.type === 'income'
                              ? 'text-success'
                              : tx.type === 'saving'
                              ? 'text-warning'
                              : 'text-destructive'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatRupiah(tx.amount)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === 'income'
                              ? 'bg-success/10 text-success'
                              : tx.type === 'expense'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Tabungan'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" href={`/transactions/${tx.id}/edit`}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(tx.id)}>
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: tabel */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Jenis</th>
                        <th className="pb-3 font-medium">Kategori</th>
                        <th className="pb-3 font-medium">Catatan</th>
                        <th className="pb-3 font-medium text-right">Jumlah</th>
                        <th className="pb-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-muted/50">
                          <td className="py-4 text-sm whitespace-nowrap">
                            {formatDateIndonesian(tx.transaction_date)}
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                tx.type === 'income'
                                  ? 'bg-success/10 text-success'
                                  : tx.type === 'expense'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-warning/10 text-warning'
                              }`}
                            >
                              {tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Tabungan'}
                            </span>
                          </td>
                          <td className="py-4 text-sm">
                            {tx.category}
                            {tx.saving_goal && (
                              <span className="block text-xs text-muted-foreground">
                                {tx.saving_goal.name}
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                            {tx.note ?? '-'}
                          </td>
                          <td className="py-4 text-sm font-medium text-right">
                            <span
                              className={
                                tx.type === 'income'
                                  ? 'text-success'
                                  : tx.type === 'saving'
                                  ? 'text-warning'
                                  : 'text-destructive'
                              }
                            >
                              {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" href={`/transactions/${tx.id}/edit`}>
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(tx.id)}
                              >
                                Hapus
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} data)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === 1}
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === pagination.last_page}
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
