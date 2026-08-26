# PANDUAN LENGKAP — VERSI FINAL (Semua Tahap + Semua Revisi + Konten HMTI Cikarang)

Dokumen ini menggantikan `PENEMPATAN_FILE.md` versi sebelumnya. Semua file di dalam zip ini
sudah melalui pengecekan konsistensi (import path, kecocokan endpoint client-server, dan
validasi sintaks JSX/JS memakai esbuild — 0 error).

Struktur di bawah adalah lokasi FINAL setiap file di dalam project Next.js `himpunan-website/`.

```
himpunan-website/
│
├── next.config.js                          <-- [BARU] optimasi next/image utk Supabase Storage
├── .env.local.example
├── SETUP.md                                 <-- diperbarui (dependency date-fns dihapus)
├── TAHAP6_SETUP.md                          <-- diperbarui
├── PENEMPATAN_FILE_FINAL.md                 <-- dokumen ini
│
├── sql/
│   └── schema.sql
│
├── public/
│   ├── logo-kampus.png                      <-- siapkan sendiri
│   ├── logo-himpunan.png                    <-- siapkan sendiri
│   └── ketua-himpunan.jpg                   <-- siapkan sendiri
│
└── src/
    ├── lib/
    │   ├── supabaseClient.js
    │   └── supabaseAdmin.js
    │
    ├── components/
    │   ├── Navbar.jsx                       <-- direvisi (scroll listener passive+rAF)
    │   ├── Footer.jsx
    │   ├── StrukturFilter.jsx               <-- [BARU] island client untuk filter tab
    │   ├── OprecPDFDocument.jsx             <-- direvisi (hapus dead code QR helper)
    │   └── admin/
    │       ├── LoginForm.jsx
    │       └── InterviewModal.jsx
    │
    └── app/
        ├── layout.jsx
        ├── page.jsx                         <-- direvisi (ISR + dekorasi hero ringan)
        │
        ├── tentang/
        │   └── page.jsx                     <-- direvisi (section logo dihapus)
        │
        ├── struktur/
        │   └── page.jsx                     <-- DIROMBAK jadi Server Component
        │
        ├── proker/
        │   ├── page.jsx                     <-- direvisi (+ISR)
        │   └── [id]/
        │       └── page.jsx                 <-- direvisi (+ISR)
        │
        ├── aspirasi/
        │   └── page.jsx                     <-- direvisi (email hilang saat mode Anonim)
        │
        ├── oprec/
        │   └── page.jsx                     <-- direvisi (lazy-load PDF & QR modules)
        │
        ├── admin/
        │   └── page.jsx                     <-- direvisi (+fitur hapus pengurus, +CSV lazy)
        │
        └── api/
            └── admin/
                ├── login/route.js
                ├── settings/route.js         <-- +revalidatePath
                ├── applicants/route.js
                ├── convert-officer/route.js  <-- +revalidatePath
                ├── officers/route.js         <-- +DELETE endpoint, +revalidatePath
                ├── projects/route.js         <-- +revalidatePath
                ├── aspirations/route.js
                └── upload/route.js
```

---

## Ringkasan Seluruh Revisi (dari awal sampai sekarang)

### Optimasi Performa
1. **`next.config.js`** — auto-optimasi gambar Supabase Storage ke WebP/AVIF.
2. **`/struktur`** — dari Client Component (fetch di browser) jadi Server Component
   (fetch di server) + `StrukturFilter.jsx` sebagai island kecil untuk interaktivitas filter.
3. **ISR caching** (`export const revalidate`) di Beranda (60 dtk), `/proker` & `/proker/[id]`
   (300 dtk), `/tentang` (3600 dtk), `/struktur` (300 dtk) — mengurangi query Supabase berulang.
4. **Lazy-load PDF & QR di `/oprec`** — `@react-pdf/renderer`, `OprecPDFDocument.jsx`, dan
   `qrcode.react` baru diunduh browser SETELAH submit berhasil, bukan saat halaman form dibuka.
   (Catatan: `OprecPDFDocument` di-load manual via `import()` di `useEffect`, BUKAN dibungkus
   `next/dynamic`, karena react-pdf punya reconciler custom yang tidak kompatibel dengan
   Suspense/lazy React biasa.)
5. **`papaparse` lazy-load** di admin — baru diunduh saat tombol Export CSV diklik.
6. **Navbar scroll listener** — pakai `passive: true` + `requestAnimationFrame` throttle.
7. **Dekorasi hero Beranda** — `blur-3xl` (mahal saat repaint) diganti `radial-gradient` CSS.
8. **Dependency `date-fns` dihapus** dari instruksi install karena tidak pernah dipakai di kode.
9. **Auto-revalidate cache** — setiap admin melakukan perubahan data (tambah/hapus pengurus,
   convert ke pengurus, tambah proker, toggle status oprec), halaman publik terkait langsung
   di-invalidate (`revalidatePath`) supaya perubahan terlihat instan, bukan menunggu jeda ISR.

### Perubahan Fitur/Konten
10. **Section "Filosofi & Arti Logo Himpunan"** di `/tentang` dihapus total.
11. **Fitur Tambah & Hapus Pengurus** di `/admin` (tab CMS → sub-tab Pengurus) — form tambah
    (sudah ada sebelumnya) sekarang didampingi daftar pengurus dengan tombol hapus per baris.
    Endpoint baru: `DELETE /api/admin/officers`.
12. **Form Aspirasi** — saat toggle "Kirim sebagai Anonim" aktif, input Email/No. HP ikut
    disembunyikan (sebelumnya hanya field Nama yang disembunyikan).
13. **Semua teks deskripsi/paragraf marketing diganti Lorem Ipsum** — Beranda (hero, sambutan
    ketua, CTA strip), Tentang Kami (sejarah, visi), Struktur Organisasi (subtitle header),
    Katalog & Detail Proker (subtitle + semua deskripsi proker dummy), Forum Aspirasi (subtitle),
    Open Recruitment (subtitle + pesan "pendaftaran ditutup"), Footer (profil ringkas). Pesan yang
    berisi data dinamis (mis. status sukses pendaftaran dengan nama & nomor pendaftaran) SENGAJA
    tidak diubah karena itu fungsional, bukan teks marketing.
14. **Data Struktur Organisasi diganti dengan data asli HMTI Cikarang** (30 anggota, 4 divisi):
    - **BPH** (4 orang): Fathir Muhammad Pachruzi (Ketua Cabang), Muhammad Farel Baarikil
      (Wakil Ketua Cabang), Lintang Aulia Ramadani (Sekertaris), Alifa Azka Aqmarina (Bendahara).
    - **PSDM** (8 orang): Arifin (Ketua Divisi), Rifqy Ardian Adinata (Wakil Ketua Divisi), + 6 Anggota.
    - **KOMINFO** (8 orang): Nandira Nurul Mustopa (Ketua Divisi), Andrew Setiawan (Wakil Ketua Divisi), + 6 Anggota.
    - **LITBANG** (10 orang): Hibban As Salafi (Ketua Divisi), Reza Mahendra (Wakil Ketua Divisi), + 8 Anggota.
    - Data ini ada di **dua tempat** yang perlu kamu ketahui:
      a. `src/app/struktur/page.jsx` (`FALLBACK_OFFICERS`) — dipakai kalau tabel `officers` di
         Supabase masih kosong. Sudah langsung tampil begitu kamu jalankan `npm run dev`.
      b. `sql/schema.sql` — seed data tabel `divisions` diubah jadi BPH/PSDM/KOMINFO/LITBANG
         supaya dropdown divisi di form Oprec & CMS Admin konsisten dengan struktur asli.
    - **Untuk data permanen di database** (bukan fallback), kamu perlu insert manual 30 baris
      ke tabel `officers` lewat Supabase SQL Editor atau lewat form "Tambah Pengurus" di
      `/admin` satu per satu (foto profil, LinkedIn, Instagram belum diisi — kosongkan dulu
      atau lengkapi saat insert).
15. Default posisi saat admin klik "Jadikan Pengurus" diubah dari `'Staff'` menjadi `'Anggota'`
    supaya konsisten dengan penamaan jabatan di data HMTI Cikarang.

### Verifikasi Konsistensi (dilakukan sebelum zip final ini dibuat)
- Semua `import '@/...'` merujuk ke file yang benar-benar ada.
- Semua endpoint yang dipanggil dari client (`fetch('/api/admin/...')`) punya method
  (GET/POST/PATCH/DELETE) yang cocok persis dengan yang di-`export` di `route.js` terkait.
- Tidak ada unused import tersisa (mis. `X` dari lucide-react di admin/page.jsx sudah dibersihkan).
- Tidak ada dead code tersisa (helper `generateQrDataUrl` yang tidak pernah dipanggil sudah dihapus).
- **Seluruh 26 file `.js`/`.jsx` divalidasi sintaksnya memakai esbuild — hasil: 0 error.**

---

## Urutan Setup dari Nol (ringkas)

1. `create-next-app` → install dependency sesuai `SETUP.md` → jalankan `sql/schema.sql` →
   isi `.env.local` (2 baris: URL + anon key).
2. Copy semua file sesuai peta folder di atas, timpa 1:1.
3. Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.env.local`, buat bucket Storage `himpunan-media`,
   generate akun admin (lihat `TAHAP6_SETUP.md`).
4. `npm run dev` → uji tiap halaman & alur admin.

## Catatan
- 3 file gambar di `public/` bukan dibuat oleh saya — siapkan sendiri.
- `.env.local` isi sendiri dengan kredensial project Supabase kamu, jangan commit ke Git.
