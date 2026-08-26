-- =====================================================================
-- SCHEMA DATABASE: WEBSITE HIMPUNAN MAHASISWA
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================================

-- Extension untuk gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Table Users (Admin/Panitia Login)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Divisions (Daftar Divisi)
CREATE TABLE IF NOT EXISTS divisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- 3. Table Applicants (Pendaftar Oprec)
CREATE TABLE IF NOT EXISTS applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_number TEXT UNIQUE NOT NULL, -- Format: OPREC-2026-XXX
  full_name TEXT NOT NULL,
  nim TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_wa TEXT NOT NULL,
  major TEXT NOT NULL,
  cohort TEXT NOT NULL,
  choice_div_1 UUID REFERENCES divisions(id),
  choice_div_2 UUID REFERENCES divisions(id),
  choice_div_3 UUID REFERENCES divisions(id),
  motivation TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- Pending, Interview, Lolos, Tidak Lolos
  interview_datetime TIMESTAMP WITH TIME ZONE,
  interview_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table Officers (Struktur Pengurus)
CREATE TABLE IF NOT EXISTS officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  division_id UUID REFERENCES divisions(id),
  photo_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table Projects (Program Kerja & Galeri)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  background TEXT NOT NULL,
  achievements TEXT NOT NULL,
  division_id UUID REFERENCES divisions(id),
  photos_urls TEXT[], -- Array URL foto dari Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table Aspirations (Aspirasi Mahasiswa)
CREATE TABLE IF NOT EXISTS aspirations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT DEFAULT 'Anonim',
  email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Settings (Konfigurasi Global Website)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert default setting untuk status oprec
INSERT INTO settings (key, value)
VALUES ('oprec_status', 'closed')
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- SEED DATA: Divisi HMTI Cikarang
-- =====================================================================
INSERT INTO divisions (name, description) VALUES
  ('BPH', 'Badan Pengurus Harian — Ketua, Wakil Ketua, Sekretaris, dan Bendahara Cabang'),
  ('PSDM', 'Pengembangan Sumber Daya Mahasiswa — pelatihan dan pengembangan kompetensi anggota'),
  ('KOMINFO', 'Komunikasi & Informasi — publikasi, desain, dan media sosial himpunan'),
  ('LITBANG', 'Penelitian & Pengembangan — riset dan kajian organisasi')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- Aktifkan RLS dan buat policy dasar agar akses publik hanya bisa
-- membaca data yang relevan & insert pada tabel tertentu (guest submission)
-- =====================================================================

ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirations ENABLE ROW LEVEL SECURITY;

-- Public bisa baca divisions, officers (yang aktif), projects, settings
CREATE POLICY "Public read divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Public read officers" ON officers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Public (guest, tanpa login) boleh INSERT ke applicants & aspirations
CREATE POLICY "Public insert applicants" ON applicants FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert aspirations" ON aspirations FOR INSERT WITH CHECK (true);

-- NOTE: Untuk operasi admin (UPDATE/DELETE applicants, CRUD officers/projects,
-- toggle settings, baca aspirations), gunakan Supabase Service Role Key
-- di sisi server (route handler/API), JANGAN expose ke client.
-- Policy admin tidak dibuat permissive di sini demi keamanan; akses admin
-- akan ditangani lewat server-side logic pada TAHAP 6.
