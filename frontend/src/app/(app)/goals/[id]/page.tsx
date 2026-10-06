'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { formatRupiah, formatDateIndonesian, SAVING_GOAL_STATUSES, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string | null;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');

  const goalId = Number(params.id);

  const fetchGoal = useCallback(async () => {
    try {
      const response = await api.getGoal(goalId);
      if (response.data.success && response.data.data) {
        setGoal(response.data.data);
      }
    } catch (err: unknown) {
      alert(apiErrorMessage(err, 'Gagal memuat target'));
      router.push('/goals');
    } finally {
      setLoading(false);
    }
  }, [goalId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoal();
  }, [fetchGoal]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!goal) return;
    try {
      await api.updateGoal(goal.id, { status: newStatus as 'active' | 'completed' | 'archived' });
      await fetchGoal();
    } catch (err: unknown) {
      alert(apiErrorMessage(err, 'Gagal mengubah status'));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus target ini? Semua setoran terkait juga akan terhapus dan saldo dikembalikan.')) return;
    try {
      await api.deleteGoal(goal!.id);
      router.push('/goals');
    } catch (err: unknown) {
      alert(apiErrorMessage(err, 'Gagal menghapus target'));
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositError('Nominal wajib diisi dan lebih dari 0');
      return;
    }

    setDepositLoading(true);
    try {
      await api.depositGoal(goal!.id, {
        amount: parseFloat(depositAmount),
        note: depositNote || undefined,
      });
      setDepositAmount('');
      setDepositNote('');
      await fetchGoal();
    } catch (err: unknown) {
      setDepositError(apiErrorMessage(err, 'Gagal menyimpan setoran'));
    } finally {
      setDepositLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!goal) return null;

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
            <h1 className="text-xl font-bold">{goal.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" href={`/goals/${goal.id}/edit`}>
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[goal.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABELS[goal.status] ?? goal.status}
                </span>
              </div>
              <div className="w-full sm:w-64">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      goal.status === 'completed'
                        ? 'bg-success'
                        : goal.status === 'archived'
                        ? 'bg-muted-foreground'
                        : 'bg-warning'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{formatRupiah(goal.saved_amount)}</p>
                <p className="text-sm text-muted-foreground">Terkumpul</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{formatRupiah(goal.target_amount)}</p>
                <p className="text-sm text-muted-foreground">Target</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{formatRupiah(goal.target_amount - goal.saved_amount)}</p>
                <p className="text-sm text-muted-foreground">Sisa</p>
              </div>
            </div>

            {goal.deadline && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                <span className="text-muted-foreground">Batas Waktu: </span>
                <span className="font-medium">{formatDateIndonesian(goal.deadline)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deposit Form */}
        {goal.status === 'active' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Setor ke Target</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <Input
                  label="Nominal Setoran"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Contoh: 500000"
                  error={depositError}
                  required
                  min="1"
                  step="1"
                  inputMode="numeric"
                />
                <Input
                  label="Catatan (opsional)"
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Contoh: Setoran mingguan"
                  maxLength={255}
                />
                <div className="text-sm text-muted-foreground">
                  Saldo tersedia: <span className="font-medium text-success">{formatRupiah(user?.balance ?? 0)}</span>
                  {' · '}
                  Sisa target: <span className="font-medium text-warning">{formatRupiah(goal.target_amount - goal.saved_amount)}</span>
                </div>
                <Button type="submit" className="w-full" size="lg" loading={depositLoading}>
                  Simpan Setoran
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle>Kelola Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SAVING_GOAL_STATUSES.map((status) => (
                <Button
                  key={status}
                  variant={goal.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateStatus(status)}
                  disabled={goal.status === status}
                >
                  {STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleDelete} className="w-full">
              Hapus Target
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
