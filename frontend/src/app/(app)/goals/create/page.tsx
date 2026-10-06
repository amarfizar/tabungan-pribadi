'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, apiErrorMessage, apiValidationErrors } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

interface FormData {
  name: string;
  target_amount: string;
  deadline: string;
}

export default function CreateGoalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    target_amount: '',
    deadline: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Nama target wajib diisi';
    else if (formData.name.length > 100) newErrors.name = 'Nama target maksimal 100 karakter';

    if (!formData.target_amount) newErrors.target_amount = 'Nominal target wajib diisi';
    else if (parseFloat(formData.target_amount) <= 0) newErrors.target_amount = 'Nominal target harus lebih besar dari 0';
    else if (parseFloat(formData.target_amount) > 9999999999999.99) newErrors.target_amount = 'Nominal target melebihi batas yang diizinkan';

    if (formData.deadline && isNaN(Date.parse(formData.deadline))) {
      newErrors.deadline = 'Format tanggal tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.createGoal({
        name: formData.name.trim(),
        target_amount: parseFloat(formData.target_amount),
        deadline: formData.deadline || null,
      });
      router.push('/goals');
      router.refresh();
    } catch (err: unknown) {
      const fieldErrors = apiValidationErrors(err, Object.keys(formData));

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Partial<Record<keyof FormData, string>>);
      } else {
        alert(apiErrorMessage(err, 'Gagal membuat target'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <h1 className="text-xl font-bold">Target Baru</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Buat Target Tabungan</CardTitle>
            <CardDescription>
              Tentukan nama, nominal target, dan batas waktu (opsional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Target"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: Laptop, Liburan, Dana Darurat"
                error={errors.name}
                required
                maxLength={100}
                autoFocus
              />
              <Input
                label="Nominal Target"
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleChange('target_amount', e.target.value)}
                placeholder="Contoh: 10000000"
                error={errors.target_amount}
                required
                min="1"
                step="1"
                inputMode="numeric"
              />
              <Input
                label="Batas Waktu (opsional)"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                error={errors.deadline}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Status target baru otomatis menjadi &quot;Aktif&quot;. Status akan berubah ke
                &quot;Tercapai&quot; otomatis saat nominal terkumpul mencapai target.
              </p>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" loading={loading}>
              Buat Target
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