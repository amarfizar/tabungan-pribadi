'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, apiErrorMessage, apiValidationErrors } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_TYPES,
} from '@/lib/constants';

type TransactionType = (typeof TRANSACTION_TYPES)[number];

const TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Pemasukan',
  expense: 'Pengeluaran',
  saving: 'Tabungan',
};

const TYPE_OPTIONS = TRANSACTION_TYPES.filter((type) => type !== 'saving').map((type) => ({
  value: type,
  label: TYPE_LABELS[type],
}));

interface FormData {
  type: TransactionType;
  category: string;
  amount: string;
  note: string;
  transaction_date: string;
}

function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split('T')[0];
}

function categoriesFor(type: TransactionType): readonly string[] {
  if (type === 'income') return INCOME_CATEGORIES;
  if (type === 'expense') return EXPENSE_CATEGORIES;
  return [];
}

function CreateTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') === 'expense' ? 'expense' : 'income';

  const [formData, setFormData] = useState<FormData>(() => ({
    type: initialType,
    category: categoriesFor(initialType)[0] ?? '',
    amount: '',
    note: '',
    transaction_date: todayInput(),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleTypeChange = (value: string) => {
    const type = value as TransactionType;
    setFormData((prev) => ({
      ...prev,
      type,
      category: categoriesFor(type)[0] ?? '',
    }));
    setErrors((prev) => ({ ...prev, type: undefined, category: undefined }));
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

    setLoading(true);
    try {
      await api.createTransaction({
        type: formData.type,
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
          : { amount: apiErrorMessage(err, 'Gagal menyimpan transaksi') }
      );
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categoriesFor(formData.type).map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Kembali">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-xl font-bold">Tambah Transaksi</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Catat Transaksi Baru</CardTitle>
            <CardDescription>
              Isi nominal, kategori, dan tanggal transaksi Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="create-transaction-form" onSubmit={handleSubmit} className="space-y-4">
              <Select
                label="Jenis"
                options={TYPE_OPTIONS}
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              />
              <Select
                label="Kategori"
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Pilih kategori"
                error={errors.category}
              />
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
              {formData.type === 'expense' && (
                <p className="text-xs text-muted-foreground">
                  Pilih kategori <span className="font-medium">Uang Jajan</span> atau{' '}
                  <span className="font-medium">Transportasi</span> untuk pencatatan jajan dan ongkos harian.
                </p>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              type="submit"
              form="create-transaction-form"
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              loading={loading}
            >
              Simpan Transaksi
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

export default function CreateTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <CreateTransactionForm />
    </Suspense>
  );
}
