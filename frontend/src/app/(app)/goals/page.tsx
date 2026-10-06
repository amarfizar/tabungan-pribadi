'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { formatRupiah, formatDateIndonesian, STATUS_OPTIONS, STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      const response = await api.getGoals({ status: statusFilter || undefined });
      if (response.data.success && response.data.data) {
        setGoals(response.data.data);
        setError('');
      }
    } catch {
      setError('Gagal memuat target tabungan');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals();
  }, [fetchGoals]);

  const handleStatusFilter = (value: string) => {
    setLoading(true);
    setStatusFilter(value);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus target ini? Semua setoran terkait juga akan terhapus dan saldo dikembalikan.')) return;
    try {
      await api.deleteGoal(id);
      fetchGoals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus target');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Target Tabungan</h1>
          </div>
          <Button href="/goals/create">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Target Baru
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <Select
                label="Filter Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                placeholder="Semua Status"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchGoals}>
              Coba Lagi
            </Button>
          </div>
        )}

        {goals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <svg className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.799 1.121a4.062 4.062 0 010 7.758c-.711.719-1.681 1.121-2.799 1.121a4.041 4.041 0 01-2.799-1.121 4.058 4.058 0 010-7.758c.71-.719 1.679-1.12 2.799-1.12z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Belum Ada Target</h3>
              <p className="text-muted-foreground mb-4">Mulai menabung dengan membuat target tabungan pertama Anda</p>
              <Button href="/goals/create">Buat Target Pertama</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">{goal.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[goal.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {STATUS_LABELS[goal.status] ?? goal.status}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
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
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>{formatRupiah(goal.saved_amount)} / {formatRupiah(goal.target_amount)}</span>
                        <span>{goal.progress.toFixed(1)}% selesai</span>
                        {goal.deadline && (
                          <span>Batas: {formatDateIndonesian(goal.deadline)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                      <Button variant="outline" size="sm" href={`/goals/${goal.id}`}>
                        Detail
                      </Button>
                      <Button variant="outline" size="sm" href={`/goals/${goal.id}/edit`}>
                        Edit
                      </Button>
                      {goal.status === 'active' && (
                        <Button size="sm" href={`/goals/${goal.id}`}>
                          Setor
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
