/**
 * Konstanta kategori transaksi - mirror dari backend config/categories.php (PRD §14).
 * Jangan ubah tanpa memperbarui backend juga.
 */

export const INCOME_CATEGORIES = [
  'Gaji',
  'Uang Bulanan',
  'Bonus',
  'Freelance',
  'Hadiah',
  'Lainnya',
] as const;

export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Uang Jajan',
  'Transportasi',
  'Belanja',
  'Tagihan',
  'Pendidikan',
  'Hiburan',
  'Kesehatan',
  'Lainnya',
] as const;

export const SAVING_CATEGORY = 'Tabungan' as const;

export const TRANSACTION_TYPES = ['income', 'expense', 'saving'] as const;

export const SAVING_GOAL_STATUSES = ['active', 'completed', 'archived'] as const;

export const TYPE_OPTIONS = [
  { value: '', label: 'Semua Jenis' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'saving', label: 'Tabungan' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Tercapai' },
  { value: 'archived', label: 'Diarsipkan' },
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  completed: 'Tercapai',
  archived: 'Diarsipkan',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  archived: 'bg-muted/50 text-muted-foreground',
} as const;

export const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'last_month', label: 'Bulan Lalu' },
  { value: 'custom', label: 'Rentang Kustom' },
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type SavingGoalStatus = (typeof SAVING_GOAL_STATUSES)[number];
export type PeriodOption = (typeof PERIOD_OPTIONS)[number]['value'];

export function getCategoriesForType(type: TransactionType): readonly string[] {
  switch (type) {
    case 'income':
      return INCOME_CATEGORIES;
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'saving':
      return [SAVING_CATEGORY];
    default:
      return [];
  }
}

export function isValidCategory(type: TransactionType, category: string): boolean {
  return getCategoriesForType(type).includes(category);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateInput(dateString: string): string {
  // Format YYYY-MM-DD untuk input type="date"
  return dateString.split('T')[0];
}