# Website Himpunan Mahasiswa

Platform web terpadu untuk Himpunan Mahasiswa: company profile organisasi, katalog program kerja,
forum aspirasi mahasiswa, sistem Open Recruitment (Oprec) dengan generator PDF & QR Code otomatis,
serta admin dashboard untuk mengelola semuanya.

Dibangun dengan **Next.js (App Router)**, **Tailwind CSS**, dan **Supabase** (PostgreSQL + Storage).

---

## Daftar Isi

1. [Fitur](#fitur)
2. [Tech Stack](#tech-stack)
3. [Struktur Folder](#struktur-folder)
4. [Persiapan Awal](#1-persiapan-awal)
5. [Setup Project Next.js](#2-setup-project-nextjs)
6. [Setup Database Supabase](#3-setup-database-supabase)
7. [Environment Variables](#4-environment-variables)
8. [Setup Storage Bucket](#5-setup-storage-bucket-untuk-admin-dashboard)
9. [Buat Akun Admin Pertama](#6-buat-akun-admin-pertama)
10. [Jalankan Aplikasi](#7-jalankan-aplikasi)
11. [Checklist Pengujian](#8-checklist-pengujian)
12. [Arsitektur Keamanan](#arsitektur-keamanan)
13. [Catatan Performa](#catatan-performa)

---

## Fitur

**Halaman Publik**
- Beranda — hero, sambutan ketua, preview program kerja terbaru
- Tentang Kami — sejarah, visi & misi
- Struktur Organisasi — filter per divisi, kartu pengurus dengan link sosial media
- Katalog & Detail Program Kerja — galeri foto dokumentasi
- Forum Aspirasi — kirim masukan (bisa anonim)
- Open Recruitment — form pendaftaran tanpa login, generator PDF bukti pendaftaran + QR Code

**Admin Dashboard** (`/admin`)
- Autentikasi admin (bcrypt)
- Toggle buka/tutup status Oprec (real-time ke seluruh pengunjung)
- Manajemen pendaftar: filter, cari, atur jadwal interview, ubah status
- One-click convert pendaftar lolos → jadi pengurus
- CMS Program Kerja & Pengurus (tambah + hapus, upload foto)
- Export data pendaftar ke CSV
- Inbox Aspirasi

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js (App Router, Server Components, ISR, Route Handlers) |
| Styling | Tailwind CSS |
| Database & Storage | Supabase (PostgreSQL, Row Level Security, Storage) |
| PDF Generator | `@react-pdf/renderer` |
| QR Code | `qrcode.react` |
| Icons | `lucide-react` |
| Export CSV | `papaparse` |
| Password Hashing | `bcryptjs` |

---

## Struktur Folder

```
himpunan-website/
├── sql/schema.sql                  # DDL + seed data + RLS policy
├── next.config.js                  # Optimasi image Supabase Storage
├── .env.local                      # Kredensial Supabase (kamu buat sendiri)
│
├── public/
│   ├── logo-kampus.png             # siapkan sendiri
│   ├── logo-himpunan.png           # siapkan sendiri
│   └── ketua-himpunan.jpg          # siapkan sendiri
│
└── src/
    ├── lib/
    │   ├── supabaseClient.js       # client publik (anon key)
    │   └── supabaseAdmin.js        # client admin (service role key, SERVER ONLY)
    │
    ├── components/
    │   ├── Navbar.jsx / Footer.jsx
    │   ├── StrukturFilter.jsx      # island client untuk filter tab struktur
    │   ├── OprecPDFDocument.jsx    # layout PDF bukti pendaftaran
    │   └── admin/
    │       ├── LoginForm.jsx
    │       └── InterviewModal.jsx
    │
    └── app/
        ├── layout.jsx
        ├── page.jsx                 # Beranda (/)
        ├── tentang/page.jsx         # /tentang
        ├── struktur/page.jsx        # /struktur
        ├── proker/page.jsx          # /proker
        ├── proker/[id]/page.jsx     # /proker/[id]
        ├── aspirasi/page.jsx        # /aspirasi
        ├── oprec/page.jsx           # /oprec
        ├── admin/page.jsx           # /admin
        └── api/admin/               # Route Handlers (server-only, service role key)
            ├── login/route.js
            ├── settings/route.js
            ├── applicants/route.js
            ├── convert-officer/route.js
            ├── officers/route.js
            ├── projects/route.js
            ├── aspirations/route.js
            └── upload/route.js
```

---

## 1. Persiapan Awal

Yang kamu butuhkan sebelum mulai:
- [Node.js](https://nodejs.org) versi 18 ke atas
- Akun gratis di [supabase.com](https://supabase.com)
- Editor kode (VS Code disarankan)

---

## 2. Setup Project Next.js

```bash
npx create-next-app@latest himpunan-website
```

Saat prompt muncul, jawab:
- TypeScript? → **No**
- ESLint? → **Yes**
- Tailwind CSS? → **Yes**
- `src/` directory? → **Yes**
- App Router? → **Yes**
- Customize import alias? → **No**

```bash
cd himpunan-website
```

### Install semua dependency

```bash
npm install
```

| Package | Kegunaan |
|---|---|
| `@supabase/supabase-js` | Koneksi ke database & storage Supabase |
| `@react-pdf/renderer` | Generator PDF kartu bukti pendaftaran |
| `lucide-react` | Icon set |
| `qrcode.react` | Generate QR Code di halaman & PDF |
| `papaparse` | Export data pendaftar ke CSV di Admin Dashboard |
| `bcryptjs` | Hash password login admin |

Sekarang copy seluruh isi folder `src/`, `sql/`, `public/`, dan file `next.config.js` dari paket
yang sudah dibuat ke project ini (timpa/replace file bawaan `create-next-app` yang namanya sama,
seperti `src/app/page.jsx` dan `src/app/layout.jsx`).

---

## 3. Setup Database Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor → New Query**.
3. Copy-paste seluruh isi file `sql/schema.sql`, lalu klik **Run**.

Script ini akan membuat 7 tabel (`users`, `divisions`, `applicants`, `officers`, `projects`,
`aspirations`, `settings`), mengaktifkan Row Level Security dengan policy dasar, serta mengisi
seed data divisi (**BPH, PSDM, KOMINFO, LITBANG**) dan status awal Oprec (`closed`).

---

## 4. Environment Variables

Buat file `.env.local` di root project, isi **ketiganya sekaligus** (tidak perlu bertahap):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Ambil ketiga nilai ini dari **Supabase Dashboard → Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` → dipakai untuk semua halaman publik.
- `SUPABASE_SERVICE_ROLE_KEY` → **hanya** dipakai admin dashboard di sisi server.

> ⚠️ **PENTING:** `SUPABASE_SERVICE_ROLE_KEY` punya akses penuh ke database (bypass Row Level
> Security). JANGAN beri prefix `NEXT_PUBLIC_` pada variable ini, dan jangan pernah
> mengimpornya dari komponen `'use client'`. Pemakaiannya sudah dibatasi hanya di dalam
> `src/app/api/admin/*` (Route Handler, jalan di server). Jangan commit `.env.local` ke Git
> (sudah otomatis di-*ignore* oleh `.gitignore` bawaan Next.js).

---

## 5. Setup Storage Bucket (untuk Admin Dashboard)

Buka **Supabase Dashboard → Storage → Create a new bucket**:
- Nama bucket: `himpunan-media`
- Public bucket: **Yes** (supaya foto proker/pengurus bisa diakses publik)

---

## 6. Buat Akun Admin Pertama

Generate password hash (bcrypt) secara lokal:

```bash
node -e "console.log(require('bcryptjs').hashSync('password_kamu_di_sini', 10))"
```

Copy hasil hash yang muncul, lalu jalankan di **Supabase SQL Editor**:

```sql
INSERT INTO users (email, password_hash, role)
VALUES ('admin@himpunan.ac.id', 'PASTE_HASH_DI_SINI', 'admin');
```

---

## 7. Jalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` untuk situs publik, dan `http://localhost:3000/admin` untuk login admin
(pakai email & password yang dibuat di langkah 6).

> Catatan: 3 file gambar (`public/logo-kampus.png`, `public/logo-himpunan.png`,
> `public/ketua-himpunan.jpg`) perlu kamu siapkan sendiri agar tidak muncul gambar rusak.

---

## 8. Checklist Pengujian

- [ ] Toggle status Oprec di `/admin` → tombol "Open Recruitment" di navbar publik langsung
      muncul/hilang (real-time, tanpa refresh).
- [ ] Isi form pendaftaran di `/oprec` → dapat nomor pendaftaran `OPREC-2026-XXX` dan bisa
      unduh PDF bukti pendaftaran berisi QR Code.
- [ ] Di `/admin`, atur jadwal interview & ubah status pendaftar.
- [ ] Klik **"Jadikan Pengurus"** pada pendaftar berstatus *Lolos* → cek nama muncul di `/struktur`.
- [ ] Tambah & hapus pengurus lewat tab CMS Pengurus (dengan upload foto).
- [ ] Tambah Program Kerja baru lewat tab CMS Proker → cek muncul di `/proker`.
- [ ] Kirim aspirasi lewat `/aspirasi` (coba mode Anonim & tidak) → cek muncul di tab Inbox Aspirasi.
- [ ] Export data pendaftar ke CSV dari tab Pendaftar Oprec.

---

## Arsitektur Keamanan

- **Baca publik** (divisions, officers aktif, projects, settings) → lewat `anon key` + RLS policy.
- **Guest insert** (applicants, aspirations) → lewat `anon key` + RLS policy insert saja (tanpa login).
- **Semua operasi admin** (toggle status, update pendaftar, convert officer, CMS, upload foto, baca
  aspirasi) berjalan lewat Route Handler di `src/app/api/admin/*`, yang memverifikasi sesi admin
  sederhana (`x-admin-email` header) lalu menggunakan `service_role key` di server untuk bypass RLS
  secara aman.
- Sesi admin disimpan sederhana di `localStorage`. Cukup untuk skala organisasi mahasiswa, tapi
  bukan pengganti auth production-grade (mis. Supabase Auth + JWT) bila suatu saat butuh keamanan
  lebih tinggi.

---

## Catatan Performa

- Halaman publik (Beranda, Proker, Struktur, Tentang) memakai **ISR** (`revalidate`) supaya tidak
  query Supabase di setiap kunjungan — cache 60 detik s/d 1 jam tergantung seberapa sering
  konten berubah.
- `@react-pdf/renderer`, `qrcode.react`, dan `papaparse` di-*lazy load* — baru diunduh browser saat
  benar-benar dibutuhkan (setelah submit Oprec berhasil / klik Export CSV), bukan di initial load.
- Setiap admin mengubah data (tambah/hapus pengurus, tambah proker, toggle status), cache halaman
  publik terkait langsung di-*invalidate* (`revalidatePath`) supaya perubahan terlihat instan.
- Gambar dari Supabase Storage otomatis dikonversi ke WebP/AVIF lewat `next/image` +
  konfigurasi di `next.config.js`.
