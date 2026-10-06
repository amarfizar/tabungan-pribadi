# PRD — Aplikasi Tabungan Pribadi

**Versi:** 1.0  
**Tanggal:** 6 Oktober 2026  
**Status:** Draft / Ready for Development  
**Platform:** Web Responsive (Desktop, Tablet, Mobile)  
**Frontend:** Next.js  
**Backend:** Laravel  
**Database:** MySQL  
**Autentikasi:** Laravel Sanctum / token-based authentication  
**Bahasa utama:** Indonesia

---

## 1. Ringkasan Produk

Aplikasi ini adalah aplikasi **tabungan dan pengelolaan keuangan pribadi sederhana** yang membantu pengguna mencatat pemasukan, pengeluaran, uang jajan, uang transportasi, serta membuat target tabungan.

Aplikasi dibuat dengan prinsip:

- sederhana dan mudah digunakan;
- tampilan modern, elegan, dan tidak terlalu ramai;
- fokus pada kebutuhan pengguna pribadi;
- responsive untuk desktop dan mobile;
- hanya memiliki **role pengguna**, tanpa admin;
- database dibuat seminimal mungkin;
- hanya menyimpan data yang benar-benar diperlukan;
- tidak menyimpan file besar atau aset yang tidak diperlukan;
- mendukung **Light Mode dan Dark Mode**.

Tujuan utama bukan menjadi aplikasi akuntansi yang kompleks, tetapi menjadi **personal finance tracker ringan** untuk membantu pengguna mengetahui:

1. berapa uang yang dimiliki;
2. berapa pemasukan;
3. berapa pengeluaran;
4. berapa uang yang sudah ditabung;
5. progres target tabungan;
6. pola pengeluaran sederhana.

---

# 2. Tujuan Produk

## 2.1 Tujuan Utama

Membuat aplikasi yang memungkinkan pengguna mengelola keuangan pribadi dengan cepat tanpa membutuhkan proses pencatatan yang rumit.

## 2.2 Tujuan Khusus

- Mencatat pemasukan.
- Mencatat pengeluaran.
- Mencatat uang jajan.
- Mencatat uang transportasi.
- Membuat target tabungan.
- Melihat progres target.
- Mengetahui saldo secara otomatis.
- Melihat ringkasan keuangan berdasarkan periode.
- Memberikan kategori pengeluaran sederhana.
- Menyediakan dashboard yang mudah dipahami.
- Menjaga ukuran aplikasi dan database tetap ringan.

---

# 3. Target Pengguna

Target utama:

- Pelajar/mahasiswa.
- Pekerja.
- Pengguna yang ingin mulai mengatur keuangan.
- Pengguna yang membutuhkan pencatatan keuangan pribadi sederhana.

Aplikasi **bukan** ditujukan untuk:

- perusahaan;
- toko;
- pembukuan bisnis;
- multi-user organisasi;
- sistem akuntansi profesional.

---

# 4. Prinsip UX

Aplikasi harus mengikuti prinsip berikut:

### Simple

Pengguna dapat mencatat transaksi hanya dalam beberapa langkah.

### Clear

Saldo, pemasukan, pengeluaran, dan target harus mudah dipahami.

### Lightweight

Tidak menggunakan fitur atau library yang tidak diperlukan.

### Mobile First

Pengalaman mobile harus tetap nyaman meskipun aplikasi juga digunakan di desktop.

### Minimal Data

Database hanya menyimpan informasi yang diperlukan untuk menjalankan fitur.

---

# 5. Fitur Utama

## 5.1 Registrasi

Pengguna dapat membuat akun menggunakan:

- nama;
- email;
- password.

Validasi:

- nama wajib diisi;
- email wajib valid dan unik;
- password minimal 8 karakter.

Setelah registrasi berhasil, pengguna dapat langsung login.

---

## 5.2 Login

Form:

- email;
- password.

Fitur:

- login;
- logout;
- validasi kredensial;
- session/token authentication;
- proteksi halaman pengguna.

Tidak ada login admin.

---

## 5.3 Dashboard

Dashboard merupakan halaman utama setelah login.

Informasi utama:

### Saldo Saat Ini

Menampilkan saldo berdasarkan:

**Total Pemasukan - Total Pengeluaran**

### Total Pemasukan

Menampilkan total pemasukan pada periode tertentu.

### Total Pengeluaran

Menampilkan total pengeluaran pada periode tertentu.

### Total Tabungan

Menampilkan nominal yang dialokasikan ke target tabungan.

### Target Tabungan

Menampilkan beberapa target aktif beserta progress bar.

### Ringkasan Pengeluaran

Menampilkan kategori pengeluaran terbesar.

### Transaksi Terbaru

Menampilkan beberapa transaksi terakhir.

Dashboard tidak boleh terlalu penuh.

Prioritas informasi:

1. saldo;
2. pemasukan/pengeluaran;
3. target tabungan;
4. transaksi terbaru.

---

# 6. Modul Pemasukan

Pengguna dapat mencatat sumber pemasukan.

Contoh:

- Gaji;
- uang bulanan;
- uang saku;
- bonus;
- freelance;
- hadiah;
- pemasukan lainnya.

Data yang diperlukan:

- nominal;
- kategori;
- tanggal;
- catatan opsional.

Contoh:

> Gaji — Rp3.000.000 — 1 Oktober 2026

---

# 7. Modul Pengeluaran

Pengguna dapat mencatat pengeluaran.

Kategori default:

- Makanan;
- Uang Jajan;
- Transportasi;
- Belanja;
- Tagihan;
- Pendidikan;
- Hiburan;
- Kesehatan;
- Lainnya.

Data:

- nominal;
- kategori;
- tanggal;
- catatan opsional.

Contoh:

> Transportasi — Rp20.000 — 6 Oktober 2026

---

# 8. Modul Uang Jajan

Uang jajan dibuat sebagai **kategori khusus dalam transaksi pengeluaran**, bukan tabel database terpisah.

Contoh:

- Sarapan;
- Kopi;
- Jajan sekolah/kampus;
- Makan;
- Camilan.

Dengan pendekatan ini, database lebih kecil dan tetap mudah dikembangkan.

Pengguna cukup memilih:

**Kategori → Uang Jajan**

---

# 9. Modul Uang Transportasi

Transportasi juga menggunakan kategori pengeluaran.

Contoh:

- Bensin;
- Ojek online;
- Angkutan umum;
- Parkir;
- Transportasi lainnya.

Pengguna cukup memilih:

**Kategori → Transportasi**

Tidak diperlukan tabel transportasi khusus.

---

# 10. Target Tabungan

Pengguna dapat membuat target tabungan.

Contoh:

- Laptop baru;
- Motor;
- Liburan;
- Dana darurat;
- Pendidikan;
- Target pribadi.

Data target:

- nama target;
- nominal target;
- nominal terkumpul;
- deadline opsional;
- status.

Contoh:

> Target: Laptop  
> Target: Rp10.000.000  
> Terkumpul: Rp4.000.000  
> Progress: 40%

## Status target

- Aktif;
- Tercapai;
- Diarsipkan.

---

# 11. Setoran ke Target

Pengguna dapat menambahkan uang ke target.

Contoh:

Saldo pengguna:

> Rp5.000.000

Pengguna menambahkan:

> Rp500.000

ke target Laptop.

Maka:

> Target Laptop bertambah Rp500.000.

Sistem harus mengurangi saldo yang tersedia agar pencatatan keuangan tetap konsisten.

### Catatan implementasi

Setoran target **tidak perlu membuat tabel khusus**.

Gunakan transaksi dengan tipe:

`income`
`expense`
`saving`

Dengan demikian database tetap sederhana.

---

# 12. Perhitungan Saldo

Saldo dihitung berdasarkan transaksi.

Konsep:

```text
Saldo = Total Pemasukan - Total Pengeluaran - Total Tabungan
```

Namun secara implementasi, seluruh transaksi dapat menggunakan tipe:

- income;
- expense;
- saving.

Dengan aturan:

```text
income  = +nominal
expense = -nominal
saving  = -nominal
```

Saldo:

```text
SUM(income) - SUM(expense) - SUM(saving)
```

Catatan: tabungan merupakan uang yang dipindahkan dari saldo tersedia ke target, sehingga tidak boleh dihitung sebagai pengeluaran konsumtif.

---

# 13. Riwayat Transaksi

Pengguna dapat melihat seluruh transaksi.

Informasi:

- tanggal;
- jenis;
- kategori;
- nominal;
- catatan.

Filter:

- semua;
- pemasukan;
- pengeluaran;
- tabungan.

Filter periode:

- hari ini;
- minggu ini;
- bulan ini;
- bulan sebelumnya;
- custom date range.

Untuk mobile, gunakan card/list sederhana.

Untuk desktop, gunakan tabel.

---

# 14. Kategori Transaksi

Gunakan kategori default agar database tetap ringan.

Kategori pemasukan:

- Gaji
- Uang Bulanan
- Bonus
- Freelance
- Hadiah
- Lainnya

Kategori pengeluaran:

- Makanan
- Uang Jajan
- Transportasi
- Belanja
- Tagihan
- Pendidikan
- Hiburan
- Kesehatan
- Lainnya

Kategori dapat disimpan sebagai string sederhana pada transaksi.

### Keputusan desain

Untuk versi pertama, **tidak perlu tabel `categories`**.

Alasannya:

- aplikasi hanya personal;
- jumlah kategori sedikit;
- mengurangi relasi database;
- mengurangi query;
- database lebih sederhana.

Jika suatu saat pengguna membutuhkan kategori custom, tabel kategori dapat ditambahkan pada versi berikutnya.

---

# 15. Statistik Sederhana

Tidak perlu sistem analytics kompleks.

Statistik cukup menampilkan:

- pemasukan bulan ini;
- pengeluaran bulan ini;
- tabungan bulan ini;
- pengeluaran berdasarkan kategori;
- perbandingan pemasukan dan pengeluaran.

Contoh:

```text
Pemasukan     Rp4.000.000
Pengeluaran   Rp2.100.000
Tabungan      Rp1.000.000
Sisa          Rp900.000
```

Gunakan chart sederhana dan ringan.

Tidak perlu library chart besar jika tidak dibutuhkan.

---

# 16. Ringkasan Bulanan

Aplikasi dapat menampilkan ringkasan:

### Oktober 2026

- Total pemasukan
- Total pengeluaran
- Total tabungan
- Sisa saldo
- Pengeluaran terbesar

Data dihitung langsung dari tabel transaksi.

**Tidak perlu tabel laporan bulanan.**

Hal ini menghindari duplikasi data.

---

# 17. Notifikasi / Reminder

Fitur opsional ringan.

Contoh:

> Target "Laptop" tinggal Rp1.500.000 lagi.

atau:

> Pengeluaran bulan ini sudah lebih tinggi dibanding bulan lalu.

Untuk versi awal, notifikasi cukup berupa informasi di dalam aplikasi.

Tidak perlu push notification terlebih dahulu.

---

# 18. Dark Mode

Aplikasi mendukung:

- Light Mode;
- Dark Mode;
- System Mode.

Warna utama:

### Light

- Primary: Blue
- Background: White
- Surface: White / Soft Gray
- Text: Dark Gray
- Border: Light Gray

### Dark

- Primary: Blue
- Background: Dark Navy / Dark Gray
- Surface: Slightly lighter dark
- Text: White / Soft Gray

Gunakan CSS variables sehingga pergantian tema tidak membutuhkan struktur UI berbeda.

---

# 19. Desain UI

Gaya visual:

**Simple + Modern + Elegant + Clean**

Karakter:

- rounded corners secukupnya;
- whitespace cukup;
- icon sederhana;
- typography modern;
- card tidak berlebihan;
- shadow tipis;
- animasi minimal;
- fokus pada readability.

Jangan menggunakan:

- gradient berlebihan;
- animasi berat;
- background ramai;
- terlalu banyak warna;
- terlalu banyak card;
- efek glassmorphism berlebihan.

---

# 20. Navigasi

## Desktop

Sidebar:

- Dashboard
- Transaksi
- Target Tabungan
- Statistik
- Pengaturan

Profile kecil di bagian bawah sidebar.

## Mobile

Gunakan bottom navigation:

1. Home
2. Transaksi
3. Target
4. Statistik
5. Profil

Tombol `+` dapat digunakan sebagai shortcut menambah transaksi.

---

# 21. Quick Add

Fitur penting untuk mempercepat pencatatan.

Tombol:

`+ Tambah`

Pilihan:

- Tambah Pemasukan
- Tambah Pengeluaran
- Tambah Tabungan

Form harus singkat.

Contoh pengeluaran:

```text
Nominal
Rp 25.000

Kategori
Uang Jajan

Tanggal
Hari ini

Catatan
Kopi
```

Tombol:

`Simpan`

---

# 22. Pengaturan

Pengguna dapat mengatur:

- nama;
- email;
- password;
- tema;
- mata uang.

Mata uang default:

`IDR / Rupiah`

Untuk versi awal tidak perlu multi-currency kompleks.

---

# 23. Keamanan

Backend Laravel bertanggung jawab terhadap keamanan.

Implementasi:

- password di-hash;
- validasi request;
- authentication;
- authorization berdasarkan user ID;
- CSRF/security mechanism sesuai arsitektur;
- rate limiting login;
- SQL injection protection melalui Eloquent/Query Builder;
- sanitasi input;
- validasi nominal;
- HTTPS pada production.

Pengguna hanya boleh mengakses data miliknya sendiri.

Contoh:

```text
User A tidak boleh membaca transaksi User B.
```

---

# 24. Arsitektur Sistem

```text
┌──────────────────────────────┐
│          Frontend            │
│          Next.js             │
│                              │
│ Dashboard / UI / Forms       │
└──────────────┬───────────────┘
               │ REST API
               ▼
┌──────────────────────────────┐
│           Backend            │
│           Laravel            │
│                              │
│ Auth / Validation / Logic    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           MySQL              │
│                              │
│ users                        │
│ transactions                 │
│ saving_goals                 │
└──────────────────────────────┘
```

---

# 25. Struktur Database

Database harus seminimal mungkin.

## 25.1 `users`

Kolom minimum:

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Nama pengguna |
| email | VARCHAR(150) | Email unik |
| password | VARCHAR(255) | Password hash |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

Jika Laravel membutuhkan kolom autentikasi tambahan, gunakan migration standar Laravel yang benar-benar diperlukan.

---

## 25.2 `transactions`

Semua pemasukan, pengeluaran, dan tabungan disimpan di satu tabel.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Pemilik transaksi |
| type | ENUM | income / expense / saving |
| category | VARCHAR(50) | Kategori |
| amount | DECIMAL(15,2) | Nominal |
| note | VARCHAR(255) NULL | Catatan opsional |
| transaction_date | DATE | Tanggal |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

Index:

```text
INDEX(user_id)
INDEX(user_id, transaction_date)
```

---

## 25.3 `saving_goals`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | BIGINT | Primary key |
| user_id | BIGINT | Pemilik target |
| name | VARCHAR(100) | Nama target |
| target_amount | DECIMAL(15,2) | Nominal target |
| saved_amount | DECIMAL(15,2) | Nominal terkumpul |
| deadline | DATE NULL | Deadline opsional |
| status | ENUM | active / completed / archived |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diperbarui |

---

# 26. Kenapa Hanya 3 Tabel?

Database sengaja dibuat minimal:

```text
users
transactions
saving_goals
```

Tidak membuat tabel:

- admins;
- categories;
- reports;
- monthly_reports;
- notifications;
- wallets;
- expenses;
- incomes;
- transports;
- allowances;
- settings.

Alasannya:

- aplikasi hanya untuk pengguna pribadi;
- pemasukan/pengeluaran/tabungan dapat menggunakan satu tabel transaksi;
- kategori dapat disimpan sebagai string;
- laporan dapat dihitung dari transaksi;
- pengaturan ringan dapat disimpan pada frontend/local storage bila tidak membutuhkan sinkronisasi server;
- uang jajan dan transportasi cukup menjadi kategori transaksi.

---

# 27. Relasi Database

```text
users
  │
  ├──────────────< transactions
  │
  └──────────────< saving_goals
```

Relasi:

```text
users.id
    ↓
transactions.user_id

users.id
    ↓
saving_goals.user_id
```

Gunakan foreign key untuk menjaga integritas data.

---

# 28. API Backend Laravel

API menggunakan REST.

## Authentication

```http
POST /api/register
POST /api/login
POST /api/logout
GET  /api/user
```

## Dashboard

```http
GET /api/dashboard
```

Mengembalikan:

- saldo;
- pemasukan;
- pengeluaran;
- tabungan;
- target aktif;
- transaksi terbaru.

## Transactions

```http
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
```

## Saving Goals

```http
GET    /api/goals
POST   /api/goals
GET    /api/goals/{id}
PUT    /api/goals/{id}
DELETE /api/goals/{id}
POST   /api/goals/{id}/deposit
```

## Statistics

```http
GET /api/statistics
```

Parameter opsional:

```text
?month=10
&year=2026
```

---

# 29. Struktur Frontend Next.js

Contoh struktur:

```text
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── transactions/
│   ├── goals/
│   ├── statistics/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── transactions/
│   └── goals/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
│
├── hooks/
│
├── types/
│
└── public/
```

Jangan menyimpan gambar besar di `public`.

Gunakan SVG/icon library yang ringan bila diperlukan.

---

# 30. Struktur Backend Laravel

Contoh:

```text
backend/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Transaction.php
│   │   └── SavingGoal.php
│   │
│   └── Http/
│       ├── Controllers/
│       └── Requests/
│
├── database/
│   └── migrations/
│
├── routes/
│   └── api.php
│
└── config/
```

Gunakan service layer hanya jika logic mulai kompleks.

Untuk versi awal, jangan membuat struktur folder berlebihan.

---

# 31. Teknologi yang Disarankan

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide Icons atau icon library ringan
- Fetch API atau Axios

## Backend

- Laravel
- PHP
- Laravel Sanctum
- Eloquent ORM

## Database

- MySQL

## Development

- Git
- GitHub
- npm
- Composer

Docker bersifat **opsional**, bukan persyaratan utama.

---

# 32. Optimasi Ukuran Aplikasi

Aplikasi harus dibuat ringan.

## Hindari

- video background;
- gambar besar;
- font terlalu banyak;
- library UI besar jika tidak diperlukan;
- chart library besar untuk grafik sederhana;
- package npm yang tidak digunakan;
- penyimpanan file transaksi;
- tabel database yang tidak diperlukan.

## Gunakan

- SVG;
- CSS;
- icon library ringan;
- Next.js image optimization jika gambar diperlukan;
- server-side calculation untuk statistik;
- pagination transaksi.

---

# 33. Pagination

Riwayat transaksi harus menggunakan pagination.

Contoh:

```text
GET /api/transactions?page=1&per_page=20
```

Default:

```text
20 transaksi per halaman
```

Tujuan:

- response API lebih kecil;
- query lebih ringan;
- UI lebih cepat;
- cocok untuk mobile.

---

# 34. Caching

Tidak perlu sistem cache kompleks pada versi pertama.

Cache hanya boleh ditambahkan apabila:

- dashboard mulai lambat;
- statistik membutuhkan query berat;
- jumlah transaksi pengguna sudah sangat besar.

Untuk MVP, query MySQL yang terindex sudah cukup.

---

# 35. Validasi Transaksi

Nominal:

- wajib;
- harus angka;
- lebih besar dari 0;
- maksimal sesuai DECIMAL database.

Kategori:

- wajib;
- maksimal 50 karakter.

Tanggal:

- wajib;
- format valid.

Catatan:

- opsional;
- maksimal 255 karakter.

---

# 36. Aturan Target Tabungan

Ketika membuat target:

```text
target_amount > 0
```

Ketika deposit:

```text
deposit_amount > 0
```

Tidak boleh:

```text
saved_amount > target_amount
```

Jika target tercapai:

```text
status = completed
```

Progress:

```text
(saved_amount / target_amount) × 100
```

Maksimal ditampilkan:

```text
100%
```

---

# 37. Empty State

Setiap halaman harus memiliki empty state.

Contoh transaksi kosong:

> Belum ada transaksi.  
> Mulai catat pemasukan atau pengeluaran pertama Anda.

Target kosong:

> Belum ada target tabungan.  
> Buat target pertama Anda.

Empty state harus tetap sederhana dan tidak menggunakan ilustrasi besar agar ukuran aplikasi tetap ringan.

---

# 38. Error Handling

Contoh:

### Login gagal

> Email atau password salah.

### Nominal kosong

> Nominal wajib diisi.

### Saldo tidak cukup

> Saldo tidak mencukupi untuk melakukan setoran.

### Target tidak ditemukan

> Target tabungan tidak ditemukan.

Gunakan HTTP status code yang sesuai.

---

# 39. Respons API

Format response dibuat konsisten.

Contoh sukses:

```json
{
  "success": true,
  "message": "Transaksi berhasil disimpan",
  "data": {}
}
```

Contoh error:

```json
{
  "success": false,
  "message": "Data tidak valid",
  "errors": {}
}
```

---

# 40. Dashboard API

Endpoint:

```http
GET /api/dashboard
```

Contoh response:

```json
{
  "success": true,
  "data": {
    "balance": 2500000,
    "income": 5000000,
    "expense": 1800000,
    "saving": 700000,
    "recent_transactions": [],
    "active_goals": []
  }
}
```

Nilai harus dihitung berdasarkan user yang sedang login.

---

# 41. Responsive Design

## Mobile

Prioritas:

- navigasi bawah;
- quick add;
- card saldo;
- list transaksi;
- target progress.

Ukuran layar target:

```text
320px+
```

## Tablet

Gunakan layout dua kolom jika memungkinkan.

## Desktop

Gunakan:

- sidebar;
- dashboard grid;
- tabel transaksi;
- ruang kosong yang cukup.

---

# 42. Accessibility

Minimal:

- kontras teks cukup;
- tombol memiliki label;
- form memiliki label;
- input memiliki placeholder yang jelas;
- keyboard navigation;
- focus state;
- ukuran tombol mobile nyaman disentuh.

Jangan hanya mengandalkan warna untuk membedakan income/expense.

---

# 43. Performance Target

Target awal:

- halaman utama terasa cepat;
- API response ringan;
- tidak melakukan request API berulang yang tidak diperlukan;
- lazy load komponen berat;
- pagination transaksi;
- database menggunakan index yang diperlukan.

Target teknis awal:

```text
LCP < 2.5s
```

pada koneksi dan perangkat yang wajar.

---

# 44. Scope MVP

MVP wajib memiliki:

- [x] Register
- [x] Login
- [x] Logout
- [x] Dashboard
- [x] Pemasukan
- [x] Pengeluaran
- [x] Uang Jajan
- [x] Transportasi
- [x] Target Tabungan
- [x] Setoran Target
- [x] Riwayat Transaksi
- [x] Statistik sederhana
- [x] Dark Mode
- [x] Responsive desktop/mobile
- [x] Pengaturan profil

---

# 45. Fitur yang Tidak Masuk MVP

Agar aplikasi tetap sederhana, fitur berikut ditunda:

- multi-user sharing;
- akun keluarga;
- admin panel;
- pembayaran;
- integrasi bank;
- e-wallet integration;
- OCR struk;
- AI financial advisor;
- export PDF kompleks;
- import Excel;
- push notification;
- multi-currency;
- recurring transaction kompleks;
- cloud file storage.

Fitur tersebut dapat menjadi roadmap versi berikutnya.

---

# 46. Roadmap

## Version 1.0

Personal finance tracker dasar.

## Version 1.1

- kategori custom;
- recurring transaction;
- export CSV;
- reminder sederhana.

## Version 1.2

- budget bulanan;
- financial goals yang lebih detail;
- laporan tahunan.

## Version 2.0

- PWA;
- offline mode;
- sinkronisasi lebih lanjut;
- notifikasi;
- fitur analisis keuangan.

---

# 47. Acceptance Criteria

## Authentication

- User dapat register.
- User dapat login.
- User dapat logout.
- Password tidak disimpan dalam bentuk plaintext.
- User hanya dapat melihat datanya sendiri.

## Transactions

- User dapat membuat transaksi.
- User dapat mengedit transaksi.
- User dapat menghapus transaksi.
- Saldo berubah otomatis.
- Filter transaksi bekerja.
- Pagination bekerja.

## Goals

- User dapat membuat target.
- User dapat menambahkan setoran.
- Progress otomatis berubah.
- Target berubah menjadi completed ketika tercapai.

## UI

- Responsive pada mobile.
- Responsive pada desktop.
- Light mode bekerja.
- Dark mode bekerja.
- Navigasi jelas.
- Form mudah digunakan.

---

# 48. Prioritas Development

Urutan pengerjaan:

### Phase 1 — Project Setup

1. Buat repository.
2. Setup Next.js.
3. Setup Laravel.
4. Setup MySQL.
5. Konfigurasi environment.
6. Setup API connection.

### Phase 2 — Authentication

1. Register.
2. Login.
3. Logout.
4. Protected routes.
5. User session/token.

### Phase 3 — Database

1. Migration users.
2. Migration transactions.
3. Migration saving_goals.
4. Foreign key.
5. Index.

### Phase 4 — Transaction

1. Create transaction.
2. List transaction.
3. Edit transaction.
4. Delete transaction.
5. Filter.
6. Pagination.

### Phase 5 — Saving Goals

1. Create goal.
2. Goal list.
3. Goal detail.
4. Deposit.
5. Progress.
6. Completion status.

### Phase 6 — Dashboard

1. Balance.
2. Income.
3. Expense.
4. Saving.
5. Recent transaction.
6. Active goals.

### Phase 7 — Statistics

1. Monthly summary.
2. Category summary.
3. Income vs expense.

### Phase 8 — UI Polish

1. Responsive.
2. Dark mode.
3. Empty states.
4. Loading states.
5. Error states.
6. Accessibility.

### Phase 9 — Testing

1. Authentication testing.
2. Transaction testing.
3. Goal testing.
4. API testing.
5. Responsive testing.
6. Security testing.

---

# 49. Testing

## Unit Test

Backend:

- saldo calculation;
- transaction validation;
- goal calculation;
- deposit validation.

## Feature Test

- register;
- login;
- transaction CRUD;
- goal CRUD;
- deposit;
- authorization.

## Frontend Test

- form validation;
- navigation;
- dark mode;
- responsive layout.

## Security Test

Pastikan user tidak dapat:

```text
GET /api/transactions/{transaction_user_lain}
```

atau:

```text
GET /api/goals/{goal_user_lain}
```

Backend harus selalu memverifikasi kepemilikan resource berdasarkan user yang login.

---

# 50. Environment Variables

## Next.js

Contoh:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Laravel

Contoh:

```env
APP_NAME=PersonalSavings
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=personal_savings
DB_USERNAME=root
DB_PASSWORD=
```

Jangan commit file `.env` ke Git.

---

# 51. Deployment

Arsitektur production:

```text
User
 │
 ▼
Next.js
 │
 │ HTTPS / REST API
 ▼
Laravel API
 │
 ▼
MySQL
```

Frontend dan backend dapat ditempatkan pada server yang sama atau berbeda.

Contoh:

```text
app.example.com
api.example.com
```

---

# 52. Kesimpulan Produk

Aplikasi ini dirancang sebagai **personal savings tracker yang ringan**, bukan aplikasi akuntansi kompleks.

Struktur database inti hanya:

```text
users
transactions
saving_goals
```

Pendekatan utama:

```text
Satu tabel transaksi
        ↓
income
expense
saving
```

Sedangkan:

```text
Uang Jajan
Transportasi
Makanan
Belanja
dan kategori lain
```

cukup menjadi kategori transaksi.

Dengan pendekatan tersebut, aplikasi tetap:

- sederhana;
- cepat;
- mudah dikembangkan;
- mudah dirawat;
- hemat storage;
- hemat query;
- cocok untuk mobile;
- cocok untuk desktop;
- tidak membutuhkan admin;
- tidak membutuhkan database yang besar.

---

# 53. Definition of Done

Project dianggap selesai untuk MVP apabila:

- seluruh fitur MVP berjalan;
- tidak ada fitur admin;
- autentikasi aman;
- user hanya dapat mengakses datanya sendiri;
- saldo dihitung dengan benar;
- target tabungan bekerja;
- transaksi dapat CRUD;
- responsive mobile dan desktop;
- dark mode bekerja;
- database hanya menggunakan tabel yang diperlukan;
- tidak ada asset besar yang tidak diperlukan;
- API memiliki validasi;
- error handling tersedia;
- testing dasar selesai;
- project dapat dijalankan secara lokal dengan dokumentasi setup yang jelas.

