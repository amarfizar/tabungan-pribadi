<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Kategori Transaksi
    |--------------------------------------------------------------------------
    |
    | Daftar kategori bawaan sesuai PRD bagian 14. Nilai disimpan apa adanya
    | sebagai string pada kolom transactions.category sehingga tidak perlu
    | tabel kategori terpisah.
    |
    */

    'income' => [
        'Gaji',
        'Uang Bulanan',
        'Bonus',
        'Freelance',
        'Hadiah',
        'Lainnya',
    ],

    'expense' => [
        'Makanan',
        'Uang Jajan',
        'Transportasi',
        'Belanja',
        'Tagihan',
        'Pendidikan',
        'Hiburan',
        'Kesehatan',
        'Lainnya',
    ],

];
