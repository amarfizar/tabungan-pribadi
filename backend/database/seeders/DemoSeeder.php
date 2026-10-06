<?php

namespace Database\Seeders;

use App\Models\SavingGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    /** Email akun demo. */
    private const DEMO_EMAIL = 'demo@example.com';

    /** Password akun demo, di-hash oleh cast `hashed` pada model User. */
    private const DEMO_PASSWORD = 'password123';

    /**
     * Buat akun demo beserta data contoh (transaksi, target, setoran) supaya
     * seluruh halaman langsung terlihat isinya. Aman dijalankan berulang kali.
     */
    public function run(): void
    {
        $this->removeExistingDemoAccount();

        $user = User::factory()->create([
            'name' => 'Budi Santoso',
            'email' => self::DEMO_EMAIL,
            'password' => self::DEMO_PASSWORD,
        ]);

        $goals = $this->createGoals($user);
        $this->createTransactions($user, $goals);
        $this->createSavings($user, $goals);

        $this->command?->info('Akun demo: '.self::DEMO_EMAIL.' / '.self::DEMO_PASSWORD);
        $this->command?->info('Saldo: '.number_format((float) $user->fresh()->balance()));
        $this->command?->info(
            'Transaksi: '.Transaction::query()->where('user_id', $user->id)->count()
            .' | Target: '.SavingGoal::query()->where('user_id', $user->id)->count()
        );
    }

    /**
     * Hapus akun demo lama beserta datanya agar seeder idempoten.
     */
    private function removeExistingDemoAccount(): void
    {
        $existing = User::query()->where('email', self::DEMO_EMAIL)->first();

        if ($existing === null) {
            return;
        }

        Transaction::query()->where('user_id', $existing->id)->delete();
        SavingGoal::query()->where('user_id', $existing->id)->delete();
        $existing->tokens()->delete();
        $existing->delete();
    }

    /**
     * @return array<string, SavingGoal>
     */
    private function createGoals(User $user): array
    {
        return [
            'darurat' => SavingGoal::factory()->for($user)->create([
                'name' => 'Dana Darurat',
                'target_amount' => 10000000,
                'saved_amount' => 1500000,
                'deadline' => now()->addMonths(8)->startOfMonth()->toDateString(),
                'status' => SavingGoal::STATUS_ACTIVE,
            ]),
            'bali' => SavingGoal::factory()->for($user)->create([
                'name' => 'Liburan Bali',
                'target_amount' => 5000000,
                'saved_amount' => 500000,
                'deadline' => now()->addMonths(5)->startOfMonth()->toDateString(),
                'status' => SavingGoal::STATUS_ACTIVE,
            ]),
            'laptop' => SavingGoal::factory()->for($user)->create([
                'name' => 'Beli Laptop',
                'target_amount' => 6000000,
                'saved_amount' => 6000000,
                'deadline' => now()->subMonth()->startOfMonth()->toDateString(),
                'status' => SavingGoal::STATUS_COMPLETED,
            ]),
        ];
    }

    /**
     * Pemasukan dan pengeluaran 4 bulan terakhir.
     *
     * @param  array<string, SavingGoal>  $goals
     */
    private function createTransactions(User $user, array $goals): void
    {
        $rows = [
            // [bulan lalu, hari, tipe, kategori, nominal, catatan]
            [3, 1, Transaction::TYPE_INCOME, 'Gaji', 5000000, 'Gaji bulanan'],
            [2, 1, Transaction::TYPE_INCOME, 'Gaji', 5000000, 'Gaji bulanan'],
            [1, 1, Transaction::TYPE_INCOME, 'Gaji', 5000000, 'Gaji bulanan'],
            [1, 15, Transaction::TYPE_INCOME, 'Freelance', 1250000, 'Proyek desain'],
            [0, 1, Transaction::TYPE_INCOME, 'Gaji', 5000000, 'Gaji bulanan'],
            [0, 4, Transaction::TYPE_INCOME, 'Bonus', 750000, 'Bonus kinerja'],

            [1, 2, Transaction::TYPE_EXPENSE, 'Tagihan', 340000, 'Listrik & air'],
            [1, 5, Transaction::TYPE_EXPENSE, 'Makanan', 420000, 'Belanja bahan makanan'],
            [1, 12, Transaction::TYPE_EXPENSE, 'Belanja', 520000, 'Pakaian'],
            [1, 18, Transaction::TYPE_EXPENSE, 'Transportasi', 180000, 'Servis motor'],
            [1, 22, Transaction::TYPE_EXPENSE, 'Hiburan', 250000, 'Konser musik'],

            [0, 2, Transaction::TYPE_EXPENSE, 'Tagihan', 350000, 'Listrik & air'],
            [0, 3, Transaction::TYPE_EXPENSE, 'Makanan', 325000, 'Belanja bahan makanan'],
            [0, 5, Transaction::TYPE_EXPENSE, 'Transportasi', 120000, 'Bensin'],
            [0, 6, Transaction::TYPE_EXPENSE, 'Belanja', 450000, 'Belanja kebutuhan rumah'],
            [0, 8, Transaction::TYPE_EXPENSE, 'Makanan', 145000, 'Makan siang bersama teman'],
            [0, 10, Transaction::TYPE_EXPENSE, 'Hiburan', 175000, 'Nonton bioskop'],
        ];

        foreach ($rows as [$monthsAgo, $day, $type, $category, $amount, $note]) {
            Transaction::factory()->for($user)->create([
                'type' => $type,
                'category' => $category,
                'amount' => $amount,
                'note' => $note,
                'transaction_date' => $this->dateOf($monthsAgo, $day),
            ]);
        }
    }

    /**
     * Setoran ke target; total per target disamakan dengan saved_amount.
     *
     * @param  array<string, SavingGoal>  $goals
     */
    private function createSavings(User $user, array $goals): void
    {
        $rows = [
            // [target, bulan lalu, nominal]
            [$goals['laptop'], 3, 2000000],
            [$goals['laptop'], 2, 2000000],
            [$goals['laptop'], 1, 2000000],
            [$goals['darurat'], 0, 1500000],
            [$goals['bali'], 0, 500000],
        ];

        foreach ($rows as [$goal, $monthsAgo, $amount]) {
            Transaction::factory()->saving($goal)->create([
                'amount' => $amount,
                'note' => 'Setoran '.$goal->name,
                'transaction_date' => $this->dateOf($monthsAgo, 6),
            ]);
        }
    }

    /**
     * Tanggal pada bulan lalu; untuk bulan berjalan tidak melewati hari ini.
     */
    private function dateOf(int $monthsAgo, int $day): string
    {
        if ($monthsAgo === 0) {
            $day = min($day, now()->day);
        }

        return now()->subMonths($monthsAgo)->startOfMonth()->addDays($day - 1)->toDateString();
    }
}
