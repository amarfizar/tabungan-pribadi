'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, apiErrorMessage, apiValidationErrors } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { STATUS_OPTIONS } from '@/lib/constants';

interface FormData {
  name: string;
  target_amount: string;
  deadline: string;
  status: 'active' | 'completed' | 'archived';
}

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    target_amount: '',
    deadline: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const goalId = Number(params.id);

  const fetchGoal = useCallback(async () => {
    try {
      const response = await api.getGoal(goalId);
      if (response.data.success && response.data.data) {
        const goal = response.data.data;
        setFormData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          deadline: goal.deadline ?? '',
          status: goal.status as 'active' | 'completed' | 'archived',
        });
      }
    } catch {
      alert('Gagal memuat target');
      router.push('/goals');
    } finally {
      setLoading(false);
    }
  }, [goalId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoal();
  }, [fetchGoal]);

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

    setSaving(true);
    try {
      await api.updateGoal(Number(params.id), {
        name: formData.name.trim() || undefined,
        target_amount: parseFloat(formData.target_amount),
        deadline: formData.deadline || null,
        status: formData.status,
      });
      router.push(`/goals/${params.id}`);
      router.refresh();
    } catch (err: unknown) {
      const fieldErrors = apiValidationErrors(err, Object.keys(formData));

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Partial<Record<keyof FormData, string>>);
      } else {
        alert(apiErrorMessage(err, 'Gagal memperbarui target'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Edit Target</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Target Tabungan</CardTitle>
            <CardDescription>
              Perbarui data target tabungan Anda
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
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as 'active' | 'completed' | 'archived')}
                required
              />
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" onClick={handleSubmit} className="w-full" size="lg" loading={saving}>
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