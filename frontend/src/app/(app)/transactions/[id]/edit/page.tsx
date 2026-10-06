'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, apiErrorMessage, apiValidationErrors } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVING_CATEGORY,
  formatDateIndonesian,
} from '@/lib/constants';

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: number;
  note: string | null;
  transaction_date: string;
  saving_goal: { id: number; name: string } | null;
}

interface FormData {
  type: string;
  category: string;
  amount: string;
  note: string;
  transaction_date: string;
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = Number(params.id);

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: 'expense',
    category: '',
    amount: '',
    note: '',
    transaction_date: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [pageError, setPageError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await api.getTransaction(transactionId);
        if (response.data.success && response.data.data) {
          const data: Transaction = response.data.data;
          setTransaction(data);
          setFormData({
            type: data.type,
            category: data.category,
            amount: String(data.amount),
            note: data.note ?? '',
            transaction_date: data.transaction_date,
          });
        } else {
          setPageError('Transaksi tidak ditemukan');
        }
      } catch {
        setPageError('Transaksi tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  const isSaving = transaction?.type === 'saving';

  const categoryOptions = (() => {
    if (formData.type === 'income') return INCOME_CATEGORIES.map((c) => ({ value: c, label: c }));
    if (formData.type === 'expense') return EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
    return [{ value: SAVING_CATEGORY, label: SAVING_CATEGORY }];
  })();

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.amount) {
      newErrors.amount = 'Nominal wajib diisi';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Nominal harus lebih besar dari 0';
    } else if (Number(formData.amount) > 9999999999999.99) {
      newErrors.amount = 'Nominal melebihi batas yang diizinkan';
    }

    if (!formData.category) newErrors.category = 'Kategori wajib diisi';
    if (!formData.transaction_date || isNaN(Date.parse(formData.transaction_date))) {
      newErrors.transaction_date = 'Tanggal wajib diisi';
    }
    if (formData.note.length > 255) newErrors.note = 'Catatan maksimal 255 karakter';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      await api.updateTransaction(transactionId, {
        type: formData.type as 'income' | 'expense' | 'saving',
        category: formData.category,
        amount: Number(formData.amount),
        note: formData.note.trim() || undefined,
        transaction_date: formData.transaction_date,
      });
      router.push('/transactions');
      router.refresh();
    } catch (err: unknown) {
      const fieldErrors = apiValidationErrors(err, Object.keys(formData));

      setErrors(
        Object.keys(fieldErrors).length > 0
          ? (fieldErrors as Partial<Record<keyof FormData, string>>)
          : { amount: apiErrorMessage(err, 'Gagal memperbarui transaksi') }
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (pageError || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{pageError || 'Transaksi tidak ditemukan'}</p>
          <Button onClick={() => router.push('/transactions')}>Kembali ke Transaksi</Button>
        </div>
      </div>
    );
  }

  const typeLabel =
    transaction.type === 'income' ? 'Pemasukan' : transaction.type === 'expense' ? 'Pengeluaran' : 'Tabungan';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Kembali">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold">Edit Transaksi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>{typeLabel} · {transaction.category}</CardTitle>
            <CardDescription>
              Dicatat pada {formatDateIndonesian(transaction.transaction_date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="edit-transaction-form" onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Jenis"
                type="text"
                value={typeLabel}
                readOnly
                disabled
              />
              {isSaving && transaction.saving_goal && (
                <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  Setoran tabungan untuk target{' '}
                  <span className="font-medium text-foreground">{transaction.saving_goal.name}</span>.
                  Jenis dan kategori tidak dapat diubah; ubah nominal, catatan, atau tanggal saja.
                  Untuk menghapus setoran, hapus dari halaman target tabungan.
                </p>
              )}
              {!isSaving && (
                <Select
                  label="Kategori"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="Pilih kategori"
                  error={errors.category}
                />
              )}
              <Input
                label="Nominal"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Contoh: 25000"
                error={errors.amount}
                required
                min="1"
                step="1"
                inputMode="numeric"
              />
              <Input
                label="Tanggal"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleChange('transaction_date', e.target.value)}
                error={errors.transaction_date}
                required
              />
              <Input
                label="Catatan (opsional)"
                type="text"
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Contoh: Kopi sore"
                error={errors.note}
                maxLength={255}
              />
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              form="edit-transaction-form"
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              loading={saving}
            >
              Simpan Perubahan
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              Batal
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
